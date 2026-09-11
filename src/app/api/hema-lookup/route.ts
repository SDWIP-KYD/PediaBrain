import { NextRequest, NextResponse } from 'next/server';

// Worst-case quick lookup: 2 attempts x 20s + 1.5s backoff ≈ 42s
export const maxDuration = 60;

const HEMA_API_URL = 'https://hema.ark-kay.my.id/api/lookup';
const HEMA_JOB_START_URL = 'https://hema.ark-kay.my.id/api/lookup-job/start';
const HEMA_JOB_STATUS_URL = 'https://hema.ark-kay.my.id/api/lookup-job/status';

async function fetchJSON(url: string, timeoutMs = 25000): Promise<unknown> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'PediaBrain/1.0' },
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Hema API returned ${response.status}`);
  }
  return response.json();
}

// Response types from Hema API
type LabParam = {
  name: string;
  hasil: string;
  normal: string;
  satuan: string;
};

type LabVisit = {
  tgl: string;
  params: LabParam[];
};

// Special module items (PA/Rad/BMP/LCS/Immuno/IHC)
type SpecialItem = {
  tanggal?: string;
  klinis?: string;
  kesan?: string;
  kesimpulan?: string;
  hasil?: string;
  jenis?: string;
};

type SpecialResult = {
  pa: SpecialItem[];
  rad: SpecialItem[];
  bmp: SpecialItem[];
  lcs: SpecialItem[];
  immuno: SpecialItem[];
  ihc: SpecialItem[];
};

type HemaAPIResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: LabVisit[];
  special?: SpecialResult;
  total_records?: number;
  is_partial?: boolean;
  full_estimate?: number;
  error?: string;
};

// In-memory cache (5 min TTL)
const cache = new Map<string, { data: HemaAPIResponse; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const norm = searchParams.get('norm');
  const jobId = searchParams.get('job');
  const wantFull = searchParams.get('full') === '1';

  // --- Job status polling: GET /api/hema-lookup?job=<id> ---
  if (jobId) {
    if (!/^[a-f0-9]{8,32}$/.test(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job id' },
        { status: 400 }
      );
    }
    try {
      const result = (await fetchJSON(
        `${HEMA_JOB_STATUS_URL}/${jobId}`,
        15000
      )) as HemaAPIResponse & { job_status?: string };
      return NextResponse.json(result);
    } catch (error: unknown) {
      console.error('Hema job status error:', error);
      return NextResponse.json(
        { success: false, error: 'Job status check failed' },
        { status: 502 }
      );
    }
  }

  // --- Start full-fetch background job: GET /api/hema-lookup?norm=X&full=1 ---
  if (norm && wantFull) {
    if (!/^\d{3,8}$/.test(norm)) {
      return NextResponse.json(
        { success: false, error: 'NORM must be 3-8 digits' },
        { status: 400 }
      );
    }
    try {
      const refresh = searchParams.get('refresh') === '1';
      const started = (await fetchJSON(
        `${HEMA_JOB_START_URL}/${norm}?special=1${refresh ? '&refresh=1' : ''}`
      )) as {
        success: boolean;
        job_id?: string;
        error?: string;
      };
      if (!started.success || !started.job_id) {
        return NextResponse.json(
          { success: false, error: started.error || 'Failed to start job' },
          { status: 502 }
        );
      }
      return NextResponse.json({ success: true, job_id: started.job_id, status: started.success ? 'started' : 'error' });
    } catch (error: unknown) {
      console.error('Hema job start error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to start full fetch' },
        { status: 502 }
      );
    }
  }

  // --- Quick lookup (default): GET /api/hema-lookup?norm=X ---
  // Validation
  if (!norm) {
    return NextResponse.json(
      { success: false, error: 'NORM parameter required' },
      { status: 400 }
    );
  }

  if (!/^\d{3,8}$/.test(norm)) {
    return NextResponse.json(
      { success: false, error: 'NORM must be 3-8 digits' },
      { status: 400 }
    );
  }

  // Check cache
  const cached = cache.get(norm);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  // Fetch from Hema API — with one automatic retry for transient failures.
  // Cold SIMRS lookups under multi-RM bursts can exceed a single attempt's
  // budget; a retry often succeeds because the first attempt warms server
  // state. 4xx responses (invalid NORM etc.) are returned immediately.
  const QUICK_TIMEOUT_MS = 20000;
  const QUICK_ATTEMPTS = 2;
  const url = `${HEMA_API_URL}/${norm}?special=1&quick=1&max=3`;

  let lastError = 'Network error';
  let lastStatus = 502;

  for (let attempt = 0; attempt < QUICK_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'PediaBrain/1.0',
        },
        signal: AbortSignal.timeout(QUICK_TIMEOUT_MS),
      });

      if (response.ok) {
        const data: HemaAPIResponse = await response.json();
        if (data.success) {
          cache.set(norm, { data, expires: Date.now() + CACHE_TTL });
        }
        return NextResponse.json(data);
      }

      lastStatus = response.status;
      lastError = `Hema API returned ${response.status}`;
      if (response.status < 500 && response.status !== 429) {
        // client-side error (e.g. 400/404) — retrying is pointless
        return NextResponse.json(
          { success: false, error: lastError },
          { status: response.status }
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastStatus = 504;
        lastError = `Request timeout (>${QUICK_TIMEOUT_MS / 1000}s)`;
      } else {
        lastStatus = 502;
        lastError = 'Network error';
        console.error('Hema API error:', error);
      }
    }
  }

  return NextResponse.json(
    { success: false, error: `${lastError} (setelah ${QUICK_ATTEMPTS}x percobaan)` },
    { status: lastStatus }
  );
}
