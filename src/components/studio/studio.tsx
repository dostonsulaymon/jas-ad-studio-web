'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Lightning } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { useSession } from '../session';
import { StepRail } from './step-rail';
import { StepProduct, type Photo, type Upload } from './step-product';
import { StepDirection } from './step-direction';
import { StepReview } from './step-review';
import { GenerationStatus } from './generation-status';
import { GenerationResult } from './result';
import { ProductPanel } from './product-panel';
import { api, ApiError, isAbort, uploadWithProgress } from '@/lib/api/client';
import type { GenerationDetail, JobStatus, ProjectDetail, ProjectSummary, StoredAsset } from '@/lib/api/types';
import { draftFromProject, emptyDraft, isStep1Complete, LIMITS, reviveDraft, toBriefDto, type Draft } from '@/lib/brief';
import { DRAFT_KEY, PROJECT_KEY } from '@/lib/gallery';
import { isTerminal, listGenerations, newIdempotencyKey, pollUntilDone, readyVersions, startGeneration } from '@/lib/generation';
import { t } from '@/lib/i18n';

type Step = 1 | 2 | 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const referenceUrl = (id: string) => `/api/assets/${id}/reference`;

function storeProjectId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(PROJECT_KEY, id);
    else sessionStorage.removeItem(PROJECT_KEY);
  } catch {
    /* blocked storage */
  }
}

/**
 * Owns the studio's state and every API call it makes.
 *
 * Ordering the API imposes: photos attach to a project, so the project is created from step 1's
 * name and description on the first upload (never with invented placeholder text). The brief is
 * PATCHed before every generation because the worker reads the brief from the project row.
 */
