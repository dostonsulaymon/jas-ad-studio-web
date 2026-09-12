import { ApiError, CLIENT_CODES, toApiError } from './errors.ts';

/**
 * The only place in the app that calls fetch.
 *
 * Everything the API requires of a caller lives here, so no component can forget it:
 * same-origin `/api` (D-032), credentials on every request so the httpOnly session
 * cookie rides along, and `X-Requested-With` on every state-changing verb. The API's
 * CSRF guard refuses a write without both a same-origin `Origin` and that header
 * (spec §10), so omitting it returns CROSS_ORIGIN_REFUSED rather than working.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  /** JSON body. Mutually exclusive with `form`. */
  json?: unknown;
  /** multipart body, for photo upload. Never given a Content-Type by hand. */
  form?: FormData;
  signal?: AbortSignal;
  /**
   * Idempotency-Key, required by POST /api/projects/:id/generations.
   *
   * Named rather than a generic headers bag, for the same reason this file exists: what
   * the API demands of a caller lives here, so no component can forget it. The API
   * returns the same job for a repeated key and charges once (source 01 §32), so the
   * caller must reuse one key across retries of an attempt — see newIdempotencyKey.
   */
  idempotencyKey?: string;
}

/**
 * The header value is arbitrary. What matters is that a cross-origin HTML form post
 * cannot set a custom header at all, which is the property the API's guard relies on.
 */
const REQUESTED_WITH = 'XMLHttpRequest';

async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (!SAFE_METHODS.has(method)) headers['X-Requested-With'] = REQUESTED_WITH;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  let body: BodyInit | undefined;
  if (options.form) {
    // Deliberately no Content-Type: the browser has to set it with the multipart
    // boundary, and setting it by hand produces a body the server cannot parse.
    body = options.form;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body,
      credentials: 'same-origin',
      signal: options.signal,
    });
  } catch (error) {
    // fetch only rejects for network-level failures. An abort is the caller's own
    // doing and is rethrown untouched so it is not shown as an error to the seller.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError({ code: CLIENT_CODES.NETWORK_OFFLINE, status: 0 });
  }

  if (response.status === 204) return undefined as T;

  const raw = await response.text();
  let parsed: unknown;
  try {
    parsed = raw.length > 0 ? JSON.parse(raw) : undefined;
  } catch {
    parsed = undefined;
  }

  if (!response.ok) throw toApiError(response.status, parsed);

  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

export { ApiError, isApiError } from './errors.ts';
