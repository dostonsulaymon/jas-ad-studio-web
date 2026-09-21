import { ApiError, CLIENT_CODES, isAbort, toApiError } from './errors.ts';

/**
 * The only module that talks to the API. Components never call fetch or XMLHttpRequest.
 *
 * Every rule the API enforces on a caller lives here: same-origin `/api`, the session cookie on
 * every request, `X-Requested-With` on every write (the CSRF guard answers 403 without it), and
 * `Idempotency-Key` where a route needs one.
 */

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  json?: unknown;
  /** Multipart body. Never given a Content-Type by hand: the browser adds the boundary. */
  form?: FormData;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export const REQUESTED_WITH = 'XMLHttpRequest';

export function headersFor(method: Method, options: RequestOptions = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (method !== 'GET') headers['X-Requested-With'] = REQUESTED_WITH;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  if (options.json !== undefined && !options.form) headers['Content-Type'] = 'application/json';
  return headers;
}

function parse(raw: string): unknown {
  try {
    return raw.length > 0 ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  let body: BodyInit | undefined;
  if (options.form) body = options.form;
  else if (options.json !== undefined) body = JSON.stringify(options.json);

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: headersFor(method, options),
      body,
      credentials: 'include',
      signal: options.signal,
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError({ code: CLIENT_CODES.NETWORK_OFFLINE, status: 0 });
  }

  if (response.status === 204) return undefined as T;
  const parsed = parse(await response.text());
  if (!response.ok) throw toApiError(response.status, parsed);
  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

/**
 * A multipart upload with progress. fetch cannot report upload progress, so this one call uses
 * XMLHttpRequest, with the same credentials and CSRF header the wrapper sets.
 */
export function uploadWithProgress<T>(
  path: string,
  field: string,
  file: File,
  onProgress: (percent: number) => void,
): { promise: Promise<T>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<T>((resolve, reject) => {
    const form = new FormData();
    form.append(field, file);

    xhr.open('POST', path);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('X-Requested-With', REQUESTED_WITH);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      const parsed = parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) resolve(parsed as T);
      else reject(toApiError(xhr.status, parsed));
    };
    xhr.onerror = () => reject(new ApiError({ code: CLIENT_CODES.NETWORK_OFFLINE, status: 0 }));
    xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'));

    onProgress(0);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}

export { ApiError, fieldIssues, isApiError, isAbort } from './errors.ts';
export type { FieldIssue } from './errors.ts';
