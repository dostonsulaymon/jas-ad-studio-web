import type { GalleryCard, HeroOverride, PublicSettings } from './api/types.ts';

/**
 * Server-side reads for the landing. They never throw: a gallery or settings outage degrades to an
 * empty section, it does not take the page down.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3040';

export async function readGalleryCards(): Promise<GalleryCard[]> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/gallery`, { headers: { Accept: 'application/json' }, next: { revalidate: 60 } });
    if (!response.ok) return [];
    return ((await response.json()) as { examples?: GalleryCard[] }).examples ?? [];
  } catch {
    return [];
  }
}

export async function readPublicSettings(): Promise<PublicSettings | null> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/settings/public`, { headers: { Accept: 'application/json' }, next: { revalidate: 60 } });
    if (!response.ok) return null;
    return (await response.json()) as PublicSettings;
  } catch {
    return null;
  }
}

export interface Plate {
  src: string;
  alt: string;
}

/**
 * The seven owner-editable photos in "Moslashtirish". Slot numbers match v1's hero tray, so the
 * overrides the owner already saved (`heroPhotos`, keyed by slot) land on the same picture.
 */
export const HERO_PLATES: readonly Plate[] = [
  { src: '/namunalar/notebook.jpg', alt: 'Koʻk daftar' },
  { src: '/namunalar/rotary.jpg', alt: 'Eski disklik telefon' },
  { src: '/namunalar/wipes.jpg', alt: 'Nam salfetka' },
  { src: '/namunalar/car.jpg', alt: 'Yengil avtomobil' },
  { src: '/namunalar/key.jpg', alt: 'Bronza kalit' },
  { src: '/namunalar/laptop.jpg', alt: 'Noutbuk' },
  { src: '/namunalar/charger.jpg', alt: 'Quvvatlagich va kabel' },
];

export function resolvePlates(overrides: readonly HeroOverride[]): Plate[] {
  const bySlot = new Map(overrides.map((o) => [o.slot, o]));
  return HERO_PLATES.map((plate, slot) => {
    const own = bySlot.get(slot);
    return own ? { src: `/api/gallery/media/${own.path}`, alt: own.altUz } : { ...plate };
  });
}
