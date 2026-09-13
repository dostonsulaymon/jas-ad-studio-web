import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PLATES, resolvePlates } from './content.ts';

test('an owner override replaces exactly its slot and keeps the rest', () => {
  const plates = resolvePlates([{ slot: 5, path: 'abc.jpg', altUz: 'Mening noutbukim' }]);
  assert.equal(plates.length, HERO_PLATES.length);
  assert.deepEqual(plates[5], { src: '/api/gallery/media/abc.jpg', alt: 'Mening noutbukim' });
  assert.deepEqual(plates[0], HERO_PLATES[0]);
});
