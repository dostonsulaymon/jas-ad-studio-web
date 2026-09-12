'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StepProduct } from './step-product';
import { StepDirection } from './step-direction';
import { StepReview } from './step-review';
import type { Photo } from './photo-rail';
import type { UploadItem } from './upload-list';
import { HERO_FILES_EVENT } from '../hero-tray';
import { ErrorNotice } from '../error-notice';
import { GenerationProgress } from './generation-progress';
import { GenerationResult } from './result';
import { emptyDraft, isStep1Complete, type Draft } from '@/lib/brief';
import { isTerminal, type GenerationDetailDto, type JobStatus } from '@/lib/generation';
import { t } from '@/lib/i18n';

const STEPS = [t.studio.stepProduct, t.studio.stepDirection, t.studio.stepReview] as const;
const DRAFT_KEY = 'jas.draft.v1';

/**
 * The direction's second structural idea: a two-pane workbench. Controls on the left,
 * the seller's product pinned on the right so it is visible for all three steps.
 *
 * Below `lg` the right pane becomes a sticky strip under the step rail rather than a
 * hidden pane, because source 01 §6 asks that the seller never loses sight of their
 * product, and a pane you have to go and find is a pane you have lost sight of.
 */
export function Workbench({
  photos,
  uploads,
  error,
  saving,
  saved,
  onAddFiles,
  onMakePrimary,
  onRemovePhoto,
  onRemoveUpload,
  onSave,
  onRetry,
  generation,
  jobStatus,
  fromCache,
  onGenerate,
  onDismissResult,
}: {
  photos: Photo[];
  uploads: UploadItem[];
  error: unknown;
  saving: boolean;
  saved: boolean;
  onAddFiles: (files: FileList, draft: Draft) => void;
  onMakePrimary: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onRemoveUpload: (id: string) => void;
  onSave: (draft: Draft) => void;
  onRetry: () => void;
  generation?: GenerationDetailDto | null;
  jobStatus?: JobStatus | null;
  fromCache?: boolean;
  onGenerate?: (draft: Draft) => void;
  onDismissResult?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reached, setReached] = useState<1 | 2 | 3>(1);
  const [showErrors, setShowErrors] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  // Mirrors `draft` so event callbacks can read the current value without either
  // capturing a stale one or running a side effect inside a state updater.
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  /**
   * The draft survives a sign-in round trip through Google, which is the whole point:
   * SESSION_EXPIRED sends the seller away mid-brief and they must come back to their
   * own words, not an empty form.
   */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DRAFT_KEY);
      // sessionStorage is an external store that does not exist during server render,
      // so reading it has to happen after mount. This is the one-time external-store
      // sync the rule's own documentation carves out; a lazy initialiser would read it
      // on the server as undefined and produce a hydration mismatch instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setDraft({ ...emptyDraft(), ...(JSON.parse(stored) as Partial<Draft>) });
    } catch {
      // A blocked or full sessionStorage is not worth an error screen.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  const change = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);

  /**
   * Files dropped into the hero tray arrive here. The draft is read at the moment the
   * event fires rather than captured, so a name typed after the drop still counts.
   */
  useEffect(() => {
    const onHeroFiles = (event: Event) => {
      const files = (event as CustomEvent<FileList>).detail;
      onAddFiles(files, draftRef.current);
    };
    window.addEventListener(HERO_FILES_EVENT, onHeroFiles);
    return () => window.removeEventListener(HERO_FILES_EVENT, onHeroFiles);
  }, [onAddFiles]);

  const go = useCallback((next: 1 | 2 | 3) => {
    setStep(next);
    setReached((r) => (next > r ? next : r));
    // Move focus to the step heading so a keyboard user is not left at the bottom of
    // the previous step, and a screen reader hears where it landed.
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  const advance = () => {
    if (step === 1 && !isStep1Complete(draft)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < 3) go((step + 1) as 2 | 3);
    else onSave(draft);
  };

  const errors = showErrors
    ? {
        productName: draft.productName.trim() ? undefined : t.common.required,
        description: draft.description.trim() ? undefined : t.common.required,
      }
    : {};

  /**
   * Bring the generation status into view when a job starts.
   *
   * Without this the only feedback for pressing "Prompt tayyorlash" is a status panel
   * below the fold, so on a 1440x740 screen the button greys out and nothing else
   * appears to happen for a minute.
   */
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!jobStatus || isTerminal(jobStatus)) return;
    progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [jobStatus]);

  /** Once the package exists, the brief has been submitted and saving again is noise. */
  const hasResult = generation?.status === 'ready' && Boolean(generation.package);

  const busy = uploads.some((u) => u.state.status === 'uploading' || u.state.status === 'queued');
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];

  return (
    <section id="studiya-boshlash" className="border-t border-border">
      {/* Step rail: three real buttons, steps ahead of the furthest reached disabled. */}
      <div className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-2 overflow-x-auto px-5 py-3 sm:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STEPS.map((name, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = n === step;
            return (
              <button
                key={name}
                type="button"
                onClick={() => go(n)}
                disabled={n > reached}
                aria-current={active ? 'step' : undefined}
                className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-sm px-3 text-[14.5px] font-semibold whitespace-nowrap transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-40 ${
                  active ? 'text-ink' : 'text-muted'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-7 items-center justify-center rounded-full border text-[13.5px] font-bold ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-muted'
                  }`}
                >
                  {n}
                </span>
                {name}
              </button>
            );
          })}
          <span className="ml-auto hidden shrink-0 text-[14px] text-muted lg:block">
            {t.studio.draftSaved}
          </span>
        </div>
      </div>

      {/* Mobile: the product stays on screen as a sticky strip, never a hidden pane. */}
      {primary ? (
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-stone-1 px-5 py-3 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated, no-store */}
          <img
            src={primary.url}
            alt=""
            className="size-[54px] shrink-0 rounded-[10px] border border-border bg-white object-contain"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-bold">
              {draft.productName || t.studio.yourProduct}
            </span>
            <span className="block text-[13px] text-muted">
              {t.projects.photoCount(photos.length)}
            </span>
          </span>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-[1180px] lg:grid-cols-[1fr_360px]">
        <div className="px-5 pt-8 pb-28 sm:px-14 lg:border-r lg:border-border lg:pb-10">
          <div ref={headingRef} tabIndex={-1} className="outline-none">
            <p aria-live="polite" className="sr-only">
              {t.studio.stepAnnounce(step, STEPS[step - 1])}
            </p>

            {step === 1 ? (
              <StepProduct
                draft={draft}
                photos={photos}
                uploads={uploads}
                errors={errors}
                onChange={change}
                onAddFiles={(files) => onAddFiles(files, draft)}
                onMakePrimary={onMakePrimary}
                onRemovePhoto={onRemovePhoto}
                onRemoveUpload={onRemoveUpload}
              />
            ) : null}

            {step === 2 ? <StepDirection draft={draft} onChange={change} /> : null}

            {step === 3 ? (
              <>
                {/* The result replaces the review rather than sitting under it: once a
                    package exists it is what the seller came for, and a form they have
                    already submitted competing with it is noise. */}
                {generation?.status === 'ready' && generation.package ? (
                  <GenerationResult pkg={generation.package} productName={draft.productName} />
                ) : (
                  <StepReview
                    draft={draft}
                    photoCount={photos.length}
                    onEdit={go}
                    onGenerate={onGenerate ? () => onGenerate(draft) : undefined}
                    generating={jobStatus !== null && jobStatus !== undefined && !isTerminal(jobStatus)}
                  />
                )}

                {generation ?? jobStatus ? (
                  <div ref={progressRef}>
                  <GenerationProgress
                    status={generation?.status ?? jobStatus ?? null}
                    questionsUz={generation?.questionsUz ?? []}
                    messageUz={generation?.messageUz ?? null}
                    errorCode={generation?.errorCode ?? null}
                    fromCache={fromCache === true}
                    onRetry={onGenerate ? () => onGenerate(draft) : undefined}
                    onEdit={() => {
                      onDismissResult?.();
                      go(1);
                    }}
                  />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {error ? <ErrorNotice error={error} onRetry={onRetry} className="mt-6" /> : null}

          {saved ? (
            <p role="status" className="mt-6 text-[15px] font-bold text-primary">
              {t.review.saved}
            </p>
          ) : null}

          {/* Desktop footer. On a phone this becomes the fixed bar below. */}
          <div className="mt-8 hidden items-center gap-5 border-t border-border pt-6 lg:flex">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => go((step - 1) as 1 | 2)}
                className="inline-flex h-[52px] items-center rounded-md border border-border bg-white px-5 text-base font-bold"
              >
                {t.studio.back}
              </button>
            ) : null}
            {!hasResult ? (
              <button
                type="button"
                onClick={advance}
                disabled={busy || saving}
                className="inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white transition-transform duration-fast active:translate-y-px disabled:opacity-40"
              >
                {step === 3 ? (saving ? t.review.saving : t.review.save) : t.studio.continue}
              </button>
            ) : null}
            <span className="text-[14px] text-muted">
              {busy
                ? t.upload.summary(
                    uploads.filter((u) => u.state.status === 'done').length,
                    uploads.filter(
                      (u) => u.state.status === 'uploading' || u.state.status === 'queued',
                    ).length,
                  )
                : step === 1
                  ? t.studio.nextIsDirection
                  : step === 2
                    ? t.studio.nextIsReview
                    : ''}
            </span>
          </div>
        </div>

        {/* The pinned product. Sticky so it is still there at the bottom of a long step. */}
        <aside className="hidden bg-stone-1 px-8 py-8 lg:block">
          <div className="sticky top-6">
            <p className="mb-3.5 text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
              {t.studio.yourProduct}
            </p>

            {primary ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated, no-store */}
                <img
                  src={primary.url}
                  alt=""
                  className="h-[300px] w-full rounded-lg border border-border bg-white object-contain"
                />
                <span className="absolute top-3.5 left-3.5 inline-flex h-[30px] items-center rounded-full bg-accent px-3 text-[12.5px] font-bold text-ink">
                  {t.studio.primaryBadge}
                </span>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-lg border-[1.5px] border-dashed border-border px-6 text-center text-[14px] leading-snug text-muted">
                {t.hero.trayDropTitle} {t.hero.trayDropTitle2}
              </div>
            )}

            <div className="mt-4 text-[14px] leading-[1.9] text-muted">
              <p className="font-semibold text-ink">{draft.productName || ' '}</p>
              <p>{t.projects.photoCount(photos.length)}</p>
            </div>

            {/* Only the steps that are actually still ahead. A static list that still
                says "2. Reklama yoʻnalishi" while the seller is on step 2 is noise. */}
            {step < 3 ? (
              <>
                <hr className="my-5 border-0 border-t border-border" />
                <p className="mb-3.5 text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
                  {t.studio.nextSteps}
                </p>
                <ol className="text-[14px] leading-[1.9] text-muted">
                  {STEPS.map((name, i) =>
                    i + 1 > step ? <li key={name}>{`${i + 1}. ${name}`}</li> : null,
                  )}
                </ol>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Phone: a fixed action bar, so the primary action is always reachable. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg px-5 py-3.5 pb-5 lg:hidden">
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => go((step - 1) as 1 | 2)}
              className="inline-flex h-[52px] shrink-0 items-center rounded-md border border-border bg-white px-5 text-base font-bold"
            >
              {t.studio.back}
            </button>
          ) : null}
          {!hasResult ? (
            <button
              type="button"
              onClick={advance}
              disabled={busy || saving}
              className="inline-flex h-[52px] flex-1 items-center justify-center rounded-md bg-primary px-6 text-base font-bold text-white disabled:opacity-40"
            >
              {step === 3 ? (saving ? t.review.saving : t.review.save) : t.studio.continue}
            </button>
          ) : null}
        </div>
        {busy ? (
          <p className="mt-2.5 text-center text-[13px] text-muted">
            {t.upload.summary(
              uploads.filter((u) => u.state.status === 'done').length,
              uploads.filter((u) => u.state.status === 'uploading' || u.state.status === 'queued')
                .length,
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}
