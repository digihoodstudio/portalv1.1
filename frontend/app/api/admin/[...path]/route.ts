import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

async function proxyRequest(req: NextRequest, params: { path: string[] }, method: string) {
  const path = Array.isArray(params?.path) ? params.path.join('/') : '';

  const targetUrl = `${API_BASE}/api/admin/${path}`;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.text().catch(() => undefined);
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const text = await backendRes.text();
    return new Response(text, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Backend unavailable. Ensure the backend server is running on port 4000.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'POST');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'DELETE');
}
