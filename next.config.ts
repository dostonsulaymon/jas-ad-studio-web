import type { NextConfig } from 'next';

/**
 * One origin, API under `/api` (D-032).
 *
 * In development Next forwards `/api/*` to the NestJS port, so the browser only ever
 * makes same-origin requests: no CORS, and the session cookie is a plain httpOnly
 * cookie on one host. In production the Cloudflare Tunnel routes `/api/*` itself, so
 * this rewrite must not exist there or it would shadow the tunnel's own routing.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3040';

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
