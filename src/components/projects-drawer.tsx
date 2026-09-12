'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api/client';
import type { StoredAssetDto } from '@/lib/brief';
import { ErrorNotice } from './error-notice';
import { formatDate, t } from '@/lib/i18n';
import type { ProjectSummaryDto } from '@/lib/brief';

/**
 * History is a drawer, not a page (W-004, source 01 §20): `/` stays the only route.
 *
 * Focus is managed properly because a dialog that does not is worse than no dialog:
 * focus moves to the heading on open, is trapped inside, returns to the trigger on
 * close, and Escape closes.
 */
export function ProjectsDrawer({
  open,
  projects,
  loading,
  error,
  onClose,
  onRetry,
  onStart,
  onDelete,
}: {
  open: boolean;
  projects: ProjectSummaryDto[];
  loading: boolean;
  error: unknown;
  onClose: () => void;
  onRetry: () => void;
  onStart: () => void;
  onDelete: (project: ProjectSummaryDto) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    heading.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;

      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.projects.close}
        onClick={onClose}
        className="absolute inset-0 w-full cursor-default bg-ink/35"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-bg shadow-[-28px_0_60px_rgba(23,33,29,0.14)]"
      >
        <div className="flex items-center gap-4 border-b border-border px-6 py-4 sm:px-8">
          <h2
            id="projects-title"
            ref={heading}
            tabIndex={-1}
            className="text-[24px] font-extrabold tracking-[-0.03em] outline-none"
          >
            {t.projects.title}
          </h2>
          <span className="ml-auto text-[14px] text-muted">
            {t.projects.count(projects.length)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.projects.close}
            className="flex size-11 items-center justify-center rounded-sm border border-border bg-white text-[15px]"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {error ? <ErrorNotice error={error} onRetry={onRetry} /> : null}

          {loading ? (
            <ul className="flex flex-col gap-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-[104px] animate-pulse rounded-md bg-stone-2" />
              ))}
            </ul>
          ) : null}

          {!loading && !error && projects.length === 0 ? <EmptyState onStart={onStart} /> : null}

          {!loading && projects.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-start gap-4 rounded-md border border-border bg-white p-4"
                >
                  <ProjectThumb projectId={project.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">{project.name}</span>
                    <span className="block text-[13.5px] text-muted">
                      {t.format[project.formatId as keyof typeof t.format]?.label ?? project.formatId}
                      {' · '}
                      {project.aspectRatio}
                      {' · '}
                      {formatDate(project.createdAt)}
                    </span>

                    {/* Confirmation names the project, and sits in the row rather than in
                        a window.confirm: a browser dialog cannot be styled, cannot be
                        translated, and blocks the page. */}
                    {confirming === project.id ? (
                      <span className="mt-3 block rounded-sm border border-border bg-primary/5 p-3">
                        <span className="block text-[13.5px] leading-snug">
                          {t.projects.deleteConfirm(project.name)}
                        </span>
                        <span className="mt-2.5 flex gap-2">
                          <button
                            type="button"
                            disabled={deleting === project.id}
                            onClick={async () => {
                              setDeleting(project.id);
                              await onDelete(project);
                              setDeleting(null);
                              setConfirming(null);
                            }}
                            className="h-11 rounded-sm bg-primary px-4 text-[13.5px] font-bold text-white disabled:opacity-50"
                          >
                            {t.projects.deleteConfirmAction}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming(null)}
                            className="h-11 rounded-sm border border-border bg-white px-4 text-[13.5px] font-semibold"
                          >
                            {t.projects.deleteCancel}
                          </button>
                        </span>
                      </span>
                    ) : null}
                  </span>

                  {confirming !== project.id ? (
                    <button
                      type="button"
                      onClick={() => setConfirming(project.id)}
                      aria-label={`${t.projects.delete}: ${project.name}`}
                      className="h-11 shrink-0 self-start rounded-sm border border-border bg-white px-3 text-[13.5px] font-semibold"
                    >
                      {t.projects.delete}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * ProjectSummaryDto carries no photo, so each row has to ask for the project's assets.
 * One request per visible row, on mount, rather than fanning out over the whole list
 * before anything is shown.
 */
function ProjectThumb({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<StoredAssetDto[]>(`/api/projects/${projectId}/assets`)
      .then((assets) => {
        const first = assets.find((a) => a.isPrimary) ?? assets[0];
        if (!cancelled && first) setUrl(`/api/assets/${first.id}/reference`);
      })
      .catch(() => {
        // A missing thumbnail is not worth an error screen: the row still works.
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!url) return <span className="size-[66px] shrink-0 rounded-[10px] bg-stone-2" aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated, no-store
    <img
      src={url}
      alt=""
      className="size-[66px] shrink-0 rounded-[10px] border border-border bg-white object-contain"
    />
  );
}

/**
 * The empty state is a designed screen, not a shrug. A ghost row showing the shape of
 * what will appear, one sentence saying what puts something there, one action, and the
 * note that the example gallery is free and needs no sign-in (D-007).
 */
function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative pl-9">
      <span aria-hidden className="absolute top-2 bottom-14 left-1 w-px bg-border" />
      <span
        aria-hidden
        className="absolute top-[58px] left-1 size-[9px] -translate-x-1/2 rounded-full border-[1.5px] border-primary bg-bg"
      />

      <div className="flex h-[104px] items-center gap-4 rounded-md border-[1.5px] border-dashed border-border px-5 text-muted">
        <span aria-hidden className="size-[66px] shrink-0 rounded-[10px] bg-stone-2" />
        <span className="text-[14.5px] leading-snug">{t.projects.emptyGhost}</span>
      </div>

      <p className="mt-6 text-[16px] leading-relaxed text-muted">{t.projects.emptyBody}</p>

      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white"
      >
        {t.projects.emptyCta}
      </button>

      <p className="mt-6 text-[14px] leading-relaxed text-muted">
        {t.projects.galleryNote}{' '}
        {/* Inert until P6 builds the gallery. A link to nowhere would be worse. */}
        <span className="font-semibold text-muted">{t.projects.galleryLink}</span>
      </p>
    </div>
  );
}
