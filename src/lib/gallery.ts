import { api } from './api/client.ts';
import type { GalleryCard, GalleryCategory, GalleryExample } from './api/types.ts';
import { foldForSearch } from './uzbek.ts';

export const CATEGORY_ORDER: readonly GalleryCategory[] = [
  'kiyim', 'poyabzal', 'parfyum', 'kosmetika', 'uy-rozgor', 'elektronika', 'oziq-ovqat', 'aksessuar',
];

export interface GalleryFilter {
  query: string;
  category: GalleryCategory | null;
  style: string | null;
}

export interface GalleryLabels {
  category: (c: GalleryCategory) => string;
  style: (s: string) => string;
}

/** Chips list only categories that have a published example, in a stable order. */
export function categoriesPresent(cards: readonly GalleryCard[]): GalleryCategory[] {
  const present = new Set(cards.map((c) => c.category));
  return CATEGORY_ORDER.filter((c) => present.has(c));
}

export function stylesPresent(cards: readonly GalleryCard[]): string[] {
  return [...new Set(cards.map((c) => c.style))];
}

/** Client-side search (the API has none): title, category label and format label, apostrophe-blind. */
export function filterCards(cards: readonly GalleryCard[], filter: GalleryFilter, labels: GalleryLabels): GalleryCard[] {
  const words = foldForSearch(filter.query).split(/\s+/).filter(Boolean);
  return cards.filter((card) => {
    if (filter.category && card.category !== filter.category) return false;
    if (filter.style && card.style !== filter.style) return false;
    if (words.length === 0) return true;
    const haystack = foldForSearch(`${card.titleUz} ${labels.category(card.category)} ${card.category} ${labels.style(card.style)}`);
    return words.every((word) => haystack.includes(word));
  });
}

export function readGalleryExample(slug: string, signal?: AbortSignal) {
  return api.get<GalleryExample>(`/api/gallery/${encodeURIComponent(slug)}`, { signal });
}

/** Studio draft storage. The gallery writes the chosen style into it before navigating to /studiya. */
export const DRAFT_KEY = 'jas.v2.draft';
export const PROJECT_KEY = 'jas.v2.projectId';

export function rememberInspiration(choice: { id: string; titleUz: string }): void {
  try {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    const draft = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, inspiration: choice }));
  } catch {
    /* blocked storage: the studio still opens, without the style */
  }
}
