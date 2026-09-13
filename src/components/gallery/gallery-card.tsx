'use client';

import { useEffect, useId, useRef } from 'react';
import { Pause, Play, TextAlignLeft } from '@phosphor-icons/react';
import { button } from '../ui/button';
import type { GalleryCard } from '@/lib/api/types';
import { t } from '@/lib/i18n';
import { categoryLabel, styleLabel } from './explorer';

const RATIO: Record<GalleryCard['aspectRatio'], string> = { '9:16': '9 / 16', '16:9': '16 / 9', '1:1': '1 / 1' };

/**
 * A poster with play on demand. The clip is `preload="none"` behind its poster and never autoplays;
 * only one card plays at a time. Provenance (`sourceNote`) is always shown.
 */
export function GalleryCardView({
  card,
  playing,
  onPlay,
  onStop,
  onOpenPrompt,
}: {
  card: GalleryCard;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  onOpenPrompt: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) void el.play().catch(onStop);
    else el.pause();
  }, [playing, onStop]);

  return (
    <li className="group min-w-0">
      <div
        className="relative overflow-hidden rounded-card bg-raised transition-transform duration-200 ease-[var(--ease-soft)] group-hover:-translate-y-0.5"
        style={{ aspectRatio: RATIO[card.aspectRatio] }}
      >
        <video
          ref={video}
          src={card.videoUrl}
          poster={card.posterUrl}
          preload="none"
          playsInline
          onEnded={onStop}
          onPause={() => playing && onStop()}
          className="absolute inset-0 size-full object-cover"
          aria-labelledby={titleId}
        />
        <button
          type="button"
          onClick={playing ? onStop : onPlay}
          aria-pressed={playing}
          className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-ink backdrop-blur-sm transition-colors duration-150 hover:bg-black/80"
        >
          {playing ? <Pause size={18} weight="fill" aria-hidden /> : <Play size={18} weight="fill" aria-hidden />}
          <span className="sr-only">{playing ? t.gallery.pause(card.titleUz) : t.gallery.play(card.titleUz)}</span>
        </button>
      </div>

      <div className="mt-3 px-0.5">
        <p className="truncate text-[13px] text-muted">
          {categoryLabel(card.category)} · {styleLabel(card.style)}
        </p>
        <h3 id={titleId} className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.01em] sm:text-[17px]">
          {card.titleUz}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-muted">{card.sourceNote}</p>
        <button
          type="button"
          onClick={onOpenPrompt}
          aria-describedby={titleId}
          className={button({ variant: 'outline', size: 'sm', className: 'mt-3 max-sm:w-full' })}
        >
          <TextAlignLeft size={16} aria-hidden />
          {t.gallery.promptAction}
        </button>
      </div>
    </li>
  );
}
