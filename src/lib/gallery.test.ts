import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aspectFromSize, categoriesPresent, filterCards, slugify, stylesPresent } from './gallery.ts';
import type { GalleryCard } from './api/types.ts';

const card = (over: Partial<GalleryCard>): GalleryCard => ({
  id: 'x', slug: 'x', titleUz: 'X', category: 'kiyim', style: 'product-film', videoUrl: '', posterUrl: '',
  aspectRatio: '9:16', durationSeconds: 10, conceptUz: '', sourceType: 'app-prompt', sourceNote: '', ...over,
});

const cards = [
  card({ id: 'phone', titleUz: 'Vaqtni eslatuvchi qora telefon', category: 'uy-rozgor' }),
  card({ id: 'notebook', titleUz: 'Tartibli kun uchun sokin koʻk daftar', category: 'aksessuar' }),
  card({ id: 'wipes', titleUz: 'Har kuni qoʻl yetadigan tozalik', category: 'uy-rozgor', style: 'lifestyle-story' }),
];

const labels = {
  category: (c: string) => ({ 'uy-rozgor': 'Uy-roʻzgʻor', aksessuar: 'Aksessuar' })[c] ?? c,
  style: (s: string) => ({ 'product-film': 'Studiya filmi', 'lifestyle-story': 'Hayotiy hikoya' })[s] ?? s,
};

const ids = (list: GalleryCard[]) => list.map((c) => c.id);

test('chips list only categories that exist, in catalogue order', () => {
  assert.deepEqual(categoriesPresent(cards), ['uy-rozgor', 'aksessuar']);
  assert.deepEqual(stylesPresent(cards), ['product-film', 'lifestyle-story']);
});

test('search matches the title, apostrophe-blind', () => {
  assert.deepEqual(ids(filterCards(cards, { query: "ko'k", category: null, style: null }, labels)), ['notebook']);
  assert.deepEqual(ids(filterCards(cards, { query: 'TELEFON', category: null, style: null }, labels)), ['phone']);
});

test('search matches category and format labels too', () => {
  assert.deepEqual(ids(filterCards(cards, { query: 'uy-rozgor', category: null, style: null }, labels)), ['phone', 'wipes']);
  assert.deepEqual(ids(filterCards(cards, { query: 'hayotiy', category: null, style: null }, labels)), ['wipes']);
});

test('chips and search combine', () => {
  assert.deepEqual(ids(filterCards(cards, { query: 'har', category: 'uy-rozgor', style: 'lifestyle-story' }, labels)), ['wipes']);
  assert.deepEqual(ids(filterCards(cards, { query: 'daftar', category: 'uy-rozgor', style: null }, labels)), []);
});

test('a slug is derived from an Uzbek title, modifier letters and all (R-015)', () => {
  assert.equal(slugify('Vaqtni eslatuvchi qora telefon'), 'vaqtni-eslatuvchi-qora-telefon');
  assert.equal(slugify('Tartibli kun uchun sokin koʻk daftar'), 'tartibli-kun-uchun-sokin-kok-daftar');
  assert.equal(slugify('Har kuni qoʻl yetadigan tozalik!'), 'har-kuni-qol-yetadigan-tozalik');
  assert.equal(slugify('  ---  '), '');
});

test('the aspect ratio of an uploaded clip is the nearest one the product supports', () => {
  assert.equal(aspectFromSize(1080, 1920), '9:16');
  assert.equal(aspectFromSize(1920, 1080), '16:9');
  assert.equal(aspectFromSize(1080, 1080), '1:1');
  assert.equal(aspectFromSize(1024, 1080), '1:1');
  assert.equal(aspectFromSize(0, 1080), null);
});
