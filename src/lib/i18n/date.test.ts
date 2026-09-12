import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from './index.ts';

test('dates read as Uzbek, not as ICU fallback codes', () => {
  // Intl on this Node build renders uz-Latn-UZ months as "M09", which looks broken.
  assert.equal(formatDate('2026-09-12T10:42:33.741Z'), '12-sentabr, 2026');
  assert.equal(formatDate('2026-01-01T00:00:00.000Z'), '1-yanvar, 2026');
  assert.equal(formatDate('2026-12-31T23:00:00.000Z'), '1-yanvar, 2027');
  for (const bad of ['', 'not-a-date']) assert.equal(formatDate(bad), '');
});
