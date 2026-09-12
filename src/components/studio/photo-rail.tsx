'use client';

import { useId } from 'react';
import { t } from '@/lib/i18n';
import { LIMITS } from '@/lib/brief';

export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

/**
 * Up to four thumbnails plus dashed add-slots.
 *
 * `object-contain`, not cover: source 01 §8 asks for the seller's complete original
 * framing, and cropping their photo to fill a square is exactly the kind of silent
 * change the product lock exists to prevent.
 *
 * The photos come from GET /api/assets/{id}/reference, which is cookie-authenticated
 * and Cache-Control: private, no-store. next/image cannot fetch that, so these are
 * plain <img> on purpose.
 */
export function PhotoRail({
  photos,
  onMakePrimary,
  onRemove,
  onAdd,
  size = 76,
}: {
  photos: Photo[];
  onMakePrimary: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (files: FileList) => void;
  size?: number;
}) {
  const inputId = useId();
  const slots = Math.max(0, LIMITS.maxPhotos - photos.length);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative" style={{ width: size, height: size }}>
          <button
            type="button"
            onClick={() => onMakePrimary(photo.id)}
            aria-pressed={photo.isPrimary}
            aria-label={photo.isPrimary ? t.studio.primaryBadge : t.product.makePrimary}
            className={`size-full overflow-hidden rounded-sm border bg-stone-1 ${
              photo.isPrimary ? 'border-primary outline outline-2 outline-offset-2 outline-primary' : 'border-border'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated, no-store */}
            <img src={photo.url} alt="" className="size-full object-contain" />
          </button>

          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            aria-label={t.product.removePhoto}
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-white text-[13px] leading-none text-muted opacity-0 transition-opacity duration-fast group-hover:opacity-100 focus-visible:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}

      {slots > 0 ? (
        <>
          <label
            htmlFor={inputId}
            style={{ width: size, height: size }}
            className="flex cursor-pointer items-center justify-center rounded-sm border-[1.5px] border-dashed border-border text-2xl text-muted transition-colors duration-fast hover:border-primary hover:text-primary has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
          >
            <span aria-hidden>+</span>
            <span className="sr-only">{t.product.addPhoto}</span>
            <input
              id={inputId}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                if (event.target.files?.length) onAdd(event.target.files);
                event.target.value = '';
              }}
            />
          </label>

          {/* The remaining empty slots are shown, so the seller can see the limit
              rather than discovering it as an error on the fifth file. */}
          {Array.from({ length: slots - 1 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              style={{ width: size, height: size }}
              className="rounded-sm border-[1.5px] border-dashed border-border/60"
            />
          ))}
        </>
      ) : null}

      {photos.some((p) => p.isPrimary) ? (
        <span className="ml-1 inline-flex h-[34px] items-center rounded-full bg-accent px-3.5 text-[13.5px] font-semibold text-ink">
          {t.studio.primaryBadge}
        </span>
      ) : null}
    </div>
  );
}
