import type { AspectRatio, BriefDto, FormatId, Goal, Platform, ProjectDetail } from './api/types.ts';
import { normalizeUzbek } from './uzbek.ts';

/**
 * The brief as the seller fills it in, and the strict BriefDto it becomes. All eleven fields are
 * required in the body (nullable, never absent), so the draft always builds a complete object.
 */

export const GOALS: readonly Goal[] = ['awareness', 'sales', 'launch', 'trust'];
export const FORMATS: readonly FormatId[] = ['product-film', 'high-energy', 'lifestyle-story', 'ugc-authentic'];
export const PLATFORMS: readonly Platform[] = ['instagram', 'telegram', 'tiktok', 'youtube-shorts'];
export const ASPECTS: readonly AspectRatio[] = ['9:16', '16:9', '1:1'];

export const LIMITS = {
  productName: 200,
  description: 2000,
  audience: 200,
  offerDescription: 200,
  claim: 200,
  maxClaims: 10,
  maxPhotos: 4,
  photoBytes: 10 * 1024 * 1024,
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

export interface Inspiration {
  id: string;
  titleUz: string;
}

export interface Draft {
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
  /** Only the id is ever sent; the title rides along so the chip can name it. */
  inspiration: Inspiration | null;
}

export function emptyDraft(): Draft {
  return {
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
    inspiration: null,
  };
}

/** Accepts whatever sessionStorage holds and returns a valid draft, dropping anything malformed. */
export function reviveDraft(stored: unknown): Draft {
  const base = emptyDraft();
  if (!stored || typeof stored !== 'object') return base;
  const s = stored as Partial<Record<keyof Draft, unknown>>;
  const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);
  const pick = <T extends string>(v: unknown, list: readonly T[], fallback: T) =>
    typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : fallback;

  return {
    productName: str(s.productName, base.productName),
    description: str(s.description, base.description),
    goal: pick(s.goal, GOALS, base.goal),
    formatId: pick(s.formatId, FORMATS, base.formatId),
    platform: pick(s.platform, PLATFORMS, base.platform),
    aspectRatio: pick(s.aspectRatio, ASPECTS, base.aspectRatio),
    durationSeconds: typeof s.durationSeconds === 'number' ? s.durationSeconds : base.durationSeconds,
    audience: str(s.audience, base.audience),
    confirmedClaims: Array.isArray(s.confirmedClaims)
      ? s.confirmedClaims
          .filter((c): c is Claim => Boolean(c) && typeof c.claim === 'string')
          .map((c) => ({ claim: c.claim, verified: Boolean(c.verified) }))
      : [],
    offer:
      s.offer && typeof s.offer === 'object' && typeof (s.offer as Offer).description === 'string'
        ? {
            description: (s.offer as Offer).description,
            priceUzs: typeof (s.offer as Offer).priceUzs === 'number' ? (s.offer as Offer).priceUzs : null,
            validUntil: typeof (s.offer as Offer).validUntil === 'string' ? (s.offer as Offer).validUntil : null,
          }
        : null,
    inspiration:
      s.inspiration && typeof s.inspiration === 'object' && typeof (s.inspiration as Inspiration).id === 'string'
        ? { id: (s.inspiration as Inspiration).id, titleUz: str((s.inspiration as Inspiration).titleUz, (s.inspiration as Inspiration).id) }
        : null,
  };
}

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
    galleryInspirationId: draft.inspiration?.id ?? null,
  };
}

function toOffer(offer: Offer | null): BriefDto['offer'] {
  if (!offer) return null;
  const description = normalizeUzbek(offer.description).trim();
  if (description.length === 0) return null;
  return {
    description,
    priceUzs: offer.priceUzs && offer.priceUzs > 0 ? Math.trunc(offer.priceUzs) : null,
    validUntil: offer.validUntil ? offer.validUntil : null,
  };
}

/** A reopened project knows its inspiration id but not its title; the chip shows the id. */
export function draftFromProject(project: ProjectDetail): Draft {
  const b = project.brief;
  return {
    productName: b.productName,
    description: b.description,
    goal: b.goal,
    formatId: b.formatId,
    platform: b.platform,
    aspectRatio: b.aspectRatio,
    durationSeconds: b.durationSeconds ?? 10,
    audience: b.audience ?? '',
    confirmedClaims: b.confirmedClaims.map((c) => ({ claim: c.claim, verified: c.verified })),
    offer: b.offer ? { ...b.offer } : null,
    inspiration: b.galleryInspirationId ? { id: b.galleryInspirationId, titleUz: b.galleryInspirationId } : null,
  };
}

export function isStep1Complete(draft: Draft): boolean {
  return draft.productName.trim().length > 0 && draft.description.trim().length > 0;
}
