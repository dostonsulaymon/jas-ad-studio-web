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

/**
 * Hosts the dev server will answer for, besides localhost.
 *
 * Next 16 refuses dev requests from an unrecognised host, which is right: a dev server
 * is not meant to be on the internet. A Cloudflare quick tunnel is exactly that case, so
 * the host goes in an env var rather than the file, and is absent by default.
 *
 *   DEV_ALLOWED_ORIGINS=foo.trycloudflare.com pnpm dev
 */
const DEV_ALLOWED_ORIGINS = (process.env.DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', ...DEV_ALLOWED_ORIGINS],

  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
