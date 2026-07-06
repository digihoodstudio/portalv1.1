/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  async redirects() {
    return [
      { source: '/services', destination: '/#services', permanent: true },
      { source: '/pricing', destination: '/#pricing', permanent: true },
      { source: '/assistant', destination: '/#assistant', permanent: true },
    ];
  },
};

export default nextConfig;
