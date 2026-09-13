import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tabFromHash } from './admin-tab.ts';

test('a known hash opens its tab; anything else opens orders', () => {
  assert.equal(tabFromHash('#gallery'), 'gallery');
  assert.equal(tabFromHash('#asosiy'), 'orders');
  assert.equal(tabFromHash(''), 'orders');
});
