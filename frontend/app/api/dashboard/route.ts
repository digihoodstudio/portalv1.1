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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let data;
      try {
        data = contentType?.includes('application/json') ? await response.json() : { error: 'Server error' };
      } catch {
        data = { error: 'Server error' };
      }
      return NextResponse.json(
        { error: data.error || 'Dashboard fetch failed' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to API server. Is the backend running on port 4000?' },
      { status: 500 }
    );
  }
}
