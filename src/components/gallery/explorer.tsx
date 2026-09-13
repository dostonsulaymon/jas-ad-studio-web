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
      <section className="px-4 pt-14 pb-12 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
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

      <section ref={galleryRef} id="galereya" aria-labelledby="galereya-title" className="px-4 pt-6 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="galereya-title" className="text-[clamp(30px,3.4vw,46px)] leading-[1.05] font-extrabold tracking-[-0.035em]">
              {t.gallery.title}
            </h2>
            {cards.length > 0 ? (
              <p className="text-[14px] text-muted tabular-nums" aria-live="polite">
                {t.gallery.count(shown.length)}
              </p>
            ) : null}
          </div>
          <p className="mt-3 max-w-[60ch] text-muted">{t.gallery.lead}</p>

          {cards.length === 0 ? (
            <div className="mt-10 rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
              <p className="text-[20px] font-bold tracking-[-0.02em]">{t.gallery.emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-[52ch] text-muted">{t.gallery.emptyBody}</p>
              <Link href="/studiya" className={button({ variant: 'solid', size: 'md', className: 'mt-6' })}>
                {t.hero.secondaryCta}
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
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
            </>
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
