'use client';

import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { button } from './button';
import { t } from '@/lib/i18n';

/**
 * The one dialog primitive: a right-hand panel from 640px up, a bottom sheet below it. Focus moves
 * into the panel, is trapped there, returns to the trigger on close; Escape and the backdrop close.
 */
export function Sheet({
  open,
  onClose,
  titleId,
  width = 'sm:max-w-[520px]',
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  width?: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const heading = panel.current?.querySelector<HTMLElement>(`#${CSS.escape(titleId)}`);
    (heading ?? panel.current)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = [
        ...panel.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = overflow;
      returnTo?.focus?.();
    };
  }, [open, titleId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden onClick={onClose} className="animate-fade absolute inset-0 bg-black/75" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`animate-sheet absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-card border-t border-line bg-raised outline-none sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-full sm:rounded-none sm:border-t-0 sm:border-l ${width}`}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  titleId,
  title,
  sub,
  onClose,
}: {
  titleId: string;
  title: string;
  sub?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
      <div className="min-w-0 flex-1 pt-1">
        <h2 id={titleId} tabIndex={-1} className="text-[20px] leading-snug font-bold tracking-[-0.02em] outline-none sm:text-[22px]">
          {title}
        </h2>
        {sub ? <div className="mt-1 text-[14px] text-muted">{sub}</div> : null}
      </div>
      <button type="button" onClick={onClose} className={button({ variant: 'outline', size: 'icon' })}>
        <X size={18} aria-hidden />
        <span className="sr-only">{t.common.close}</span>
      </button>
    </div>
  );
}
