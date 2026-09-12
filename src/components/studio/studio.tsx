'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Workbench } from './workbench';
import type { Photo } from './photo-rail';
import type { UploadItem } from './upload-list';
import { api, ApiError } from '@/lib/api/client';
import {
  newIdempotencyKey,
  pollUntilDone,
  startGeneration,
  type GenerationDetailDto,
  type JobStatus,
} from '@/lib/generation';
import { toBriefDto, isStep1Complete, LIMITS, type Draft, type ProjectSummaryDto, type StoredAssetDto } from '@/lib/brief';
import { t } from '@/lib/i18n';

/**
 * Owns the studio's state and every call to the API.
 *
 * The ordering problem the plan flagged: POST /api/projects/{id}/assets needs a project
 * id, but the seller uploads on step 1 before the brief exists, and the contract has no
 * draft-project route. So the project is created on the first upload. Both
 * `productName` and `description` are minLength 1, so if either is empty the files are
 * refused with a plain instruction rather than being sent with invented placeholder
 * text, which would write a fabricated claim into the seller's own project.
 */
/**
 * The project id is persisted beside the draft, not held only in a ref.
 *
 * The draft already survives a reload, so without this a seller who refreshes after
 * uploading gets their words back but not their project: continuing would POST a second
 * project and leave the photos attached to the first one, invisible and unreachable.
 */
const PROJECT_KEY = 'jas.projectId.v1';

