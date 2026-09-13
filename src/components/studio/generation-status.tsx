'use client';

import { ArrowClockwise, HourglassMedium, PencilSimple, Question, WarningCircle } from '@phosphor-icons/react';
import { button } from '../ui/button';
import type { JobStatus } from '@/lib/api/types';
import { isTerminal } from '@/lib/generation';
import { errorCopy, t } from '@/lib/i18n';

/**
 * Every generation state except `ready`. Each says what happened to the credit, because that is the
 * seller's first question. The waiting bar is indeterminate: the API exposes no progress.
 */
export function GenerationStatus({
  status,
  questionsUz,
  messageUz,
  errorCode,
  fromCache,
  onRetry,
  onEdit,
}: {
  status: JobStatus | null;
  questionsUz: string[];
  messageUz: string | null;
  errorCode: string | null;
  fromCache: boolean;
  onRetry: () => void;
  onEdit: () => void;
}) {
  if (status === null || status === 'ready') return null;
  const waiting = !isTerminal(status);

  return (
    <section role="status" aria-live="polite" className="mt-6 overflow-hidden rounded-card border border-line bg-raised">
      {waiting ? <span aria-hidden className="indeterminate block h-[3px] bg-raised-2" /> : null}
      <div className="flex gap-4 p-5">
        <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full border ${status === 'failed' || status === 'refused' ? 'border-danger/40 text-danger' : 'border-line'}`}>
          {waiting ? <HourglassMedium size={20} /> : status === 'needs_input' ? <Question size={20} /> : <WarningCircle size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          {waiting ? (
            <>
              <p className="font-semibold">{status === 'queued' ? t.generate.queuedTitle : t.generate.runningTitle}</p>
              <p className="mt-1 max-w-[52ch] text-[14px] leading-relaxed text-muted">{t.generate.runningNote}</p>
            </>
          ) : null}

          {status === 'needs_input' ? (
            <>
              <p className="font-semibold">{t.generate.questionsTitle}</p>
              <p className="mt-1 text-[14px] text-muted">{t.generate.questionsSub}</p>
              {questionsUz.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  {questionsUz.map((q) => (
                    <li key={q} className="leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ul>
              ) : null}
              {fromCache ? <p className="mt-3 text-[13.5px] text-muted">{t.generate.cached}</p> : null}
              <button type="button" onClick={onEdit} className={button({ variant: 'outline', size: 'sm', className: 'mt-4' })}>
                <PencilSimple size={16} aria-hidden />
                {t.generate.editBrief}
              </button>
            </>
          ) : null}

          {status === 'refused' ? (
            <>
              <p className="font-semibold">{t.generate.refusedTitle}</p>
              {messageUz ? <p className="mt-1 leading-relaxed">{messageUz}</p> : null}
              <p className="mt-1 text-[14px] text-muted">{t.generate.refusedSub}</p>
              <button type="button" onClick={onEdit} className={button({ variant: 'outline', size: 'sm', className: 'mt-4' })}>
                <PencilSimple size={16} aria-hidden />
                {t.generate.editBrief}
              </button>
            </>
          ) : null}

          {status === 'failed' ? (
            <>
              <p className="font-semibold">{t.generate.failedTitle}</p>
              <p className="mt-1 leading-relaxed">{errorCopy(errorCode ?? 'INTERNAL_ERROR').message}</p>
              <p className="mt-1 text-[14px] text-muted">{t.generate.failedSub}</p>
              <button type="button" onClick={onRetry} className={button({ variant: 'outline', size: 'sm', className: 'mt-4' })}>
                <ArrowClockwise size={16} aria-hidden />
                {t.generate.retry}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
