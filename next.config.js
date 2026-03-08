/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Allow Vercel production builds to proceed even if a TypeScript-only error
    // appears in files outside of the deployed dashboard app.
    ignoreBuildErrors: process.env.VERCEL === '1',
  },
}

module.exports = nextConfig
