import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * The guard that keeps quotation marks out of Uzbek copy. A `‘` pasted from a planning document
 * renders fine and silently breaks search and line breaking, so the catalogue is scanned: a mark
 * between `o`/`g` and a letter fails the build. Comments are English and are skipped.
 */

const I18N = new URL('./i18n/', import.meta.url).pathname;
const LOOKALIKES = "'‘’´`";
export const OFFENDING = new RegExp(`[oOgG][${LOOKALIKES}]\\p{L}`, 'u');

function isComment(line: string): boolean {
  return /^\s*(\/\/|\/\*|\*)/.test(line);
}

test('the i18n catalogue writes Uzbek o/g with U+02BB, never a quotation mark', async () => {
  const entries = await readdir(I18N, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.test.ts'))
    .map((e) => join(I18N, e.name));
  assert.ok(files.length > 0, 'the catalogue must exist');

  const offenders: string[] = [];
  for (const path of files) {
    (await readFile(path, 'utf8')).split('\n').forEach((line, i) => {
      if (!isComment(line) && OFFENDING.test(line)) offenders.push(`${path}:${i + 1}  ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, [], `Use U+02BB (ʻ), not a quotation mark:\n${offenders.join('\n')}`);
});

test('the guard catches every lookalike and passes canonical text', () => {
  for (const bad of ["yo'nalish", 'g‘oya', 'ko’rinadi', 'o´zbek', 'o`zbek']) {
    assert.equal(OFFENDING.test(bad), true, bad);
  }
  assert.equal(OFFENDING.test('yoʻnalish'), false);
  assert.equal(OFFENDING.test("title: 'Promptly',"), false);
  assert.equal(isComment(" * the api repo's main"), true);
});

test('the catalogue has no em dash in visible copy', async () => {
  const source = await readFile(join(I18N, 'uz.ts'), 'utf8');
  const lines = source.split('\n').filter((line) => !isComment(line) && /[—–]/.test(line));
  assert.deepEqual(lines, []);
});
