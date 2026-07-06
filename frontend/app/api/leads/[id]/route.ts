import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

async function proxyToBackend(req: NextRequest, path: string, method: string) {
  const targetUrl = `${API_BASE}/api/leads/${path}`;

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
    const backendRes = await fetch(targetUrl, { method, headers, body });
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(req, id, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(req, id, 'DELETE');
}
