'use client';

import { Field, TextArea, TextInput } from '../field';
import { PhotoRail, type Photo } from './photo-rail';
import { UploadList, type UploadItem } from './upload-list';
import { LIMITS, type Draft } from '@/lib/brief';
import { normalizeUzbek } from '@/lib/uzbek';
import { t } from '@/lib/i18n';

/**
 * Step 1. Rasm, nom, tavsif. Nothing else: source 01 §6 asks for three compact steps,
 * and everything that can wait until step 2 waits.
 */
export function StepProduct({
  draft,
  photos,
  uploads,
  errors,
  onChange,
  onAddFiles,
  onMakePrimary,
  onRemovePhoto,
  onRemoveUpload,
}: {
  draft: Draft;
  photos: Photo[];
  uploads: UploadItem[];
  errors: Partial<Record<'productName' | 'description', string>>;
  onChange: (patch: Partial<Draft>) => void;
  onAddFiles: (files: FileList) => void;
  onMakePrimary: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onRemoveUpload: (id: string) => void;
}) {
  const busy = uploads.filter((u) => u.state.status === 'uploading' || u.state.status === 'queued');

  return (
    <div>
      <h2 className="text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold tracking-[-0.03em]">
        {t.product.title}
      </h2>
      <p className="mt-1.5 mb-7 text-[15px] leading-relaxed text-muted">{t.product.sub}</p>

      <div className="mb-6">
        <span className="mb-1.5 block text-[14px] font-bold">{t.product.photosLabel}</span>
        <PhotoRail
          photos={photos}
          onAdd={onAddFiles}
          onMakePrimary={onMakePrimary}
          onRemove={onRemovePhoto}
        />
        <p className="mt-2 text-[13.5px] leading-snug text-muted">{t.product.photosHelp}</p>
      </div>

      {uploads.length > 0 ? (
        <div className="mb-6">
          <UploadList items={uploads} onRemove={onRemoveUpload} />
          {/* Progress is announced, not only drawn, so it is not colour-only state. */}
          <p aria-live="polite" className="sr-only">
            {busy.length > 0 ? t.upload.sub : ''}
          </p>
        </div>
      ) : null}

      <Field label={t.product.nameLabel} error={errors.productName}
        counter={t.common.characters(draft.productName.length, LIMITS.productName)}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            value={draft.productName}
            maxLength={LIMITS.productName}
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

      <div className="rounded-md border border-border bg-white px-5 py-4">
        <h3 className="text-[14px] font-extrabold">{t.product.guideTitle}</h3>
        <ul className="mt-2.5 list-disc pl-5 text-[14px] leading-[1.85] text-muted">
          <li>{t.product.guide1}</li>
          <li>{t.product.guide2}</li>
          <li>{t.product.guide3}</li>
          <li>{t.product.guide4}</li>
        </ul>
      </div>
    </div>
  );
}
