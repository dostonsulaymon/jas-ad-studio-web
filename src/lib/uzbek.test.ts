import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foldForSearch, normalizeUzbek } from './uzbek.ts';

test('keyboard apostrophes after o and g become U+02BB', () => {
  assert.equal(normalizeUzbek("ko'k g‘oya o’zbek"), 'koʻk gʻoya oʻzbek');
});

test('other apostrophes are left alone', () => {
  assert.equal(normalizeUzbek("L'Oreal"), "L'Oreal");
});

test('search folding ignores the mark entirely', () => {
  assert.equal(foldForSearch("Koʻk"), foldForSearch("ko'k"));
  assert.equal(foldForSearch('Uy-roʻzgʻor'), 'uy-rozgor');
});