function readStoredProjectId(): string | null {
  try {
    return sessionStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
}

function storeProjectId(id: string | null): void {
  try {
    if (id) sessionStorage.setItem(PROJECT_KEY, id);
    else sessionStorage.removeItem(PROJECT_KEY);
  } catch {
    /* a blocked sessionStorage is not worth an error screen */
  }
}

export function Studio({ onSaved }: { onSaved?: (project: ProjectSummaryDto) => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const projectId = useRef<string | null>(null);
  useEffect(() => {
    projectId.current = readStoredProjectId();
  }, []);
  const lastDraft = useRef<Draft | null>(null);

  const [generation, setGeneration] = useState<GenerationDetailDto | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [fromCache, setFromCache] = useState(false);
  /**
   * One key per attempt, held here and reused by a retry of that attempt.
   *
   * This is the double-click guard (§32): the API returns the same job for a repeated
   * key and charges once, so generating a fresh key on retry is the single mistake that
   * could charge a seller twice. It is cleared only when an attempt reaches a terminal
   * state, which is when a new attempt legitimately begins.
   */
  const attemptKey = useRef<string | null>(null);

  const patchUpload = (id: string, state: UploadItem['state']) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, state } : u)));

  const referenceUrl = (assetId: string) => `/api/assets/${assetId}/reference`;

  /**
   * fetch cannot report upload progress, so this one call uses XMLHttpRequest. It still
   * carries the same headers and credentials the wrapper would have set.
   */
  const uploadOne = useCallback((id: string, file: File, project: string) => {
    const form = new FormData();
    form.append('photo', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/projects/${project}/assets`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      patchUpload(id, {
        status: 'uploading',
        percent: Math.min(99, Math.round((event.loaded / event.total) * 100)),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const asset = JSON.parse(xhr.responseText) as StoredAssetDto;
        patchUpload(id, { status: 'done', assetId: asset.id, url: referenceUrl(asset.id) });
        setPhotos((list) => [
          ...list,
          { id: asset.id, url: referenceUrl(asset.id), isPrimary: list.length === 0 },
        ]);
        return;
      }
      let code = 'INTERNAL_ERROR';
      try {
        code = (JSON.parse(xhr.responseText) as { code?: string }).code ?? code;
      } catch {
        if (xhr.status === 413) code = 'UPLOAD_TOO_LARGE';
        if (xhr.status === 415) code = 'UPLOAD_TYPE';
      }
      patchUpload(id, { status: 'refused', code });
    };

    xhr.onerror = () => patchUpload(id, { status: 'refused', code: 'NETWORK_OFFLINE' });

    // Move out of "queued" the moment the request leaves, not on the first progress
    // event. On a fast connection upload.onprogress may never fire, which left a file
    // that was genuinely in flight sitting under "navbatda" until it finished.
    patchUpload(id, { status: 'uploading', percent: 0 });
    xhr.send(form);
  }, []);

  const addFiles = useCallback(
    async (files: FileList, draft: Draft) => {
      setError(null);
      lastDraft.current = draft;

      const room = LIMITS.maxPhotos - photos.length - uploads.filter((u) => u.state.status !== 'refused').length;
      const chosen = [...files].slice(0, Math.max(0, room));

      if (chosen.length === 0) {
        setError(new ApiError({ code: 'TOO_MANY_PHOTOS', status: 400 }));
        return;
      }

      const items: UploadItem[] = chosen.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        bytes: file.size,
        state: { status: 'queued' },
      }));
      setUploads((list) => [...list, ...items]);

      // The project has to exist first, and the contract will not accept an empty
      // name or description. Ask for them rather than inventing them.
      if (!projectId.current) {
        if (!isStep1Complete(draft)) {
          setUploads((list) => list.filter((u) => !items.some((i) => i.id === u.id)));
          setError(new ApiError({ code: 'VALIDATION_FAILED', status: 400 }));
          return;
        }
        try {
          const project = await api.post<ProjectSummaryDto>('/api/projects', {
            json: toBriefDto(draft),
          });
          projectId.current = project.id;
          storeProjectId(project.id);
        } catch (created) {
          setUploads((list) => list.filter((u) => !items.some((i) => i.id === u.id)));
          setError(created);
          return;
        }
      }

      items.forEach((item, index) => uploadOne(item.id, chosen[index], projectId.current!));
    },
    [photos.length, uploads, uploadOne],
  );

  const makePrimary = useCallback(
    (id: string) => setPhotos((list) => list.map((p) => ({ ...p, isPrimary: p.id === id }))),
    [],
  );

  const removePhoto = useCallback(async (id: string) => {
    setPhotos((list) => {
      const next = list.filter((p) => p.id !== id);
      // If the primary was removed, the first remaining photo becomes primary rather
      // than the project being left with none.
      if (next.length > 0 && !next.some((p) => p.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return next;
    });
    setUploads((list) => list.filter((u) => !(u.state.status === 'done' && u.state.assetId === id)));
    try {
      await api.delete(`/api/assets/${id}`);
    } catch (deleted) {
      setError(deleted);
    }
  }, []);

  const removeUpload = useCallback(
    (id: string) => setUploads((list) => list.filter((u) => u.id !== id)),
    [],
  );

  const save = useCallback(
    async (draft: Draft) => {
      setError(null);
      setSaved(false);
      setSaving(true);
      lastDraft.current = draft;
      try {
        const body = toBriefDto(draft);
        const project = projectId.current
          ? await api.patch<ProjectSummaryDto>(`/api/projects/${projectId.current}`, { json: body })
          : await api.post<ProjectSummaryDto>('/api/projects', { json: body });
        projectId.current = project.id;
        storeProjectId(project.id);
        setSaved(true);
        onSaved?.(project);
      } catch (failed) {
        setError(failed);
      } finally {
        setSaving(false);
      }
    },
    [onSaved],
  );

  /**
   * Save the brief, then generate.
   *
   * The save comes first because the worker reads the brief from the project row, not
   * from this request — so generating without saving would produce a package for a
   * previous version of the brief the seller is looking at.
   */
  const generate = useCallback(
    async (draft: Draft) => {
      setError(null);
      setGeneration(null);
      setFromCache(false);
      lastDraft.current = draft;

      let project = projectId.current;
      try {
        const body = toBriefDto(draft);
        const saved = project
          ? await api.patch<ProjectSummaryDto>(`/api/projects/${project}`, { json: body })
          : await api.post<ProjectSummaryDto>('/api/projects', { json: body });
        project = saved.id;
        projectId.current = project;
        onSaved?.(saved);
      } catch (failed) {
        setError(failed);
        return;
      }

      attemptKey.current ??= newIdempotencyKey();
      setJobStatus('queued');

      try {
        const { accepted, fromCache: cached } = await startGeneration(project, attemptKey.current);
        setFromCache(cached);

        // A §29 cache hit is already the final answer: there is no job to poll, no
        // credit was spent, and polling a cache id would 404.
        if (cached) {
          setJobStatus('needs_input');
          setGeneration({
            id: accepted.generationId,
            projectId: project,
            status: 'needs_input',
            questionsUz: accepted.questionsUz,
            messageUz: null,
            errorCode: null,
            createdAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            package: null,
          });
          attemptKey.current = null;
          return;
        }

        const done = await pollUntilDone(accepted.generationId, { onStatus: setJobStatus });
        setGeneration(done);
        setJobStatus(done.status);
        // The attempt is finished, whatever the outcome, so the next press is a new one.
        attemptKey.current = null;
      } catch (failed) {
        setError(failed);
        setJobStatus(null);
        // The key is deliberately KEPT: the job may well exist and be running, and
        // retrying with the same key rejoins it instead of paying for a second one.
      }
    },
    [onSaved],
  );

  return (
    <Workbench
      photos={photos}
      uploads={uploads}
      error={error}
      saving={saving}
      saved={saved}
      onAddFiles={addFiles}
      onMakePrimary={makePrimary}
      onRemovePhoto={removePhoto}
      onRemoveUpload={removeUpload}
      onSave={save}
      generation={generation}
      jobStatus={jobStatus}
      fromCache={fromCache}
      onGenerate={generate}
      onDismissResult={() => {
        setGeneration(null);
        setJobStatus(null);
      }}
      onRetry={() => {
        setError(null);
        // A failed generation retries the generation, not the save: the seller pressed
        // "prompt tayyorlash" and that is what should happen again.
        if (!lastDraft.current) return;
        if (jobStatus !== null || generation !== null) void generate(lastDraft.current);
        else void save(lastDraft.current);
      }}
    />
  );
}

export { t };
