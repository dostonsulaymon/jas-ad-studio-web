import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * The guard that stops the wrong apostrophe creeping back into the interface.
 *
 * Manrope could not render U+02BB at all, which is why the face is Inter (W-001). The
 * failure mode this catches is subtler than a missing glyph: someone pastes Uzbek copy
 * out of a planning document, where it is written with U+2018 LEFT SINGLE QUOTATION
 * MARK, and it renders fine but is no longer the same string the API sends. Search
 * stops matching and line breaking goes wrong, silently.
 *
 * It scans the i18n catalogue only, because that is where every visible string lives
 * (spec §8). Scanning all of `src` produced a false positive on the first run: a string
 * literal ending in `o`, like `'JAS Ad Studio'`, looks exactly like `oʻ` to a naive
 * regex. Requiring a letter after the mark fixes most of that, but `Domino's` would
 * still trip it. Restricting the scan to the one place Uzbek is allowed to live is both
 * precise and the architecture we already committed to.
 *
 * The plan called for a custom ESLint rule. This is the same guarantee without a plugin.
 */

const I18N = new URL('./i18n/', import.meta.url).pathname;
const LOOKALIKES = "'‘’´`";

/** The mark must be followed by a letter: `yo'nalish` matches, `Studio',` does not. */
const OFFENDING = new RegExp(`[oOgG][${LOOKALIKES}]\\p{L}`, 'u');

async function filesIn(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && /\.ts$/.test(e.name)).map((e) => join(dir, e.name));
  } catch {
    return [];
  }
}

test('the i18n catalogue writes Uzbek o/g with U+02BB, never a quotation mark', async () => {
  const files = await filesIn(I18N);
  const offenders: string[] = [];

  for (const path of files) {
    const lines = (await readFile(path, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (OFFENDING.test(line)) {
        offenders.push(`${path.slice(path.indexOf('/src/') + 1)}:${i + 1}  ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(
    offenders,
    [],
    `Uzbek text must use U+02BB (ʻ), not a quotation mark:\n${offenders.join('\n')}`,
  );
});

test('the guard actually catches a bad string, so a green run means something', () => {
  // A test that can never fail is worse than no test. These are the exact shapes the
  // scan above is looking for, and the exact shapes it must not flag.
  assert.equal(OFFENDING.test("yo'nalish"), true);
  assert.equal(OFFENDING.test('g‘oya'), true);
  assert.equal(OFFENDING.test('ko’rinadi'), true);

  assert.equal(OFFENDING.test('yoʻnalish'), false, 'canonical text must pass');
  assert.equal(OFFENDING.test("title: 'JAS Ad Studio',"), false, 'a closing quote is not a mark');
  assert.equal(OFFENDING.test("import x from './logo'"), false, 'an import path is not Uzbek');
});
