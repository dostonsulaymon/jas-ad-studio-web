/**
 * The one error type the rest of the app sees.
 *
 * The API's envelope is `{ code, messageKey, details?, requestId }` (spec §9), and the
 * web app maps `messageKey` to an Uzbek message plus a recovery action. Raw provider and
 * framework errors never reach a seller, so anything that is not a well-formed envelope
 * is flattened to a code we do have a message for.
 */

/** Codes the client raises itself, which the API can never send. */
export const CLIENT_CODES = {
  /** fetch rejected: no network, DNS failure, the tunnel is down. */
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  /** The response was not the documented envelope. Never shown raw. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export class ApiError extends Error {
  readonly code: string;
  readonly messageKey: string;
  readonly status: number;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(init: {
    code: string;
    messageKey?: string;
    status: number;
    requestId?: string;
    details?: unknown;
  }) {
    // The Error message is for logs and stack traces only. Nothing renders it: the UI
    // renders t(messageKey), so a seller never sees an English string by accident.
    super(`${init.code} (HTTP ${init.status})`);
    this.name = 'ApiError';
    this.code = init.code;
    this.messageKey = init.messageKey ?? messageKeyFor(init.code);
    this.status = init.status;
    this.requestId = init.requestId;
    this.details = init.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** The API's own convention, mirrored so client-raised codes key the same way. */
export function messageKeyFor(code: string): string {
  return `errors.${code.toLowerCase()}`;
}

/**
 * Codes for the statuses the API can return without a JSON body.
 *
 * A 413 from a proxy, for example, arrives with an HTML body or none at all, and P2's
 * upload limit is measured: a 12 MB file returns 413. Turning that into "Rasm juda
 * katta" is much better than "Kutilmagan xatolik".
 */
export function codeForStatus(status: number): string {
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return 'CROSS_ORIGIN_REFUSED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 413) return 'UPLOAD_TOO_LARGE';
  if (status === 415) return 'UPLOAD_TYPE';
  if (status === 429) return 'RATE_LIMITED';
  return CLIENT_CODES.INTERNAL_ERROR;
}

/**
 * Build an ApiError from a response body that may be anything at all: the documented
 * envelope, an HTML error page from a proxy, or nothing.
 */
export function toApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    const envelope = body as {
      code: string;
      messageKey?: string;
      requestId?: string;
      details?: unknown;
    };
    return new ApiError({
      code: envelope.code,
      messageKey: typeof envelope.messageKey === 'string' ? envelope.messageKey : undefined,
      status,
      requestId: envelope.requestId,
      details: envelope.details,
    });
  }

  // Not the documented shape. The body is discarded rather than surfaced: it could be
  // an HTML stack trace, and a seller must never be shown one.
  return new ApiError({ code: codeForStatus(status), status });
}
