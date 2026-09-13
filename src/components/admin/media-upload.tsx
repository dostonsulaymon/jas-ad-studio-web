'use client';

import { useState } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { api } from '@/lib/api/client';
import type { GalleryMedia } from '@/lib/api/types';
import { t } from '@/lib/i18n';

/** One owner media upload. The API content-addresses the file and returns the path to store. */
export function MediaUpload({
  accept,
  label,
  onUploaded,
  onError,
}: {
  accept: string;
  label: string;
  onUploaded: (path: string) => void;
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
