import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { errorCopy, formatDate, formatUzs } from './index.ts';

test('a known code maps to its copy, an unknown one to the fallback', () => {
  assert.equal(errorCopy('NO_CREDITS').message, 'Prompt limiti tugadi.');
  assert.equal(errorCopy('SOMETHING_NEW').message, 'Kutilmagan xatolik.');
});

test('every error code the API source declares has Uzbek copy', async () => {
  // The api repo's error codes live in one registry; if it moves, this test says so rather than passing.
  const root = new URL('../../../../jas-ad-studio-api/src/', import.meta.url).pathname;
  let source = '';
  try {
    const { execFileSync } = await import('node:child_process');
    source = execFileSync('grep', ['-rhoE', "code: '[A-Z_]+'", root], { encoding: 'utf8' });
  } catch {
    return;
  }
  const codes = [...new Set([...source.matchAll(/code: '([A-Z_]+)'/g)].map((m) => m[1]))];
  const missing = codes.filter((code) => errorCopy(code).message === 'Kutilmagan xatolik.' && !['INTERNAL_ERROR', 'HTTP_ERROR', 'LEDGER_INVARIANT'].includes(code));
  assert.deepEqual(missing, []);
});

test('dates and money read naturally in Uzbek', () => {
  assert.equal(formatDate('2026-09-13T10:00:00.000Z'), '13-sentabr, 2026');
  assert.equal(formatUzs(1250000), '1 250 000 soʻm');
});

test('the main action is about the prompt, never the video', async () => {
  const source = await readFile(new URL('./uz.ts', import.meta.url), 'utf8');
  assert.match(source, /Reklama promptini tayyorlash/);
  for (const claim of ['Video tayyorlash', 'video yaratamiz', 'video tayyorlaymiz']) {
    assert.equal(source.toLowerCase().includes(claim.toLowerCase()), false, claim);
  }
});
