import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportFilename, pollUntilDone, readyVersions, toPlainText } from './generation.ts';
import type { AdPackage, GenerationDetail } from './api/types.ts';

const base: GenerationDetail = {
  id: 'g', projectId: 'p', status: 'queued', questionsUz: [], messageUz: null, errorCode: null,
  createdAt: '2026-09-12T10:00:00Z', finishedAt: null, package: null,
};

const pkg = {
  generationId: 'g', promptEn: 'PROMPT BODY', createdAt: '2026-09-12T10:00:00Z',
  result: {
    concept: { titleUz: 'Gʻoya', rationaleUz: 'Sabab', hookUz: 'Ilk', ctaUz: 'Chaqiriq', formatId: 'product-film' },
    shots: [{ startSeconds: 0, endSeconds: 3.5, descriptionUz: 'Kadr', cameraUz: 'Sekin' }],
  },
} as unknown as AdPackage;

test('versions are the ready ones, oldest first, whatever order the API lists', () => {
  const list: GenerationDetail[] = [
    { ...base, id: 'new', status: 'ready', createdAt: '2026-09-13T00:00:00Z', package: pkg },
    { ...base, id: 'failed', status: 'failed', createdAt: '2026-09-12T12:00:00Z' },
    { ...base, id: 'old', status: 'ready', createdAt: '2026-09-12T00:00:00Z', package: pkg },
  ];
  assert.deepEqual(readyVersions(list).map((g) => g.id), ['old', 'new']);
});

test('polling stops at a final state and survives a transient failure', async () => {
  const replies: Array<() => Response> = [
    () => Response.json({ ...base, status: 'running' }),
    () => { throw new TypeError('blip'); },
    () => Response.json({ ...base, status: 'ready', package: pkg }),
  ];
  let calls = 0;
  globalThis.fetch = (async () => replies[calls++]()) as typeof fetch;
  const seen: string[] = [];
  const done = await pollUntilDone('g', { wait: async () => {}, onStatus: (s) => seen.push(s) });
  assert.equal(done.status, 'ready');
  assert.deepEqual(seen, ['running', 'ready']);
});

test('polling gives up immediately on 404', async () => {
  globalThis.fetch = (async () => Response.json({ code: 'GENERATION_NOT_FOUND' }, { status: 404 })) as typeof fetch;
  await assert.rejects(pollUntilDone('g', { wait: async () => {} }), (e: { code: string }) => e.code === 'GENERATION_NOT_FOUND');
});

test('the TXT export ends with the prompt verbatim and says Flow makes the video', () => {
  const text = toPlainText(pkg, { concept: 'Gʻoya', hook: 'Ilk jumla', cta: 'Chaqiriq', shots: 'Kadrlar', camera: 'Kamera', prompt: 'Prompt', footer: 'Videoni Google Flow tayyorlaydi.' });
  assert.match(text, /0-3\.5s/);
  assert.ok(text.includes('\n\nPROMPT BODY\n\n'));
  assert.ok(text.endsWith('Videoni Google Flow tayyorlaydi.'));
});

test('export filenames are ascii and dated', () => {
  assert.equal(exportFilename('Pixel 9a, 128 GB', '2026-09-12T18:20:00Z'), 'pixel-9a-128-gb-2026-09-12.txt');
  assert.equal(exportFilename('Koʻk', '2026-09-12'), 'ko-k-2026-09-12.txt');
});
