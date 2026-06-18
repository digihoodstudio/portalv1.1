import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getBackendUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  try {
    const portFilePath = path.resolve(process.cwd(), '../backend_port.json');
    if (fs.existsSync(portFilePath)) {
      const data = JSON.parse(fs.readFileSync(portFilePath, 'utf-8'));
      if (data && data.port) {
        return `http://127.0.0.1:${data.port}/api`;
      }
    }
  } catch (e) {
    console.error('Failed to read dynamic backend port:', e);
  }
  return 'http://127.0.0.1:4000/api';
}

const API_URL = getBackendUrl();

async function handleProxy(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const path = params.all.join('/');
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${API_URL}/${path}?${queryString}` : `${API_URL}/${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const method = request.method;
    let body: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }
  } catch (error) {
    console.error('NextJS API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to API server.' },
      { status: 500 }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE,
};
