'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { FolderSimple, Trash } from '@phosphor-icons/react';
import { Sheet, SheetHeader } from './ui/sheet';
import { button } from './ui/button';
import { ErrorNotice } from './ui/error-notice';
import { useToast } from './ui/toast';
import { api } from '@/lib/api/client';
import type { ProjectSummary, StoredAsset } from '@/lib/api/types';
import { formatDate, t } from '@/lib/i18n';

export function ProjectsDrawer({
  open,
  onClose,
  onOpenProject,
  onStart,
}: {
  open: boolean;
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onStart: () => void;
}) {
  const titleId = useId();
  const toast = useToast();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    api
      .get<ProjectSummary[]>('/api/projects', { signal: controller.signal })
      .then((list) => {
        setProjects(list);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause);
      });
    return () => controller.abort();
  }, [open, attempt]);

  const remove = useCallback(
    async (project: ProjectSummary) => {
      setDeleting(project.id);
      try {
        await api.delete(`/api/projects/${project.id}`);
        setProjects((list) => (list ?? []).filter((p) => p.id !== project.id));
        setConfirming(null);
        toast(t.projects.deleted);
      } catch (cause) {
        setError(cause);
      } finally {
        setDeleting(null);
      }
    },
    [toast],
  );

  return (
    <Sheet open={open} onClose={onClose} titleId={titleId}>
      <SheetHeader titleId={titleId} title={t.projects.title} onClose={onClose} sub={projects && projects.length > 0 ? t.projects.count(projects.length) : undefined} />

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
        {error ? (
          <ErrorNotice
            error={error}
            className="mb-4"
            onRetry={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          />
        ) : null}

        {projects === null && !error ? (
          <ul aria-hidden className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-4 rounded-card border border-line p-3">
                <span className="size-16 animate-pulse rounded-input bg-raised-2" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3.5 w-3/5 animate-pulse rounded-full bg-raised-2" />
                  <span className="block h-3 w-2/5 animate-pulse rounded-full bg-raised-2" />
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {projects !== null && projects.length === 0 ? (
          <div className="flex flex-col items-start py-4">
            <span aria-hidden className="grid size-14 place-items-center rounded-card border border-line text-muted">
              <FolderSimple size={26} />
            </span>
            <p className="mt-5 text-[19px] font-bold tracking-[-0.02em]">{t.projects.emptyTitle}</p>
            <p className="mt-2 leading-relaxed text-muted">{t.projects.emptyBody}</p>
            <button type="button" onClick={onStart} className={button({ variant: 'solid', size: 'md', className: 'mt-6' })}>
              {t.projects.emptyCta}
            </button>
          </div>
        ) : null}

        {projects && projects.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {projects.map((project) => (
              <li key={project.id} className="rounded-card border border-line bg-bg p-3">
                <div className="flex items-center gap-3.5">
                  <ProjectThumb projectId={project.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{project.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      {t.format[project.formatId as keyof typeof t.format]?.label ?? project.formatId} · {project.aspectRatio} · {formatDate(project.createdAt)}
                    </p>
                  </div>
                  {confirming !== project.id ? (
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={() => onOpenProject(project.id)} className={button({ variant: 'solid', size: 'sm' })}>
                        {t.projects.open}
                      </button>
                      <button type="button" onClick={() => setConfirming(project.id)} className={button({ variant: 'ghost', size: 'icon' })}>
                        <Trash size={18} aria-hidden />
                        <span className="sr-only">{t.projects.deleteLabel(project.name)}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
                {confirming === project.id ? (
                  <div className="mt-3 rounded-input border border-line bg-raised p-3">
                    <p className="text-[14px] leading-snug">{t.projects.deleteConfirm(project.name)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={deleting === project.id} onClick={() => void remove(project)} className={button({ variant: 'danger', size: 'sm' })}>
                        {t.projects.deleteConfirmAction}
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className={button({ variant: 'outline', size: 'sm' })}>
                        {t.projects.deleteCancel}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Sheet>
  );
}

/** The summary carries no photo, so each row asks for its project's primary asset. */
function ProjectThumb({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<StoredAsset[]>(`/api/projects/${projectId}/assets`, { signal: controller.signal })
      .then((assets) => {
        const first = assets.find((a) => a.isPrimary) ?? assets[0];
        if (first) setUrl(`/api/assets/${first.id}/reference`);
      })
      .catch(() => {
        /* a missing thumbnail is not worth an error */
      });
    return () => controller.abort();
  }, [projectId]);

  if (!url) return <span aria-hidden className="size-16 shrink-0 rounded-input bg-raised-2" />;
  // eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated private photo
  return <img src={url} alt="" className="size-16 shrink-0 rounded-input bg-raised object-cover" />;
}
