'use client';

import { useCallback, useRef, useState } from 'react';
import { Workbench } from './workbench';
import type { Photo } from './photo-rail';
import type { UploadItem } from './upload-list';
import { api, ApiError } from '@/lib/api/client';
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
export function Studio({ onSaved }: { onSaved?: (project: ProjectSummaryDto) => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const projectId = useRef<string | null>(null);
  const lastDraft = useRef<Draft | null>(null);

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
      onRetry={() => {
        setError(null);
        if (lastDraft.current) void save(lastDraft.current);
      }}
    />
  );
}

export { t };
