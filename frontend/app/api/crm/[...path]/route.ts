import { NextRequest } from 'next/server';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

// Translate frontend path conventions to backend route conventions
function translatePath(path: string): string {
  // admin-leads -> agent-leads
  if (path.startsWith('admin-leads')) {
    return path.replace('admin-leads', 'agent-leads');
  }
  // admin/ -> agent/
  if (path.startsWith('admin/')) {
    return 'agent/' + path.slice(6);
  }
  if (path === 'admin') {
    return 'agent';
  }
  return path;
}

async function proxyRequest(req: NextRequest, params: { path: string[] }, method: string) {
  const rawPath = Array.isArray(params?.path) ? params.path.join('/') : '';
  const path = translatePath(rawPath);

  // SSE stream — handled locally (not available from Express in proxy form)
  if (path === 'stream') {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    writer.write(encoder.encode('data: {"type": "connected"}\n\n'));
    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  const targetUrl = `${API_BASE}/api/crm/${path}`;

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
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } },
) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } },
) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'POST');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } },
) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'PATCH');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } },
) {
  const resolved = await params;
  return proxyRequest(req, resolved, 'DELETE');
}
