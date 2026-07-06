import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  const targetUrl = `${API_BASE}/api/dashboard/`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const text = await backendRes.text();
    return new Response(text, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Backend unavailable. Ensure the backend server is running on port 4000.' },
      { status: 502 }
    );
  }
}