export function Studio() {
  const session = useSession();
  const signedIn = session.status === 'signedIn';

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [reached, setReached] = useState<Step>(1);
  const [showErrors, setShowErrors] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState<unknown>(null);

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [generation, setGeneration] = useState<GenerationDetail | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [versions, setVersions] = useState<GenerationDetail[]>([]);
  const attemptKey = useRef<string | null>(null);
  const poll = useRef<AbortController | null>(null);
  const restoredProject = useRef<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  /*
   * Restore, then save. StrictMode runs mount effects twice in development; the save waits for
   * `hydrated`, so the empty initial draft can never overwrite the stored one.
   */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of an external store after mount
      if (stored) setDraft(reviveDraft(JSON.parse(stored)));
      const storedProject = sessionStorage.getItem(PROJECT_KEY);
      if (storedProject) {
        restoredProject.current = storedProject;
        setProjectId(storedProject);
      }
    } catch {
      /* blocked or corrupt storage starts a fresh draft */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft, hydrated]);

  useEffect(() => () => poll.current?.abort(), []);

  const change = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);

  const go = useCallback((next: Step) => {
    setStep(next);
    setReached((r) => (next > r ? next : r));
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }, []);

  const loadAssets = useCallback(async (id: string) => {
    const assets = await api.get<StoredAsset[]>(`/api/projects/${id}/assets`);
    setPhotos(assets.map((a, i) => ({ id: a.id, url: referenceUrl(a.id), isPrimary: a.isPrimary || (i === 0 && !assets.some((x) => x.isPrimary)) })));
  }, []);

  /** A reload keeps the project: its photos and saved prompts come back once the session is known. */
  useEffect(() => {
    const id = restoredProject.current;
    if (!hydrated || !signedIn || !id) return;
    restoredProject.current = null;
    Promise.all([loadAssets(id), listGenerations(id).then((list) => setVersions(readyVersions(list)))]).catch((cause: unknown) => {
      if (cause instanceof ApiError && (cause.status === 404 || cause.code === 'PROJECT_NOT_FOUND')) {
        setProjectId(null);
        storeProjectId(null);
        return;
      }
      setError(cause);
    });
  }, [hydrated, signedIn, loadAssets]);

  /** Opening a saved project: from the drawer, or `?loyiha=<id>`. It opens on its newest prompt if it has one. */
  const openProject = useCallback(
    async (id: string) => {
      poll.current?.abort();
      attemptKey.current = null;
      try {
        // Nothing is reset until the project has actually loaded, so a failed open leaves the studio as it was.
        const detail = await api.get<ProjectDetail>(`/api/projects/${id}`);
        setError(null);
        setGeneration(null);
        setJobStatus(null);
        setVersions([]);
        setUploads([]);
        setDraft(draftFromProject(detail));
        setProjectId(detail.id);
        storeProjectId(detail.id);
        setShowErrors(false);
        setReached(3);
        const [, list] = await Promise.all([loadAssets(detail.id), listGenerations(detail.id)]);
        const ready = readyVersions(list);
        setVersions(ready);
        const newest = ready[ready.length - 1];
        if (newest) {
          setGeneration(newest);
          setJobStatus('ready');
          go(3);
        } else {
          go(1);
        }
      } catch (cause) {
        setError(cause);
      }
    },
    [loadAssets, go],
  );

  const { requestedProjectId, clearRequestedProject, openProject: requestProject } = session;
  useEffect(() => {
    if (!hydrated || !signedIn) return;
    const fromUrl = new URLSearchParams(window.location.search).get('loyiha');
    if (fromUrl) {
      window.history.replaceState(null, '', '/studiya');
      requestProject(fromUrl);
    }
  }, [hydrated, signedIn, requestProject]);

  /* The drawer's request is taken once: the ref stops StrictMode's second effect run opening it twice. */
  const takenRequest = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated || !signedIn || !requestedProjectId || takenRequest.current === requestedProjectId) return;
    const id = requestedProjectId;
    takenRequest.current = id;
    void Promise.resolve().then(() => {
      clearRequestedProject();
      takenRequest.current = null;
      return openProject(id);
    });
  }, [hydrated, signedIn, requestedProjectId, clearRequestedProject, openProject]);

  const saveBrief = useCallback(async (): Promise<string> => {
    const body = toBriefDto(draft);
    const saved = projectId
      ? await api.patch<ProjectSummary>(`/api/projects/${projectId}`, { json: body })
      : await api.post<ProjectSummary>('/api/projects', { json: body });
    setProjectId(saved.id);
    storeProjectId(saved.id);
    return saved.id;
  }, [draft, projectId]);

  const addFiles = useCallback(
    async (files: File[]) => {
      setError(null);
      if (!signedIn) return;
      if (!isStep1Complete(draft)) {
        setShowErrors(true);
        return;
      }
      const busy = uploads.filter((u) => u.status === 'uploading').length;
      const room = LIMITS.maxPhotos - photos.length - busy;
      if (room <= 0) {
        setError(new ApiError({ code: 'TOO_MANY_PHOTOS', status: 400 }));
        return;
      }
      const chosen = files.slice(0, room);

      let pid = projectId;
      if (!pid) {
        try {
          pid = await saveBrief();
        } catch (cause) {
          setError(cause);
          return;
        }
      }

      for (const file of chosen) {
        const key = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
        const refuse = (code: string) => setUploads((list) => [...list.filter((u) => u.key !== key), { key, name: file.name, status: 'refused', percent: 0, code }]);

        if (!ACCEPTED_TYPES.includes(file.type)) {
          refuse('UPLOAD_TYPE');
          continue;
        }
        if (file.size > LIMITS.photoBytes) {
          refuse('UPLOAD_TOO_LARGE');
          continue;
        }

        setUploads((list) => [...list, { key, name: file.name, status: 'uploading', percent: 0 }]);
        const { promise } = uploadWithProgress<StoredAsset>(`/api/projects/${pid}/assets`, 'photo', file, (percent) =>
          setUploads((list) => list.map((u) => (u.key === key ? { ...u, percent } : u))),
        );
        promise
          .then((asset) => {
            setUploads((list) => list.filter((u) => u.key !== key));
            setPhotos((list) => [...list, { id: asset.id, url: referenceUrl(asset.id), isPrimary: asset.isPrimary || list.length === 0 }]);
          })
          .catch((cause: unknown) => refuse(cause instanceof ApiError ? cause.code : 'INTERNAL_ERROR'));
      }
    },
    [signedIn, draft, uploads, photos.length, projectId, saveBrief],
  );

  const removePhoto = useCallback(async (id: string) => {
    setPhotos((list) => {
      const next = list.filter((p) => p.id !== id);
      if (next.length > 0 && !next.some((p) => p.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return next;
    });
    try {
      await api.delete(`/api/assets/${id}`);
    } catch (cause) {
      setError(cause);
    }
  }, []);

  const generate = useCallback(async () => {
    setError(null);
    setFromCache(false);
    if (photos.length === 0) {
      setError(new ApiError({ code: 'NO_ASSETS', status: 400 }));
      return;
    }

    let pid: string;
    try {
      pid = await saveBrief();
    } catch (cause) {
      setError(cause);
      return;
    }

    attemptKey.current ??= newIdempotencyKey();
    setGeneration(null);
    setJobStatus('queued');
    poll.current?.abort();
    const controller = new AbortController();
    poll.current = controller;

    try {
      const accepted = await startGeneration(pid, attemptKey.current, controller.signal);
      if (accepted.fromCache) {
        const now = new Date().toISOString();
        setFromCache(true);
        setJobStatus('needs_input');
        setGeneration({ id: accepted.generationId, projectId: pid, status: 'needs_input', questionsUz: accepted.questionsUz, messageUz: null, errorCode: null, createdAt: now, finishedAt: now, package: null });
        attemptKey.current = null;
        return;
      }
      const done = await pollUntilDone(accepted.generationId, { onStatus: setJobStatus, signal: controller.signal });
      setGeneration(done);
      setJobStatus(done.status);
      if (done.status === 'ready' && done.package) setVersions((list) => (list.some((v) => v.id === done.id) ? list : [...list, done]));
      attemptKey.current = null;
      session.refreshBalance();
    } catch (cause) {
      if (isAbort(cause)) return;
      setError(cause);
      setJobStatus(null);
      // The key is kept: the job may exist, and a retry with the same key rejoins it instead of paying twice.
    }
  }, [photos.length, saveBrief, session]);

  const advance = () => {
    if (step === 1 && !isStep1Complete(draft)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < 3) go((step + 1) as Step);
  };

  const running = jobStatus !== null && !isTerminal(jobStatus);
  /**
   * R-019: once a seller has a prompt, the thing they actually want from step 2 is a different
   * `reklama formati` and a new prompt — not a walk back through step 3. So the button there
   * becomes **Tayyorlash** and generates straight away. It still says what it costs, because
   * skipping the review step skips the one screen that used to say so.
   */
  const canRegenerate = step === 2 && versions.length > 0;
  const hasResult = step === 3 && generation?.status === 'ready' && Boolean(generation.package);
  const uploading = uploads.some((u) => u.status === 'uploading');
  const errors = showErrors
    ? { productName: draft.productName.trim() ? undefined : t.common.required, description: draft.description.trim() ? undefined : t.common.required }
    : {};

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 xl:gap-20">
      <section aria-label={t.studio.stepsLabel} className="min-w-0">
        <StepRail step={step} reached={reached} onGo={go} disabled={running} />
        <ProductPanel compact draft={draft} photos={photos} />

        <div ref={headingRef} tabIndex={-1} className="scroll-mt-24 pt-8 outline-none">
          <p aria-live="polite" className="sr-only">
            {t.studio.stepAnnounce(step, t.studio.steps[step - 1])}
          </p>

          {step === 1 ? (
            <StepProduct
              draft={draft}
              errors={errors}
              signedIn={signedIn}
              sessionLoading={session.status === 'loading'}
              photos={photos}
              uploads={uploads}
              onChange={change}
              onFiles={(files) => void addFiles(files)}
              onRemovePhoto={(id) => void removePhoto(id)}
              onDismissUpload={(key) => setUploads((list) => list.filter((u) => u.key !== key))}
            />
          ) : null}

          {step === 2 ? <StepDirection draft={draft} onChange={change} /> : null}

          {step === 3 && hasResult && generation?.package ? (
            <GenerationResult
              pkg={generation.package}
              productName={draft.productName}
              versions={versions}
              shownId={generation.id}
              onPickVersion={(id) => {
                const picked = versions.find((v) => v.id === id);
                if (picked) setGeneration(picked);
              }}
              onNewVersion={() => {
                setGeneration(null);
                setJobStatus(null);
              }}
            />
          ) : null}

          {step === 3 && !hasResult ? (
            <>
              <StepReview draft={draft} photoCount={photos.length} onEdit={go} />
              <GenerationStatus
                status={generation?.status ?? jobStatus}
                questionsUz={generation?.questionsUz ?? []}
                messageUz={generation?.messageUz ?? null}
                errorCode={generation?.errorCode ?? null}
                fromCache={fromCache}
                onRetry={() => void generate()}
                onEdit={() => {
                  setGeneration(null);
                  setJobStatus(null);
                  go(1);
                }}
              />
            </>
          ) : null}

          {error ? <ErrorNotice error={error} onRetry={step === 3 ? () => void generate() : () => setError(null)} className="mt-6" /> : null}
        </div>

        {!hasResult ? (
          <div className="sticky bottom-0 z-10 -mx-4 mt-10 flex items-center gap-3 border-t border-line bg-bg px-4 py-3 sm:static sm:mx-0 sm:border-t sm:bg-transparent sm:px-0 sm:pt-6 sm:pb-0">
            {step > 1 ? (
              <button type="button" onClick={() => go((step - 1) as Step)} disabled={running} className={button({ variant: 'outline', size: 'md', className: 'max-sm:w-12 max-sm:px-0' })}>
                <ArrowLeft size={18} aria-hidden />
                <span className="max-sm:sr-only">{t.studio.back}</span>
              </button>
            ) : null}
            {canRegenerate ? (
              <>
                <p className="ml-auto hidden max-w-[34ch] text-right text-[12.5px] leading-snug text-muted sm:block">
                  {t.studio.regenerateNote}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // Step 3 is where progress and the result render, so move there first and let
                    // the seller watch it work rather than leaving them on a step that says nothing.
                    go(3);
                    void generate();
                  }}
                  disabled={running || !signedIn || photos.length === 0 || uploading}
                  className={button({ variant: 'primary', size: 'md', className: 'max-sm:flex-1 sm:h-14 sm:px-7' })}
                >
                  <Lightning size={18} weight="fill" aria-hidden />
                  {running ? t.review.generating : t.studio.regenerate}
                </button>
              </>
            ) : step < 3 ? (
              <button type="button" onClick={advance} disabled={uploading} className={button({ variant: 'solid', size: 'md', className: 'max-sm:flex-1 sm:ml-auto' })}>
                {t.studio.continue}
                <ArrowRight size={18} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void generate()}
                disabled={running || !signedIn || photos.length === 0 || uploading}
                className={button({ variant: 'primary', size: 'md', className: 'max-sm:flex-1 sm:ml-auto sm:h-14 sm:px-7' })}
              >
                <Lightning size={18} weight="fill" aria-hidden />
                {running ? t.review.generating : t.review.generate}
              </button>
            )}
          </div>
        ) : null}
      </section>

      <ProductPanel draft={draft} photos={photos} />
    </div>
  );
}
