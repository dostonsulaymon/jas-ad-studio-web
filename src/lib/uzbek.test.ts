import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MODIFIER_APOSTROPHE,
  TURNED_COMMA,
  hasUzbekLookalike,
  normalizeUzbek,
} from './uzbek.ts';

test('normalises every apostrophe a seller can type to U+02BB', () => {
  assert.equal(normalizeUzbek("o'zbek"), `o${TURNED_COMMA}zbek`);
  assert.equal(normalizeUzbek('o‘zbek'), `o${TURNED_COMMA}zbek`);
  assert.equal(normalizeUzbek('o’zbek'), `o${TURNED_COMMA}zbek`);
  assert.equal(normalizeUzbek('o´zbek'), `o${TURNED_COMMA}zbek`);
  assert.equal(normalizeUzbek('o`zbek'), `o${TURNED_COMMA}zbek`);
});

test('is idempotent: already-canonical text is left exactly as it is', () => {
  const canonical = `o${TURNED_COMMA}zbek yo${TURNED_COMMA}nalish, g${TURNED_COMMA}oya`;
  assert.equal(normalizeUzbek(canonical), canonical);
  assert.equal(normalizeUzbek(normalizeUzbek(canonical)), canonical);
});

test('handles g and both capitals, not just lowercase o', () => {
  assert.equal(normalizeUzbek("g'oya"), `g${TURNED_COMMA}oya`);
  assert.equal(normalizeUzbek("O'zbekiston"), `O${TURNED_COMMA}zbekiston`);
  assert.equal(normalizeUzbek("G'ANIEV"), `G${TURNED_COMMA}ANIEV`);
});

test('rewrites every occurrence in a sentence, not only the first', () => {
  assert.equal(
    normalizeUzbek("yo'nalish, ko'rinadi, g'oya, bo'ylab"),
    `yo${TURNED_COMMA}nalish, ko${TURNED_COMMA}rinadi, g${TURNED_COMMA}oya, bo${TURNED_COMMA}ylab`,
  );
});

test("leaves a real apostrophe alone when it is not after o or g", () => {
  // A brand name is not a misspelling. Rewriting this would corrupt a seller's own
  // product name, which is exactly the kind of invented edit the product lock forbids.
  assert.equal(normalizeUzbek("L'Oreal"), "L'Oreal");
  assert.equal(normalizeUzbek("d'Artagnan"), "d'Artagnan");
  assert.equal(normalizeUzbek("can't"), "can't");
});

test('leaves the tutuq belgisi alone: it is a different letter', () => {
  // `aʼlo` takes U+02BC, and it does not follow o or g, so nothing touches it.
  const text = `a${MODIFIER_APOSTROPHE}lo darajada`;
  assert.equal(normalizeUzbek(text), text);
});

test('normalises Unicode form so a decomposed string still matches', () => {
  // Composed and decomposed forms of the same word must normalise identically, or two
  // sellers typing the same product name produce two different rows.
  const composed = 'Shoʻrva';
  const decomposed = 'Shoʻrva'.normalize('NFD');
  assert.equal(normalizeUzbek(decomposed), normalizeUzbek(composed));
});

test('survives the empty string and text with no marks at all', () => {
  assert.equal(normalizeUzbek(''), '');
  assert.equal(normalizeUzbek('Pixel 9a, 128 GB'), 'Pixel 9a, 128 GB');
});

test('hasUzbekLookalike finds what normalisation would change', () => {
  assert.equal(hasUzbekLookalike("o'zbek"), true);
  assert.equal(hasUzbekLookalike('g‘oya'), true);
  assert.equal(hasUzbekLookalike(`o${TURNED_COMMA}zbek`), false);
  assert.equal(hasUzbekLookalike("L'Oreal"), false);
});

test('round-trips the real Uzbek the API actually sends', () => {
  // Lifted from out/pack/02-02-rotary-phone/full-report.md, which is already canonical.
  const fromApi =
    'Makro boshlanish: kadrda telefonning old yuqori qismi koʻrinadi. ' +
    'Yorugʻlik sirt boʻylab yuradi.';
  assert.equal(normalizeUzbek(fromApi), fromApi);
  assert.equal(hasUzbekLookalike(fromApi), false);
});
