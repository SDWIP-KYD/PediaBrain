import { NextRequest, NextResponse } from 'next/server';

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

  // Fetch from Hema API
  try {
    const url = `${HEMA_API_URL}/${norm}?special=1&quick=1&max=3`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'PediaBrain/1.0',
      },
      signal: AbortSignal.timeout(25000), // 25s: cold SIMRS lookups can take ~9s; headroom for fan-out bursts
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Hema API returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data: HemaAPIResponse = await response.json();

    // Cache successful response
    if (data.success) {
      cache.set(norm, { data, expires: Date.now() + CACHE_TTL });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout (>25s)' },
        { status: 504 }
      );
    }

    console.error('Hema API error:', error);
    return NextResponse.json(
      { success: false, error: 'Network error' },
      { status: 500 }
    );
  }
}
