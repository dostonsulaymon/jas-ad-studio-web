import type { NextConfig } from 'next';

/**
 * Same origin, API under `/api`. In development Next forwards `/api/*` to the NestJS port so
 * the browser never calls 3040 directly; in production the tunnel routes `/api` itself.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3040';

const DEV_ALLOWED_ORIGINS = (process.env.DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', ...DEV_ALLOWED_ORIGINS],
  devIndicators: false,

  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
