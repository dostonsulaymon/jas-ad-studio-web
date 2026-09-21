'use client';

import { useState } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { api } from '@/lib/api/client';
import type { GalleryMedia } from '@/lib/api/types';
import { aspectFromSize } from '@/lib/gallery';
import { t } from '@/lib/i18n';

export interface MediaMeta {
  durationSeconds: number;
  aspectRatio: '9:16' | '1:1' | '16:9' | null;
}

/**
 * What the browser can read off the file the owner just picked, so they do not retype it (R-015).
 * Best effort: a codec the browser cannot decode simply reports nothing and the fields stay as they are.
 */
function probeVideo(file: File): Promise<MediaMeta | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const element = document.createElement('video');
    const done = (meta: MediaMeta | null) => {
      URL.revokeObjectURL(url);
      resolve(meta);
    };

    element.preload = 'metadata';
    element.onloadedmetadata = () =>
      done(
        Number.isFinite(element.duration)
          ? {
              durationSeconds: Math.max(1, Math.round(element.duration)),
              aspectRatio: aspectFromSize(element.videoWidth, element.videoHeight),
            }
          : null,
      );
    element.onerror = () => done(null);
    element.src = url;
  });
}

/** One owner media upload. The API content-addresses the file and returns the path to store. */
export function MediaUpload({
  accept,
  label,
  onUploaded,
  onMeta,
  onError,
}: {
  accept: string;
  label: string;
  onUploaded: (path: string) => void;
  onMeta?: (meta: MediaMeta) => void;
  onError: (error: unknown) => void;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const stored = await api.post<GalleryMedia>('/api/owner/gallery/media', { form });
      onUploaded(stored.path);
      if (onMeta && file.type.startsWith('video/')) {
        const meta = await probeVideo(file);
        if (meta) onMeta(meta);
      }
    } catch (cause) {
      onError(cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <label
      className={`${button({ variant: 'outline', size: 'sm' })} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${busy ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        type="file"
        accept={accept}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void upload(file);
        }}
      />
      <UploadSimple size={16} aria-hidden />
      {busy ? t.admin.gallery.uploading : label}
    </label>
  );
}
