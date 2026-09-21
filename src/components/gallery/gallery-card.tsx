'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Pause, Play, TextAlignLeft } from '@phosphor-icons/react';
import { button } from '../ui/button';
import type { GalleryCard } from '@/lib/api/types';
import { t } from '@/lib/i18n';
import { categoryLabel, styleLabel } from './explorer';

const RATIO: Record<GalleryCard['aspectRatio'], string> = { '9:16': '9 / 16', '16:9': '16 / 9', '1:1': '1 / 1' };

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * R-013: clips play by themselves, but only the ones a visitor can actually see.
 *
 * The `src` is attached the first time a card enters the viewport and never before, so `preload="none"`
 * still means what it says: someone who lands and does not scroll downloads the clips on screen, not
 * the whole gallery. The video comes off our own machine through the tunnel, so "play everything on
 * arrival" is a bill that grows with the gallery.
 *
 * Muted, because no browser autoplays sound; looping, because a clip frozen on its last frame reads as
 * broken; and never under `prefers-reduced-motion`, where the card keeps the old play-on-demand
 * behaviour and the one-at-a-time rule the explorer owns.
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
  const frame = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const reducedMotion = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);
  const [pausedByViewer, setPausedByViewer] = useState(false);

  const autoplays = !reducedMotion;
  const shouldPlay = autoplays ? inView && !pausedByViewer : playing;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setArmed(true);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el || !armed) return;
    if (shouldPlay) {
      // Set on the element as well as through the attribute: a muted video is the only kind Chrome
      // and Safari will start without a gesture, and React writes this one as a property.
      el.muted = true;
      void el.play().catch(() => setPausedByViewer(true));
    } else {
      el.pause();
    }
  }, [shouldPlay, armed]);

  const toggle = () => {
    if (autoplays) setPausedByViewer((paused) => !paused);
    else if (playing) onStop();
    else {
      setArmed(true);
      onPlay();
    }
  };

  return (
    <li className="group min-w-0">
      <div
        ref={frame}
        className="relative overflow-hidden rounded-card bg-raised transition-transform duration-200 ease-[var(--ease-soft)] group-hover:-translate-y-0.5"
        style={{ aspectRatio: RATIO[card.aspectRatio] }}
      >
        <video
          ref={video}
          src={armed ? card.videoUrl : undefined}
          poster={card.posterUrl}
          preload="none"
          playsInline
          muted
          loop={autoplays}
          onEnded={autoplays ? undefined : onStop}
          onPause={autoplays ? undefined : () => playing && onStop()}
          className="absolute inset-0 size-full object-cover"
          aria-labelledby={titleId}
        />
        <button
          type="button"
          onClick={toggle}
          aria-pressed={shouldPlay}
          className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-ink backdrop-blur-sm transition-colors duration-150 hover:bg-black/80"
        >
          {shouldPlay ? <Pause size={18} weight="fill" aria-hidden /> : <Play size={18} weight="fill" aria-hidden />}
          <span className="sr-only">{shouldPlay ? t.gallery.pause(card.titleUz) : t.gallery.play(card.titleUz)}</span>
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
