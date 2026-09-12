'use client';

import { errorCopy, t } from '@/lib/i18n';
import { isTerminal, type JobStatus } from '@/lib/generation';

/**
 * Everything a generation can be other than `ready`: waiting, questions, a refusal, a
 * failure.
 *
 * Each non-ready state says what happened to the credit, because that is the seller's
 * first question and D-020 makes the answer always the same one: it came back. The only
 * state that spends a credit is `ready`, and `ready` is rendered elsewhere.
 *
 * The waiting state carries an indeterminate bar rather than a percentage, because the
 * API exposes no progress and a fake percentage is a lie a seller can catch. The bar
 * stops under prefers-reduced-motion; the sentence beside it already says everything.
 */
export function GenerationProgress({
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
  onRetry?: () => void;
  onEdit?: () => void;
}) {
  if (status === null || status === 'ready') return null;

  const waiting = !isTerminal(status);

  return (
    <section
      // Announced, because a seller may be looking at their photo rather than this pane
      // when a 60-second job finishes.
      role="status"
      aria-live="polite"
      className="mt-7 overflow-hidden rounded-md border border-border bg-primary/5"
    >
      {waiting ? (
        <>
          <span
            aria-hidden
            className="indeterminate block h-[3px] w-full overflow-hidden bg-stone-2"
          />
          <div className="flex items-start gap-3 px-4 py-4">
            <span
              aria-hidden
              className="mt-[7px] size-2.5 shrink-0 animate-pulse rounded-full bg-primary"
            />
            <div className="min-w-0">
              <p className="text-[15.5px] font-bold">
                {status === 'queued' ? t.generate.queuedTitle : t.generate.runningTitle}
              </p>
              <p className="mt-1 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">
                {t.generate.runningNote}
              </p>
            </div>
          </div>
        </>
      ) : null}

      {status === 'needs_input' ? (
        <div className="px-4 py-4">
          <p className="text-[15.5px] font-bold">{t.generate.questionsTitle}</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
            {t.generate.questionsSub}
          </p>
          {questionsUz.length > 0 ? (
            <ul className="mt-2.5 list-disc pl-5">
              {questionsUz.map((question) => (
                <li key={question} className="text-[15.5px] leading-relaxed">
                  {question}
                </li>
              ))}
            </ul>
          ) : null}
          {/* §29: a repeated identical request is answered from the cache. Saying so
              stops it looking like the app simply ignored the button. */}
          {fromCache ? (
            <p className="mt-2.5 text-[14px] text-muted">{t.generate.cached}</p>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="mt-3.5 inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
            >
              {t.review.edit}
            </button>
          ) : null}
        </div>
      ) : null}

      {status === 'refused' ? (
        <div className="px-4 py-4">
          <p className="text-[15.5px] font-bold">{t.generate.refusedTitle}</p>
          {/* The model's own Uzbek explanation. Never a provider message: the API sends
              messageUz for exactly this, and errorCode is null on a refusal. */}
          {messageUz ? (
            <p className="mt-1 text-[15.5px] leading-relaxed">{messageUz}</p>
          ) : null}
          <p className="mt-1.5 text-[14.5px] text-muted">{t.generate.refusedSub}</p>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="mt-3.5 inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
            >
              {t.review.edit}
            </button>
          ) : null}
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="px-4 py-4">
          <p className="text-[15.5px] font-bold">{t.generate.failedTitle}</p>
          {/* Mapped copy for the §9 code, never the code itself. */}
          <p className="mt-1 text-[15px] leading-relaxed">
            {errorCopy(errorCode ?? 'INTERNAL_ERROR').message}
          </p>
          <p className="mt-1.5 text-[14.5px] text-muted">{t.generate.failedSub}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3.5 inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
            >
              {t.generate.retry}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
