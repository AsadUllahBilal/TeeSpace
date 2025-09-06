import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      // cache for a day to reduce API calls; adjust as needed
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data?.data ?? []);
  } catch (error) {
    console.error('Countries API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


