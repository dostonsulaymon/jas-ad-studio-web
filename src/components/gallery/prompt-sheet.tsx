'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Sparkle } from '@phosphor-icons/react';
import { Sheet, SheetHeader } from '../ui/sheet';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { readGalleryExample, rememberInspiration } from '@/lib/gallery';
import { copyText } from '@/lib/generation';
import type { GalleryCard, GalleryExample } from '@/lib/api/types';
import { t } from '@/lib/i18n';
import { categoryLabel, styleLabel } from './explorer';

/**
 * The example's prompt, fetched when the sheet opens (the list payload carries none). Copy puts the
 * prompt and nothing else on the clipboard; if the Clipboard API fails, the block is selected for
 * manual copying. "Shu uslubdan foydalanish" carries only the example's id into the studio.
 */
export function PromptSheet({ card, onClose }: { card: GalleryCard; onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const [example, setExample] = useState<GalleryExample | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [copy, setCopy] = useState<'idle' | 'ok' | 'failed'>('idle');
  const [attempt, setAttempt] = useState(0);
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    readGalleryExample(card.slug, controller.signal)
      .then(setExample)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause);
      });
    return () => controller.abort();
  }, [card.slug, attempt]);

  const onCopy = useCallback(async () => {
    if (!example) return;
    const ok = await copyText(example.promptEn);
    setCopy(ok ? 'ok' : 'failed');
    if (!ok && pre.current) {
      const range = document.createRange();
      range.selectNodeContents(pre.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  }, [example]);

  return (
    <Sheet open onClose={onClose} titleId={titleId} width="sm:max-w-[600px]">
      <SheetHeader
        titleId={titleId}
        title={card.titleUz}
        onClose={onClose}
        sub={`${categoryLabel(card.category)} · ${styleLabel(card.style)} · ${t.gallery.seconds(Math.round(card.durationSeconds))}`}
      />

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
        <p className="leading-relaxed">{card.conceptUz}</p>
        <p className="mt-2 text-[13.5px] text-muted">{card.sourceNote}</p>

        <p className="mt-6 mb-2 text-[13px] font-semibold text-muted">{t.gallery.sheetPromptLabel}</p>
        {error ? (
          <ErrorNotice
            error={error}
            onRetry={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          />
        ) : example ? (
          <pre
            ref={pre}
            className="rounded-input border border-line bg-bg p-4 font-mono text-[13px] leading-[1.7] break-words whitespace-pre-wrap text-ink/90 select-text"
          >
            {example.promptEn}
          </pre>
        ) : (
          <div aria-hidden className="space-y-2.5 rounded-input border border-line bg-bg p-4">
            {[92, 100, 84, 96, 70, 88, 60].map((w, i) => (
              <span key={i} className="block h-3 animate-pulse rounded-full bg-raised-2" style={{ width: `${w}%` }} />
            ))}
            <span className="sr-only">{t.gallery.loading}</span>
          </div>
        )}
      </div>

      <div className="border-t border-line px-5 py-4 sm:px-7">
        <p role="status" aria-live="polite" className={copy === 'failed' ? 'mb-3 text-[13.5px] text-ink' : 'sr-only'}>
          {copy === 'failed' ? t.gallery.copyFailed : copy === 'ok' ? t.gallery.copied : ''}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => void onCopy()} disabled={!example} className={button({ variant: 'solid', size: 'md', className: 'sm:flex-1' })}>
            {copy === 'ok' ? <Check size={18} weight="bold" aria-hidden className="text-success" /> : <Copy size={18} aria-hidden />}
            {copy === 'ok' ? t.gallery.copied : t.gallery.copy}
          </button>
          <button
            type="button"
            onClick={() => {
              rememberInspiration({ id: card.id, titleUz: card.titleUz });
              router.push('/studiya');
            }}
            className={button({ variant: 'outline', size: 'md', className: 'sm:flex-1' })}
          >
            <Sparkle size={18} aria-hidden />
            {t.gallery.useStyle}
          </button>
        </div>
        <p className="mt-3 text-[12.5px] leading-snug text-muted">{t.gallery.free}</p>
      </div>
    </Sheet>
  );
}
