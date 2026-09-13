import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, headersFor } from './client.ts';
import { ApiError, toApiError } from './errors.ts';

type Call = { url: string; init: RequestInit };

function stubFetch(response: () => Response | Promise<Response>): Call[] {
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response();
  }) as typeof fetch;
  return calls;
}

test('reads carry the cookie and no CSRF header', async () => {
  const calls = stubFetch(() => Response.json({ ok: true }));
  await api.get('/api/me');
  assert.equal(calls[0].init.credentials, 'include');
  assert.equal((calls[0].init.headers as Record<string, string>)['X-Requested-With'], undefined);
});

test('every write carries X-Requested-With and the cookie', async () => {
  const calls = stubFetch(() => new Response(null, { status: 204 }));
  await api.post('/api/auth/logout');
  await api.patch('/api/projects/p-1', { json: { a: 1 } });
  await api.delete('/api/projects/p-1');
  for (const call of calls) {
    assert.equal((call.init.headers as Record<string, string>)['X-Requested-With'], 'XMLHttpRequest');
    assert.equal(call.init.credentials, 'include');
  }
  assert.equal((calls[1].init.headers as Record<string, string>)['Content-Type'], 'application/json');
});

test('the idempotency key is sent when given', () => {
  assert.equal(headersFor('POST', { idempotencyKey: 'k-1' })['Idempotency-Key'], 'k-1');
});

test('a multipart body never gets a hand-set Content-Type', () => {
  const headers = headersFor('POST', { form: new FormData(), json: {} });
  assert.equal(headers['Content-Type'], undefined);
});

test('the error envelope becomes an ApiError with its code and request id', async () => {
  stubFetch(() => Response.json({ code: 'NO_CREDITS', messageKey: 'errors.no_credits', requestId: 'r-9' }, { status: 402 }));
  await assert.rejects(api.post('/api/projects/p/generations'), (error: ApiError) => {
    assert.equal(error.code, 'NO_CREDITS');
    assert.equal(error.requestId, 'r-9');
    return true;
  });
});

test('a body that is not the envelope maps by status, and never leaks the body', () => {
  assert.equal(toApiError(413, '<html>too big</html>').code, 'UPLOAD_TOO_LARGE');
  assert.equal(toApiError(401, undefined).code, 'SESSION_EXPIRED');
  assert.equal(toApiError(500, { message: 'stack' }).code, 'INTERNAL_ERROR');
});

test('a network failure is NETWORK_OFFLINE, and an abort is rethrown untouched', async () => {
  globalThis.fetch = (async () => {
    throw new TypeError('failed');
  }) as typeof fetch;
  await assert.rejects(api.get('/api/me'), (error: ApiError) => error.code === 'NETWORK_OFFLINE');

  globalThis.fetch = (async () => {
    throw new DOMException('aborted', 'AbortError');
  }) as typeof fetch;
  await assert.rejects(api.get('/api/me'), (error: unknown) => error instanceof DOMException);
});
