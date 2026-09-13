'use client';

import { useRef, useState } from 'react';
import { Check, GoogleLogo, LockSimple, Plus, WarningCircle, X } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { Field, TextArea, TextInput } from '../ui/field';
import { LIMITS, isStep1Complete, type Draft } from '@/lib/brief';
import { normalizeUzbek } from '@/lib/uzbek';
import { errorCopy, t } from '@/lib/i18n';

export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Upload {
  key: string;
  name: string;
  status: 'uploading' | 'refused';
  percent: number;
  code?: string;
}

export function StepProduct({
  draft,
  errors,
  signedIn,
  sessionLoading,
  photos,
  uploads,
  onChange,
  onFiles,
  onRemovePhoto,
  onDismissUpload,
}: {
  draft: Draft;
  errors: { productName?: string; description?: string };
  signedIn: boolean;
  sessionLoading: boolean;
  photos: Photo[];
  uploads: Upload[];
  onChange: (patch: Partial<Draft>) => void;
  onFiles: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onDismissUpload: (key: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const full = photos.length + uploads.filter((u) => u.status === 'uploading').length >= LIMITS.maxPhotos;
  const locked = !signedIn || !isStep1Complete(draft);
  const lockReason = !signedIn ? t.product.photosSignedOut : !isStep1Complete(draft) ? t.product.photosLocked : null;

  return (
    <div>
      <h2 className="text-[clamp(26px,2.8vw,34px)] leading-tight font-extrabold tracking-[-0.035em]">{t.product.title}</h2>
      <p className="mt-2 text-muted">{t.product.sub}</p>

      {!signedIn && !sessionLoading ? (
        <div className="mt-6 flex flex-col gap-4 rounded-card border border-line bg-raised p-5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t.auth.signInTitle}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.auth.signInBody}</p>
          </div>
          <a href="/api/auth/google" className={button({ variant: 'solid', size: 'sm', className: 'max-sm:w-full' })}>
            <GoogleLogo size={18} weight="bold" aria-hidden />
            {t.auth.signInWithGoogle}
          </a>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-6">
        <Field label={t.product.nameLabel} error={errors.productName} counter={t.common.characters(draft.productName.length, LIMITS.productName)}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={draft.productName}
              maxLength={LIMITS.productName}
              autoComplete="off"
              onChange={(e) => onChange({ productName: e.target.value })}
              onBlur={(e) => onChange({ productName: normalizeUzbek(e.target.value) })}
            />
          )}
        </Field>

        <Field
          label={t.product.descriptionLabel}
          help={t.product.descriptionHelp}
          error={errors.description}
          counter={t.common.characters(draft.description.length, LIMITS.description)}
        >
          {({ id, describedBy, invalid }) => (
            <TextArea
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={draft.description}
              maxLength={LIMITS.description}
              onChange={(e) => onChange({ description: e.target.value })}
              onBlur={(e) => onChange({ description: normalizeUzbek(e.target.value) })}
            />
          )}
        </Field>

        <div>
          <p id="photos-label" className="text-[14px] font-semibold">
            {t.product.photosLabel}
          </p>
          <p id="photos-help" className="mt-1 text-[13.5px] text-muted">
            {t.product.photosHelp}
          </p>

          <ul aria-labelledby="photos-label" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.id}>
                <div className="relative overflow-hidden rounded-input border border-line bg-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated private photo */}
                  <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-full border border-white/15 bg-black/65 text-ink backdrop-blur-sm hover:bg-black/85"
                  >
                    <X size={16} weight="bold" aria-hidden />
                    <span className="sr-only">{t.product.removePhoto}</span>
                  </button>
                </div>
                {photo.isPrimary ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[12.5px] text-muted">
                    <Check size={13} weight="bold" aria-hidden />
                    {t.studio.primaryBadge}
                  </p>
                ) : null}
              </li>
            ))}

            {uploads.map((upload) => (
              <li key={upload.key}>
                {upload.status === 'uploading' ? (
                  <div role="status" className="flex aspect-square flex-col justify-end gap-2 rounded-input border border-line bg-raised p-3">
                    <span className="truncate text-[12.5px] text-muted">{upload.name}</span>
                    <span className="text-[15px] font-semibold tabular-nums">{t.upload.uploading(upload.percent)}</span>
                    <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-raised-2">
                      <span className="block h-full bg-ink transition-[width] duration-200" style={{ width: `${upload.percent}%` }} />
                    </span>
                  </div>
                ) : (
                  <div role="alert" className="flex aspect-square flex-col justify-between rounded-input border border-danger/40 bg-danger/[0.06] p-3">
                    <WarningCircle size={20} aria-hidden className="text-danger" />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] text-muted">{upload.name}</span>
                      <span className="block text-[13px] leading-snug font-medium">{errorCopy(upload.code ?? 'INTERNAL_ERROR').message}</span>
                    </span>
                    <button type="button" onClick={() => onDismissUpload(upload.key)} className="-mb-1 self-start text-[13px] font-semibold underline underline-offset-4 min-h-11">
                      {t.upload.dismiss}
                    </button>
                  </div>
                )}
              </li>
            ))}

            {!full ? (
              <li>
                <label
                  onDragOver={(e) => {
                    if (locked) return;
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!locked) onFiles([...e.dataTransfer.files]);
                  }}
                  className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-input border border-dashed p-3 text-center transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                    locked ? 'cursor-not-allowed border-line text-muted' : dragging ? 'border-ink bg-raised-2' : 'border-line-strong hover:border-ink hover:bg-raised'
                  }`}
                >
                  <input
                    ref={input}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={locked}
                    aria-describedby="photos-help"
                    className="sr-only"
                    onChange={(e) => {
                      onFiles([...(e.target.files ?? [])]);
                      e.target.value = '';
                    }}
                  />
                  {locked ? <LockSimple size={22} aria-hidden /> : <Plus size={24} aria-hidden />}
                  <span className="text-[13.5px] font-medium">{t.product.addPhoto}</span>
                </label>
              </li>
            ) : null}
          </ul>

          {lockReason ? <p className="mt-3 text-[13.5px] text-muted">{lockReason}</p> : null}
        </div>

        <div className="rounded-card border border-line p-5">
          <p className="text-[14px] font-semibold">{t.product.guideTitle}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {t.product.guide.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[14px] text-muted">
                <Check size={16} aria-hidden className="mt-0.5 shrink-0 text-ink" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
