'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Lock, Sparkle } from '@phosphor-icons/react';
import { Sheet, SheetHeader } from '../ui/sheet';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { readGalleryExample, rememberInspiration } from '@/lib/gallery';
import { api } from '@/lib/api/client';
import { formatUzs } from '@/lib/i18n';
import { copyText } from '@/lib/generation';
import type { GalleryCard, GalleryExample, ProOrder, PublicSettings } from '@/lib/api/types';
import { t } from '@/lib/i18n';
import { categoryLabel, styleLabel } from './explorer';
import { useSession } from '../session';

/**
 * The example's prompt, fetched when the sheet opens (the list payload carries none). Copy puts the
 * prompt and nothing else on the clipboard; if the Clipboard API fails, the block is selected for
 * manual copying. "Shu uslubdan foydalanish" carries only the example's id into the studio.
 */
export function PromptSheet({ card, onClose }: { card: GalleryCard; onClose: () => void }) {
  const router = useRouter();
  const session = useSession();
  /**
   * R-010: a locked prompt is never asked for. The API would refuse it anyway — that refusal is
   * the enforcement — but firing a request we know answers 403 would put an error in the console
   * on a perfectly ordinary screen.
   */
  const locked = card.promptAccess === 'pro' && !session.hasPro;
  const titleId = useId();
  const [example, setExample] = useState<GalleryExample | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [copy, setCopy] = useState<'idle' | 'ok' | 'failed'>('idle');
  const [attempt, setAttempt] = useState(0);
  const pre = useRef<HTMLPreElement>(null);

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [order, setOrder] = useState<ProOrder | null>(null);
  const [ordering, setOrdering] = useState(false);

  /**
   * D-102: what PRO costs, and where to send the money. Asked only when the panel is actually
   * locked, and the price may be null — which means PRO is not for sale and the panel says so
   * rather than inventing a number (D-072's rule, one product over).
   */
  useEffect(() => {
    if (!locked || session.status !== 'signedIn') return;
    const controller = new AbortController();
    api
      .get<PublicSettings>('/api/settings/public', { signal: controller.signal })
      .then(setSettings)
      .catch(() => {
        /* the panel falls back to "ask the owner" */
      });
    api
      .get<ProOrder[]>('/api/pro/orders', { signal: controller.signal })
      .then((orders) => setOrder(orders.find((o) => o.status === 'pending') ?? null))
      .catch(() => {
        /* no order is the safe assumption */
      });
    return () => controller.abort();
  }, [locked, session.status]);

  const buy = useCallback(async () => {
    setOrdering(true);
    try {
      setOrder(await api.post<ProOrder>('/api/pro/orders'));
    } catch (cause) {
      setError(cause);
    } finally {
      setOrdering(false);
    }
  }, []);

  useEffect(() => {
    if (locked) return;
    const controller = new AbortController();
    readGalleryExample(card.slug, controller.signal)
      .then(setExample)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause);
      });
    return () => controller.abort();
  }, [card.slug, attempt, locked]);

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
        {locked ? (
          <div className="rounded-input border border-line bg-bg px-5 py-8 text-center">
            <Lock size={24} aria-hidden className="mx-auto text-muted" />
            <p className="mt-3 text-[17px] font-bold tracking-[-0.01em]">{t.gallery.lockedTitle}</p>
            <p className="mx-auto mt-2 max-w-[38ch] text-[14px] leading-snug text-muted">
              {session.status === 'signedIn' ? '' : t.gallery.lockedSignedOut}
            </p>
            {session.status !== 'signedIn' ? (
              <a href="/api/auth/google" className={button({ variant: 'solid', size: 'md', className: 'mt-5' })}>
                {t.gallery.lockedSignIn}
              </a>
            ) : order ? (
              <div className="mx-auto mt-5 max-w-[42ch] rounded-input border border-line bg-raised px-4 py-4 text-left">
                <p className="font-semibold">{t.gallery.proPending}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-muted">{t.gallery.proPendingBody}</p>
                {settings?.paymentInstructions.cardNumber ? (
                  <>
                    <p className="mt-3 text-[12.5px] text-muted">{t.gallery.proPayTo}</p>
                    <p className="font-mono text-[15px] tracking-wide select-all">{settings.paymentInstructions.cardNumber}</p>
                    {settings.paymentInstructions.cardHolder ? (
                      <p className="text-[13px] text-muted">{settings.paymentInstructions.cardHolder}</p>
                    ) : null}
                    {settings.supportContacts.telegramUser ? (
                      <p className="mt-2 text-[13.5px] leading-snug">
                        {t.gallery.receipt(settings.supportContacts.telegramUser)}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : settings && settings.proSubscription.priceUzs !== null ? (
              <button
                type="button"
                disabled={ordering}
                onClick={() => void buy()}
                className={button({ variant: 'primary', size: 'md', className: 'mt-5' })}
              >
                {ordering ? t.gallery.proOrdering : `${t.gallery.proBuy} · ${formatUzs(settings.proSubscription.priceUzs)}`}
              </button>
            ) : null}
            {!order && settings && settings.proSubscription.priceUzs !== null ? (
              <p className="mx-auto mt-3 max-w-[38ch] text-[13px] leading-snug text-muted">
                {settings.proSubscription.generationsIncluded > 0
                  ? t.gallery.proIncludes(settings.proSubscription.generationsIncluded)
                  : t.gallery.proIncludesPromptsOnly}
              </p>
            ) : (
              <p className="mx-auto mt-4 max-w-[38ch] text-[13.5px] text-muted">{t.gallery.proNoPrice}</p>
            )}
          </div>
        ) : error ? (
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
          {locked ? null : (
          <button type="button" onClick={() => void onCopy()} disabled={!example} className={button({ variant: 'solid', size: 'md', className: 'sm:flex-1' })}>
            {copy === 'ok' ? <Check size={18} weight="bold" aria-hidden className="text-success" /> : <Copy size={18} aria-hidden />}
            {copy === 'ok' ? t.gallery.copied : t.gallery.copy}
          </button>
          )}
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
        {locked ? null : <p className="mt-3 text-[12.5px] leading-snug text-muted">{t.gallery.free}</p>}
      </div>
    </Sheet>
  );
}
