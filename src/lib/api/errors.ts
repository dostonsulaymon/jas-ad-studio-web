/**
 * The one error type the app sees. The API's envelope is `{ code, messageKey, details?, requestId }`;
 * anything that is not a well-formed envelope (a proxy's HTML page, an empty body) is flattened to a
 * code the catalogue has copy for, so a raw stack trace never reaches a seller.
 */

export const CLIENT_CODES = {
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(init: { code: string; status: number; requestId?: string; details?: unknown }) {
    super(`${init.code} (HTTP ${init.status})`);
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status;
    this.requestId = init.requestId;
    this.details = init.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Statuses that can arrive without a JSON body, e.g. a 413 from the proxy on a large upload. */
export function codeForStatus(status: number): string {
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return 'CROSS_ORIGIN_REFUSED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 413) return 'UPLOAD_TOO_LARGE';
  if (status === 415) return 'UPLOAD_TYPE';
  if (status === 429) return 'RATE_LIMITED';
  return CLIENT_CODES.INTERNAL_ERROR;
}

export function toApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    const envelope = body as { code: string; requestId?: string; details?: unknown };
    return new ApiError({
      code: envelope.code,
      status,
      requestId: typeof envelope.requestId === 'string' ? envelope.requestId : undefined,
      details: envelope.details,
    });
  }
  return new ApiError({ code: codeForStatus(status), status });
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
