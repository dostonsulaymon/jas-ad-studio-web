'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Lock, Pause, Play, TextAlignLeft } from '@phosphor-icons/react';
import { button } from '../ui/button';
import type { GalleryCard } from '@/lib/api/types';
import { t } from '@/lib/i18n';
import { categoryLabel, styleLabel } from './explorer';
import { useSession } from '../session';

/**
 * Every tile is the same shape, whatever the clip inside it is.
 *
 * The gallery mixes 9:16 and 16:9 examples, and a card that took its own video's ratio came out a
 * third the height of its neighbours and read as broken. The tile is fixed at 9:16 — the product is
 * vertical-ad-first, and that is the studio's own default — and a clip that does not match is fitted
 * whole inside it with a blurred copy of its poster filling the rest. Nothing is cropped, because
 * cropping a product ad can quietly cut the product out of frame.
 */
const TILE = '9 / 16';

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

  const session = useSession();
  /** R-010: the clip and the title stay public; only the prompt is behind PRO. */
  const locked = card.promptAccess === 'pro' && !session.hasPro;

  const reducedMotion = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);
  const [pausedByViewer, setPausedByViewer] = useState(false);

  const autoplays = !reducedMotion;
  const shouldPlay = autoplays ? inView && !pausedByViewer : playing;

  /**
   * A clip that plays by itself must still be stoppable (WCAG 2.2.2: motion that starts on its own
   * and runs past five seconds needs a way to pause it), and under reduced motion this is the only
   * way to start one. So the control stays — it just gets out of the way while the clip is playing,
   * on pointer devices, where hover and focus bring it back. On touch there is no hover, so it stays.
   */
  const quiet = autoplays && shouldPlay;

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
        style={{ aspectRatio: TILE }}
      >
        {card.aspectRatio === '9:16' ? null : (
          // Same URL as the video's own poster, so this costs no extra request.
          // eslint-disable-next-line @next/next/no-img-element -- gallery media through the API proxy
          <img
            src={card.posterUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 size-full scale-110 object-cover blur-2xl brightness-[0.35]"
          />
        )}
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
          className="absolute inset-0 size-full object-contain"
          aria-labelledby={titleId}
        />
        <button
          type="button"
          onClick={toggle}
          aria-pressed={shouldPlay}
          className={`absolute bottom-3 left-3 grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-ink backdrop-blur-sm transition-[opacity,background-color] duration-200 hover:bg-black/80 ${
            quiet ? '[@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100' : ''
          }`}
        >
          {shouldPlay ? <Pause size={18} weight="fill" aria-hidden /> : <Play size={18} weight="fill" aria-hidden />}
          <span className="sr-only">{shouldPlay ? t.gallery.pause(card.titleUz) : t.gallery.play(card.titleUz)}</span>
        </button>
        {card.promptAccess === 'pro' ? (
          <span className="absolute top-3 right-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-pro px-2.5 text-[11px] font-black tracking-[0.08em] text-pro-ink shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            <Lock size={12} weight="fill" aria-hidden />
            {t.gallery.proBadge}
          </span>
        ) : null}
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
          aria-label={locked ? t.gallery.proFor(card.titleUz) : undefined}
          className={button({ variant: 'outline', size: 'sm', className: 'mt-3 max-sm:w-full' })}
        >
          {locked ? <Lock size={16} weight="fill" aria-hidden className="text-pro" /> : <TextAlignLeft size={16} aria-hidden />}
          {locked ? t.gallery.proCardAction : t.gallery.promptAction}
        </button>
      </div>
    </li>
  );
}
