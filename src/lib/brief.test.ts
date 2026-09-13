import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draftFromProject, emptyDraft, isStep1Complete, reviveDraft, toBriefDto } from './brief.ts';

test('the body always carries all eleven fields, optional ones as null or []', () => {
  const body = toBriefDto({ ...emptyDraft(), productName: 'Daftar', description: 'Koʻk' });
  assert.deepEqual(Object.keys(body).sort(), [
    'aspectRatio', 'audience', 'confirmedClaims', 'description', 'durationSeconds', 'formatId',
    'galleryInspirationId', 'goal', 'offer', 'platform', 'productName',
  ]);
  assert.equal(body.audience, null);
  assert.equal(body.offer, null);
  assert.deepEqual(body.confirmedClaims, []);
});

test('free text is normalised and trimmed on the way out', () => {
  const body = toBriefDto({ ...emptyDraft(), productName: "  Ko'k daftar ", description: "g'oya" });
  assert.equal(body.productName, 'Koʻk daftar');
  assert.equal(body.description, 'gʻoya');
});

test('an abandoned offer and empty claims are dropped, not sent half-filled', () => {
  const body = toBriefDto({
    ...emptyDraft(),
    offer: { description: '   ', priceUzs: 5000, validUntil: null },
    confirmedClaims: [{ claim: ' ', verified: true }, { claim: 'Suvga chidamli', verified: true }],
  });
  assert.equal(body.offer, null);
  assert.deepEqual(body.confirmedClaims, [{ claim: 'Suvga chidamli', verified: true }]);
});

test('only the inspiration id travels, never its prompt or title', () => {
  const body = toBriefDto({ ...emptyDraft(), inspiration: { id: '03-03-notebook', titleUz: 'Daftar' } });
  assert.equal(body.galleryInspirationId, '03-03-notebook');
  assert.equal(JSON.stringify(body).includes('Daftar'), false);
});

test('a stored draft is revived safely, and garbage becomes the empty draft', () => {
  assert.deepEqual(reviveDraft('nonsense'), emptyDraft());
  const revived = reviveDraft({ productName: 'Telefon', goal: 'bogus', inspiration: { id: 'x', titleUz: 'X' } });
  assert.equal(revived.productName, 'Telefon');
  assert.equal(revived.goal, 'awareness');
  assert.deepEqual(revived.inspiration, { id: 'x', titleUz: 'X' });
});

test('a reopened project restores every brief field', () => {
  const draft = draftFromProject({
    id: 'p-1', name: 'Pixel', formatId: 'product-film', durationSeconds: 10, aspectRatio: '9:16', createdAt: '2026-09-12T10:00:00Z',
    brief: {
      productName: 'Pixel', description: 'Uch rang', goal: 'sales', formatId: 'high-energy', platform: 'tiktok',
      aspectRatio: '1:1', durationSeconds: 8, audience: 'Talabalar',
      confirmedClaims: [{ claim: 'Kafolat', verified: true }],
      offer: { description: 'Chegirma', priceUzs: 100, validUntil: '2026-10-01' },
      galleryInspirationId: '02-02-rotary-phone',
    },
  });
  assert.equal(draft.goal, 'sales');
  assert.equal(draft.audience, 'Talabalar');
  assert.equal(draft.offer?.priceUzs, 100);
  assert.equal(draft.inspiration?.id, '02-02-rotary-phone');
  assert.equal(isStep1Complete(draft), true);
});
