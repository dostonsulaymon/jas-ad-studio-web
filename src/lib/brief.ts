import type { components } from './api/generated/schema.ts';
import { normalizeUzbek } from './uzbek.ts';

/**
 * The brief, as the seller fills it in, and how it becomes the request body.
 *
 * Every one of BriefDto's 11 fields is required in the JSON body, even the ones that are
 * optional to the seller: `audience`, `offer` and `galleryInspirationId` are nullable
 * rather than absent, and `confirmedClaims` is an empty array rather than missing. So the
 * form has to build a complete object, never a sparse one, and that is this file's job.
 */

export type BriefDto = components['schemas']['BriefDto'];
export type ProjectSummaryDto = components['schemas']['ProjectSummaryDto'];
export type StoredAssetDto = components['schemas']['StoredAssetDto'];
export type CurrentUserDto = components['schemas']['CurrentUserDto'];

export type Goal = BriefDto['goal'];
export type FormatId = BriefDto['formatId'];
export type Platform = BriefDto['platform'];
export type AspectRatio = BriefDto['aspectRatio'];

/**
 * These lists drive the radio groups. They are typed as the contract's own unions, so
 * if Session A adds or renames a format the build breaks here rather than drifting.
 */
export const GOALS: readonly Goal[] = ['awareness', 'sales', 'launch', 'trust'];
export const FORMATS: readonly FormatId[] = [
  'product-film',
  'high-energy',
  'lifestyle-story',
  'ugc-authentic',
];
export const PLATFORMS: readonly Platform[] = ['instagram', 'telegram', 'tiktok', 'youtube-shorts'];
export const ASPECTS: readonly AspectRatio[] = ['9:16', '16:9', '1:1'];

/** Bounds copied from the contract so the seller is not round-tripped for a long name. */
export const LIMITS = {
  productName: 200,
  description: 2000,
  audience: 200,
  offerDescription: 200,
  claim: 200,
  maxClaims: 10,
  maxPhotos: 4,
} as const;

export interface Claim {
  claim: string;
  verified: boolean;
}

export interface Offer {
  description: string;
  priceUzs: number | null;
  validUntil: string | null;
}

export interface Draft {
  projectId: string | null;
  productName: string;
  description: string;
  goal: Goal;
  formatId: FormatId;
  platform: Platform;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  audience: string;
  confirmedClaims: Claim[];
  offer: Offer | null;
}

/**
 * Defaults come from the contract where it has them: `durationSeconds` defaults to 10,
 * and `aspectRatio` defaults to 9:16 per source 01 §9. The aspect ratio is never
 * inferred from the uploaded photo's orientation, deliberately.
 */
export function emptyDraft(): Draft {
  return {
    projectId: null,
    productName: '',
    description: '',
    goal: 'awareness',
    formatId: 'product-film',
    platform: 'instagram',
    aspectRatio: '9:16',
    durationSeconds: 10,
    audience: '',
    confirmedClaims: [],
    offer: null,
  };
}

/**
 * Build the request body. Free text is normalised to canonical Uzbek on the way out, so
 * what the API stores matches the Uzbek it sends back (W-001).
 *
 * `galleryInspirationId` is always null: the gallery is P6, and inventing an id for a
 * gallery example that does not exist would be a fabricated reference.
 */
export function toBriefDto(draft: Draft): BriefDto {
  const audience = normalizeUzbek(draft.audience).trim();

  return {
    productName: normalizeUzbek(draft.productName).trim(),
    description: normalizeUzbek(draft.description).trim(),
    goal: draft.goal,
    formatId: draft.formatId,
    platform: draft.platform,
    aspectRatio: draft.aspectRatio,
    durationSeconds: draft.durationSeconds,
    audience: audience.length > 0 ? audience : null,
    confirmedClaims: draft.confirmedClaims
      .map((c) => ({ claim: normalizeUzbek(c.claim).trim(), verified: c.verified }))
      .filter((c) => c.claim.length > 0)
      .slice(0, LIMITS.maxClaims),
    offer: toOffer(draft.offer),
    galleryInspirationId: null,
  };
}

/**
 * An offer the seller started and abandoned is no offer at all. Sending `{description:
 * ''}` would fail the contract's minLength, and inventing a description to fill it would
 * put a claim in the prompt that the seller never made.
 */
function toOffer(offer: Offer | null): BriefDto['offer'] {
  if (!offer) return null;
  const description = normalizeUzbek(offer.description).trim();
  if (description.length === 0) return null;
  return {
    description,
    priceUzs: offer.priceUzs && offer.priceUzs > 0 ? Math.trunc(offer.priceUzs) : null,
    validUntil: offer.validUntil && offer.validUntil.length > 0 ? offer.validUntil : null,
  };
}

/** Which required fields are still empty. Drives what the step rail will let through. */
export function missingRequired(draft: Draft): Array<'productName' | 'description'> {
  const missing: Array<'productName' | 'description'> = [];
  if (draft.productName.trim().length === 0) missing.push('productName');
  if (draft.description.trim().length === 0) missing.push('description');
  return missing;
}

export function isStep1Complete(draft: Draft): boolean {
  return missingRequired(draft).length === 0;
}
