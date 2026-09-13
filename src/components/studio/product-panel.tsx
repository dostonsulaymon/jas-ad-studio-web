'use client';

import { ImageSquare, Sparkle } from '@phosphor-icons/react';
import type { Draft } from '@/lib/brief';
import { t } from '@/lib/i18n';
import type { Photo } from './step-product';

/**
 * The seller's product stays in sight through all three steps: a sticky panel on desktop, a compact
 * row above the form on phones (shown once there is something to show).
 */
export function ProductPanel({ draft, photos, compact = false }: { draft: Draft; photos: Photo[]; compact?: boolean }) {
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  const meta = `${t.review.photos(photos.length)} · ${t.format[draft.formatId].label} · ${draft.aspectRatio}`;

  if (compact) {
    if (!primary && !draft.productName.trim()) return null;
    return (
      <div className="mt-4 flex items-center gap-3 rounded-card border border-line bg-raised p-2.5 pr-4 lg:hidden">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated private photo
          <img src={primary.url} alt="" className="size-14 shrink-0 rounded-input bg-bg object-cover" />
        ) : (
          <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-input bg-bg text-muted">
            <ImageSquare size={22} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-semibold">{draft.productName || t.studio.yourProduct}</span>
          <span className="block truncate text-[13px] text-muted">{meta}</span>
        </span>
      </div>
    );
  }

  return (
    <aside aria-label={t.studio.yourProduct} className="hidden lg:block">
      <div className="sticky top-24 rounded-card border border-line bg-raised p-5">
        <p className="text-[13px] font-semibold text-muted">{t.studio.yourProduct}</p>
        <div className="mt-3 aspect-square overflow-hidden rounded-input border border-line bg-bg">
          {primary ? (
            // eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated private photo
            <img src={primary.url} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
              <ImageSquare size={32} aria-hidden />
              <span className="text-[13px]">{t.studio.noPhotoYet}</span>
            </div>
          )}
        </div>
        {photos.length > 1 ? (
          <ul className="mt-2 grid grid-cols-4 gap-2">
            {photos
              .filter((p) => p !== primary)
              .map((p) => (
                <li key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated private photo */}
                  <img src={p.url} alt="" className="aspect-square w-full rounded-[8px] bg-bg object-cover" />
                </li>
              ))}
          </ul>
        ) : null}
        <p className="mt-4 text-[18px] leading-snug font-bold tracking-[-0.02em] break-words">{draft.productName || t.studio.yourProduct}</p>
        <p className="mt-1 text-[14px] text-muted">{meta}</p>
        {draft.inspiration ? (
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-[14px]">
            <Sparkle size={16} aria-hidden className="mt-0.5 shrink-0" />
            <span className="min-w-0">
              <span className="block text-muted">{t.inspiration.label}</span>
              <span className="block font-medium break-words">{draft.inspiration.titleUz}</span>
            </span>
          </p>
        ) : null}
      </div>
    </aside>
  );
}
