import { NextRequest, NextResponse } from 'next/server';

const HEMA_API_URL = 'https://hema.ark-kay.my.id/api/lookup';

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

type HemaAPIResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: LabVisit[];
  error?: string;
};

// In-memory cache (5 min TTL)
const cache = new Map<string, { data: HemaAPIResponse; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const norm = searchParams.get('norm');

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
      signal: AbortSignal.timeout(10000), // 10s timeout
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
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout (>10s)' },
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
