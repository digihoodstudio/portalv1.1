import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBackendUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  try {
    const portFilePath = path.resolve(__dirname, '../backend_port.json');
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

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  async rewrites() {
    const apiUrl = getBackendUrl();
    return {
      // Proxy the backend auth endpoints before NextAuth's /api/auth/[...nextauth] route claims them.
      beforeFiles: [
        { source: '/api/auth/login', destination: `${apiUrl}/auth/login` },
        { source: '/api/auth/register', destination: `${apiUrl}/auth/register` }
      ],
      afterFiles: [],
      // Everything else under /api (except NextAuth's own routes) proxies to the backend.
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`
        }
      ]
    };
  }
};

export default nextConfig;
