/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly define the workspace root for Turbopack
    root: __dirname,
  },
};

module.exports = nextConfig;
