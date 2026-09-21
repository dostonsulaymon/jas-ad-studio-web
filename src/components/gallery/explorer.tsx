'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { GalleryCardView } from './gallery-card';
import { PromptSheet } from './prompt-sheet';
import { button } from '../ui/button';
import { categoriesPresent, filterCards, stylesPresent } from '@/lib/gallery';
import type { GalleryCard, GalleryCategory } from '@/lib/api/types';
import { t } from '@/lib/i18n';

/**
 * R-011: the gallery runs to 1600px so a full page of examples uses the screen. With three of them
 * it would otherwise leave a hole where the fourth column should be, which reads as broken rather
 * than as empty. So the row never has more columns than it has cards, and a short row is centred.
 *
 * The space either side of three cards is a content problem, not a layout one (Q-04): publish more
 * examples and it closes. What this stops is the *lopsided* gap.
 */
const CARD_WIDTH = 340;
const GAP = 20;

const GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
};

const columnsFor = (cards: number) => Math.min(Math.max(cards, 1), 5);

const widthFor = (cards: number) => columnsFor(cards) * CARD_WIDTH + (columnsFor(cards) - 1) * GAP;

export const categoryLabel = (c: GalleryCategory) => t.gallery.categories[c] ?? c;
export const styleLabel = (s: string) => t.format[s as keyof typeof t.format]?.label ?? s;

/**
 * The hero's search box and the gallery share one filter, so they live in one client island. The
 * hero copy itself is server-rendered and passed in.
 */
export function Explorer({ cards, hero }: { cards: GalleryCard[]; hero: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GalleryCategory | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<GalleryCard | null>(null);
  const galleryRef = useRef<HTMLElement>(null);

  const categories = useMemo(() => categoriesPresent(cards), [cards]);
  const styles = useMemo(() => stylesPresent(cards), [cards]);
  const shown = useMemo(
    () => filterCards(cards, { query, category, style }, { category: categoryLabel, style: styleLabel }),
    [cards, query, category, style],
  );
  const filtered = query.trim() !== '' || category !== null || style !== null;

  const clear = () => {
    setQuery('');
    setCategory(null);
    setStyle(null);
  };

  return (
    <>
      <section className="px-4 pt-14 pb-8 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-[1040px]">
          {hero}
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              galleryRef.current?.scrollIntoView({ block: 'start' });
            }}
            className="mx-auto mt-10 max-w-[560px]"
          >
            <label htmlFor="gallery-search" className="sr-only">
              {t.hero.searchLabel}
            </label>
            <div className="relative">
              <MagnifyingGlass size={20} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
              <input
                id="gallery-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.hero.searchPlaceholder}
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-input border border-line bg-raised pr-14 pl-12 text-[16px] text-ink transition-colors duration-150 placeholder:text-muted hover:border-line-strong [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={button({ variant: 'ghost', size: 'icon', className: 'absolute top-1/2 right-1.5 -translate-y-1/2' })}
                >
                  <X size={18} aria-hidden />
                  <span className="sr-only">{t.hero.searchClear}</span>
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section ref={galleryRef} id="galereya" aria-labelledby="galereya-title" className="px-4 pt-2 pb-24 sm:px-6 sm:pt-4 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          {/* R-012: the visible heading and lead are gone so the gallery sits under the hero, but the
              section still needs an accessible name, and the count is the only feedback filtering gives. */}
          <h2 id="galereya-title" className="sr-only">
            {t.gallery.title}
          </h2>

          {cards.length === 0 ? (
            <div className="mt-10 rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
              <p className="text-[20px] font-bold tracking-[-0.02em]">{t.gallery.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-[52ch] text-muted">{t.gallery.emptyBody}</p>
              <Link href="/studiya" className={button({ variant: 'solid', size: 'md', className: 'mt-6' })}>
                {t.hero.secondaryCta}
              </Link>
            </div>
          ) : (
            <div className="mx-auto" style={{ maxWidth: widthFor(cards.length) }}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <ChipRow label={t.gallery.categoryGroup}>
                  <Chip active={category === null} onClick={() => setCategory(null)}>
                    {t.gallery.allCategories}
                  </Chip>
                  {categories.map((c) => (
                    <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                      {categoryLabel(c)}
                    </Chip>
                  ))}
                </ChipRow>
                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  {styles.length > 1 ? (
                    <ChipRow label={t.gallery.formatGroup}>
                      <Chip active={style === null} onClick={() => setStyle(null)}>
                        {t.gallery.allFormats}
                      </Chip>
                      {styles.map((s) => (
                        <Chip key={s} active={style === s} onClick={() => setStyle(style === s ? null : s)}>
                          {styleLabel(s)}
                        </Chip>
                      ))}
                    </ChipRow>
                  ) : null}
                  <p className="shrink-0 text-[14px] text-muted tabular-nums" aria-live="polite">
                    {t.gallery.count(shown.length)}
                  </p>
                </div>
              </div>

              {shown.length === 0 ? (
                <div className="mt-8 rounded-card border border-line bg-raised px-6 py-12 text-center">
                  <p className="text-[18px] font-bold">{t.gallery.noMatchTitle}</p>
                  <p className="mt-1 text-muted">{t.gallery.noMatchBody}</p>
                  {filtered ? (
                    <button type="button" onClick={clear} className={button({ variant: 'outline', size: 'sm', className: 'mt-5' })}>
                      {t.gallery.noMatchAction}
                    </button>
                  ) : null}
                </div>
              ) : (
                <ul
                  style={{ maxWidth: widthFor(shown.length) }}
                  className={`mx-auto mt-8 grid gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 ${GRID_COLUMNS[columnsFor(shown.length)]}`}
                >
                  {shown.map((card) => (
                    <GalleryCardView
                      key={card.id}
                      card={card}
                      playing={playingId === card.id}
                      onPlay={() => setPlayingId(card.id)}
                      onStop={() => setPlayingId((id) => (id === card.id ? null : id))}
                      onOpenPrompt={() => {
                        setPlayingId(null);
                        setOpenCard(card);
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {openCard ? <PromptSheet card={openCard} onClose={() => setOpenCard(null)} /> : null}
    </>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap transition-colors duration-150 ${
        active ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:border-line-strong hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
