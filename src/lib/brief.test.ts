import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  draftFromProject,
  emptyDraft,
  isStep1Complete,
  missingRequired,
  toBriefDto,
  type Draft,
} from './brief.ts';
import { TURNED_COMMA } from './uzbek.ts';

function filled(overrides: Partial<Draft> = {}): Draft {
  return {
    ...emptyDraft(),
    productName: 'Pixel 9a, 128 GB',
    description: 'Uch rangda. Original, kafolat bilan.',
    ...overrides,
  };
}

test('a draft with only step 1 filled still produces every required key', () => {
  // BriefDto requires all 11 fields in the body, even the ones optional to the seller.
  // A sparse object is a 400, so this is the test that stops the form building one.
  const dto = toBriefDto(filled());
  const required = [
    'productName',
    'description',
    'goal',
    'formatId',
    'platform',
    'aspectRatio',
    'durationSeconds',
    'audience',
    'confirmedClaims',
    'offer',
    'galleryInspirationId',
  ];
  assert.deepEqual(Object.keys(dto).sort(), [...required].sort());
});

test('the optional fields are null or empty, never missing', () => {
  const dto = toBriefDto(filled());
  assert.equal(dto.audience, null);
  assert.equal(dto.offer, null);
  assert.equal(dto.galleryInspirationId, null);
  assert.deepEqual(dto.confirmedClaims, []);
});

test('the contract defaults are what an untouched draft sends', () => {
  const dto = toBriefDto(filled());
  assert.equal(dto.durationSeconds, 10);
  // Never inferred from photo orientation (source 01 §9).
  assert.equal(dto.aspectRatio, '9:16');
  assert.equal(dto.platform, 'instagram');
});

test('free text is normalised to canonical Uzbek on the way out', () => {
  const dto = toBriefDto(
    filled({ productName: "Sho'rva to'plami", description: "Yangi g'oya", audience: "yo'lovchilar" }),
  );
  assert.equal(dto.productName, `Sho${TURNED_COMMA}rva to${TURNED_COMMA}plami`);
  assert.equal(dto.description, `Yangi g${TURNED_COMMA}oya`);
  assert.equal(dto.audience, `yo${TURNED_COMMA}lovchilar`);
});

test('whitespace-only optional text becomes null, not an empty string', () => {
  // minLength is 1 on the contract, so "" would be a 400.
  assert.equal(toBriefDto(filled({ audience: '   ' })).audience, null);
});

test('an offer the seller started and abandoned is sent as no offer', () => {
  const dto = toBriefDto(
    filled({ offer: { description: '  ', priceUzs: 50000, validUntil: '2026-10-01' } }),
  );
  assert.equal(dto.offer, null, 'an offer with no text would fail minLength, or invent one');
});

test('an offer keeps only the parts the seller actually supplied', () => {
  const dto = toBriefDto(
    filled({ offer: { description: 'Yetkazib berish bepul', priceUzs: null, validUntil: null } }),
  );
  assert.deepEqual(dto.offer, {
    description: 'Yetkazib berish bepul',
    priceUzs: null,
    validUntil: null,
  });
});

test('a zero or negative price is dropped: the contract wants a positive integer', () => {
  const zero = toBriefDto(filled({ offer: { description: 'Aksiya', priceUzs: 0, validUntil: null } }));
  assert.equal(zero.offer?.priceUzs, null);

  const fractional = toBriefDto(
    filled({ offer: { description: 'Aksiya', priceUzs: 49999.9, validUntil: null } }),
  );
  assert.equal(fractional.offer?.priceUzs, 49999, 'priceUzs is an integer');
});

test('blank claims are dropped and the list is capped at ten', () => {
  const claims = [
    { claim: 'Original', verified: true },
    { claim: '   ', verified: false },
    ...Array.from({ length: 12 }, (_, i) => ({ claim: `Afzallik ${i}`, verified: false })),
  ];
  const dto = toBriefDto(filled({ confirmedClaims: claims }));
  assert.equal(dto.confirmedClaims.length, 10);
  assert.ok(!dto.confirmedClaims.some((c) => c.claim.trim().length === 0));
});

test('galleryInspirationId is always null while the gallery does not exist', () => {
  // Inventing an id for a gallery example that has not been built would be a
  // fabricated reference in the seller's own project.
  assert.equal(toBriefDto(filled()).galleryInspirationId, null);
});

test('missingRequired names exactly the fields that block step 1', () => {
  assert.deepEqual(missingRequired(emptyDraft()), ['productName', 'description']);
  assert.deepEqual(missingRequired(filled({ description: '  ' })), ['description']);
  assert.deepEqual(missingRequired(filled()), []);
  assert.equal(isStep1Complete(filled()), true);
  assert.equal(isStep1Complete(emptyDraft()), false);
});

test('a saved project round-trips into a draft and back without losing a field', () => {
  // The whole point of the brief read-back: reopen, edit, save, and the eight fields the
  // summary never carried are still there.
  const original = filled({
    audience: 'Uy bekalari',
    confirmedClaims: [{ claim: 'Original', verified: true }],
    offer: { description: 'Yetkazib berish bepul', priceUzs: 50000, validUntil: '2026-10-01' },
    goal: 'trust',
    formatId: 'ugc-authentic',
    platform: 'telegram',
    aspectRatio: '1:1',
    durationSeconds: 15,
  });
  const sent = toBriefDto(original);

  const reopened = draftFromProject({
    id: 'p-1',
    name: sent.productName,
    formatId: sent.formatId,
    durationSeconds: sent.durationSeconds,
    aspectRatio: sent.aspectRatio,
    createdAt: '2026-09-12T10:42:33.741Z',
    brief: sent,
  });

  assert.equal(reopened.projectId, 'p-1');
  assert.deepEqual(toBriefDto(reopened), sent, 'a reopened draft must send exactly what was saved');
});
