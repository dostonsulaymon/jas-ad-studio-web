'use client';

import { t } from '@/lib/i18n';
import type { Draft } from '@/lib/brief';

/**
 * Step 3. Review and save.
 *
 * The step is called "Tekshirish va saqlash", not "va tayyorlash". Generation needs an
 * endpoint that does not exist until P4, and a permanently greyed "Tayyorlash" button
 * that never becomes available is worse than an honest label. The note at the bottom
 * says so in plain Uzbek rather than leaving the seller to work it out.
 */
export function StepReview({
  draft,
  photoCount,
  onEdit,
}: {
  draft: Draft;
  photoCount: number;
  onEdit: (step: 1 | 2) => void;
}) {
  const rows: Array<{ label: string; value: string; step: 1 | 2 }> = [
    { label: t.product.photosLabel, value: t.projects.photoCount(photoCount), step: 1 },
    { label: t.product.nameLabel, value: draft.productName || t.review.notSet, step: 1 },
    { label: t.product.descriptionLabel, value: draft.description || t.review.notSet, step: 1 },
    { label: t.direction.goalLabel, value: t.goal[draft.goal].label, step: 2 },
    { label: t.direction.formatLabel, value: t.format[draft.formatId].label, step: 2 },
    { label: t.direction.platformLabel, value: t.platform[draft.platform].label, step: 2 },
    { label: t.direction.aspectLabel, value: t.aspect[draft.aspectRatio].label, step: 2 },
    {
      label: t.direction.durationLabel,
      value: `${draft.durationSeconds} ${t.direction.durationUnit}`,
      step: 2,
    },
    { label: t.direction.audienceLabel, value: draft.audience || t.review.notSet, step: 2 },
    {
      label: t.direction.offerLabel,
      value: draft.offer?.description || t.review.notSet,
      step: 2,
    },
  ];

  return (
    <div>
      <h2 className="text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold tracking-[-0.03em]">
        {t.review.title}
      </h2>
      <p className="mt-1.5 mb-7 text-[15px] leading-relaxed text-muted">{t.review.sub}</p>

      <dl className="border-t border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-border py-3.5 sm:grid-cols-[180px_1fr_auto] sm:items-baseline"
          >
            <dt className="text-[14px] font-bold">{row.label}</dt>
            <dd className="min-w-0 text-[15.5px] leading-relaxed break-words">
              {row.value === t.review.notSet ? (
                <span className="text-muted">{row.value}</span>
              ) : (
                row.value
              )}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="h-11 justify-self-start text-[14px] font-semibold text-primary underline decoration-[1.5px] underline-offset-4 sm:justify-self-end"
            >
              {t.review.edit}
            </button>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-[14.5px] leading-relaxed text-muted">{t.review.generationLater}</p>
    </div>
  );
}
