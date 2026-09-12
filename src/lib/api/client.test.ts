import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { api } from './client.ts';
import { ApiError, isApiError } from './errors.ts';

/** Every call fetch received, so the tests can assert on headers and credentials. */
let calls: Array<{ url: string; init: RequestInit }> = [];
const realFetch = globalThis.fetch;

function respondWith(make: () => Response | Promise<Response> | never) {
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return make();
  }) as unknown as typeof fetch;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  calls = [];
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

test('a write sends X-Requested-With and same-origin credentials', async () => {
  respondWith(() => json(201, { id: 'p1' }));
  await api.post('/api/projects', { json: { productName: 'Pixel 9a' } });

  const { init } = calls[0];
  const headers = init.headers as Record<string, string>;
  assert.equal(headers['X-Requested-With'], 'XMLHttpRequest');
  assert.equal(headers['Content-Type'], 'application/json');
  assert.equal(init.credentials, 'same-origin');
  assert.equal(init.method, 'POST');
});

test('a read sends no X-Requested-With: the API does not require it on safe methods', async () => {
  respondWith(() => json(200, { id: 'u1' }));
  await api.get('/api/me');

  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['X-Requested-With'], undefined);
  assert.equal(calls[0].init.credentials, 'same-origin');
});

test('a multipart body is sent without a hand-set Content-Type', async () => {
  // Setting it by hand drops the multipart boundary and the server cannot parse it.
  respondWith(() => json(201, { id: 'a1' }));
  const form = new FormData();
  form.append('photo', new Blob(['x']), 'photo.jpg');
  await api.post('/api/projects/p1/assets', { form });

  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['Content-Type'], undefined);
  assert.equal(headers['X-Requested-With'], 'XMLHttpRequest');
});

test('the documented error envelope arrives intact, requestId included', async () => {
  respondWith(() =>
    json(401, {
      code: 'SESSION_EXPIRED',
      messageKey: 'errors.session_expired',
      requestId: 'ae7a54dd-3a04-4896-949e-b47822f51633',
    }),
  );

  const error = await api.get('/api/me').catch((e: unknown) => e);
  assert.ok(isApiError(error));
  assert.equal(error.code, 'SESSION_EXPIRED');
  assert.equal(error.messageKey, 'errors.session_expired');
  assert.equal(error.status, 401);
  assert.equal(error.requestId, 'ae7a54dd-3a04-4896-949e-b47822f51633');
});

test('an envelope without messageKey gets one derived the way the API derives it', async () => {
  respondWith(() => json(404, { code: 'PROJECT_NOT_FOUND' }));

  const error = (await api.get('/api/projects/x').catch((e: unknown) => e)) as ApiError;
  assert.equal(error.messageKey, 'errors.project_not_found');
  assert.equal(error.status, 404);
});

test('a 413 with an empty body becomes UPLOAD_TOO_LARGE, not a shrug', async () => {
  // Measured in P2: a 12 MB upload returns 413, and a proxy may send no JSON at all.
  respondWith(() => new Response('', { status: 413 }));

  const error = (await api.post('/api/projects/p1/assets', { form: new FormData() }).catch(
    (e: unknown) => e,
  )) as ApiError;
  assert.equal(error.code, 'UPLOAD_TOO_LARGE');
  assert.equal(error.messageKey, 'errors.upload_too_large');
});

test('a 500 with an HTML body never leaks the HTML', async () => {
  const html = '<!doctype html><h1>Error: connect ECONNREFUSED 127.0.0.1:5437</h1>';
  respondWith(() => new Response(html, { status: 500, headers: { 'Content-Type': 'text/html' } }));

  const error = (await api.get('/api/projects').catch((e: unknown) => e)) as ApiError;
  assert.equal(error.code, 'INTERNAL_ERROR');
  assert.ok(!error.message.includes('ECONNREFUSED'), 'the raw body must not reach the message');
  assert.equal(error.details, undefined);
});

test('a network failure becomes NETWORK_OFFLINE, not an unhandled rejection', async () => {
  respondWith(() => {
    throw new TypeError('Failed to fetch');
  });

  const error = (await api.get('/api/me').catch((e: unknown) => e)) as ApiError;
  assert.ok(isApiError(error));
  assert.equal(error.code, 'NETWORK_OFFLINE');
  assert.equal(error.status, 0);
});

test('an abort is rethrown as an abort, not dressed up as a network error', async () => {
  // A cancelled request is the caller's own doing and must not show an error to anyone.
  respondWith(() => {
    throw new DOMException('The operation was aborted.', 'AbortError');
  });

  const error = (await api.get('/api/me').catch((e: unknown) => e)) as Error;
  assert.equal(isApiError(error), false);
  assert.equal(error.name, 'AbortError');
});

test('a 204 resolves to undefined without trying to parse a body', async () => {
  respondWith(() => new Response(null, { status: 204 }));
  assert.equal(await api.post('/api/auth/logout'), undefined);
  assert.equal(await api.delete('/api/projects/p1'), undefined);
});

test('a 200 with an empty body does not throw a JSON parse error', async () => {
  respondWith(() => new Response('', { status: 200 }));
  assert.equal(await api.get('/api/projects'), undefined);
});

test('the Error message carries the code and status for logs, and nothing else', async () => {
  respondWith(() => json(404, { code: 'ASSET_NOT_FOUND' }));
  const error = (await api.get('/api/assets/x/reference').catch((e: unknown) => e)) as ApiError;
  assert.equal(error.message, 'ASSET_NOT_FOUND (HTTP 404)');
  assert.equal(error.name, 'ApiError');
});
