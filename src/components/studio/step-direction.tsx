'use client';

import { Field, RadioGroup, TextInput } from '../field';
import {
  ASPECTS,
  FORMATS,
  GOALS,
  LIMITS,
  PLATFORMS,
  type AspectRatio,
  type Draft,
  type FormatId,
  type Goal,
  type Platform,
} from '@/lib/brief';
import { t } from '@/lib/i18n';
import { normalizeUzbek } from '@/lib/uzbek';

/**
 * Step 2. The seller answers one question about the look, not two: D-065 removed the
 * style picker because format already carries it, and keeping both would let a seller
 * contradict themselves and force the server to resolve it by a hidden rule.
 *
 * The Uzbek labels for `goal` and `formatId` live in the catalogue (W-003). There is no
 * endpoint that lists them, and the contract's union types mean a renamed format breaks
 * this file at build time rather than shipping a blank radio.
 */
export function StepDirection({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const offer = draft.offer;

  return (
    <div>
      <h2 className="text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold tracking-[-0.03em]">
        {t.direction.title}
      </h2>
      <p className="mt-1.5 mb-7 text-[15px] leading-relaxed text-muted">{t.direction.sub}</p>

      <RadioGroup<Goal>
        legend={t.direction.goalLabel}
        name="goal"
        value={draft.goal}
        onChange={(goal) => onChange({ goal })}
        options={GOALS.map((value) => ({ value, ...t.goal[value] }))}
      />

      <RadioGroup<FormatId>
        legend={t.direction.formatLabel}
        name="formatId"
        value={draft.formatId}
        onChange={(formatId) => onChange({ formatId })}
        options={FORMATS.map((value) => ({ value, ...t.format[value] }))}
      />

      <RadioGroup<Platform>
        legend={t.direction.platformLabel}
        name="platform"
        value={draft.platform}
        onChange={(platform) => onChange({ platform })}
        options={PLATFORMS.map((value) => ({ value, label: t.platform[value].label }))}
      />

      <RadioGroup<AspectRatio>
        legend={t.direction.aspectLabel}
        help={t.direction.aspectHelp}
        name="aspectRatio"
        value={draft.aspectRatio}
        onChange={(aspectRatio) => onChange({ aspectRatio })}
        options={ASPECTS.map((value) => ({ value, ...t.aspect[value] }))}
      />

      <Field label={t.direction.audienceLabel} help={t.direction.audienceHelp}>
        {({ id, describedBy }) => (
          <TextInput
            id={id}
            aria-describedby={describedBy}
            value={draft.audience}
            maxLength={LIMITS.audience}
            onChange={(e) => onChange({ audience: e.target.value })}
            onBlur={(e) => onChange({ audience: normalizeUzbek(e.target.value) })}
          />
        )}
      </Field>

      <details className="rounded-md border border-border bg-white">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between px-5 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
          {t.direction.advanced}
          <span aria-hidden className="text-xl font-normal text-muted">
            +
          </span>
        </summary>

        <div className="border-t border-border px-5 pt-5">
          <Field label={t.direction.durationLabel}>
            {({ id }) => (
              <div className="flex items-center gap-3">
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  max={60}
                  value={draft.durationSeconds}
                  onChange={(e) => onChange({ durationSeconds: Number(e.target.value) || 10 })}
                  className="h-[52px] w-28 rounded-sm border border-border bg-white px-3.5"
                />
                <span className="text-[15px] text-muted">{t.direction.durationUnit}</span>
              </div>
            )}
          </Field>

          <Field label={t.direction.offerLabel} help={t.direction.offerHelp}>
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                placeholder=""
                value={offer?.description ?? ''}
                maxLength={LIMITS.offerDescription}
                onChange={(e) =>
                  onChange({
                    offer: {
                      description: e.target.value,
                      priceUzs: offer?.priceUzs ?? null,
                      validUntil: offer?.validUntil ?? null,
                    },
                  })
                }
              />
            )}
          </Field>

          <div className="grid gap-x-5 sm:grid-cols-2">
            <Field label={t.direction.offerPrice}>
              {({ id }) => (
                <TextInput
                  id={id}
                  type="number"
                  min={1}
                  value={offer?.priceUzs ?? ''}
                  onChange={(e) =>
                    onChange({
                      offer: {
                        description: offer?.description ?? '',
                        priceUzs: e.target.value === '' ? null : Number(e.target.value),
                        validUntil: offer?.validUntil ?? null,
                      },
                    })
                  }
                />
              )}
            </Field>

            <Field label={t.direction.offerValidUntil}>
              {({ id }) => (
                <TextInput
                  id={id}
                  type="date"
                  value={offer?.validUntil ?? ''}
                  onChange={(e) =>
                    onChange({
                      offer: {
                        description: offer?.description ?? '',
                        priceUzs: offer?.priceUzs ?? null,
                        validUntil: e.target.value || null,
                      },
                    })
                  }
                />
              )}
            </Field>
          </div>
        </div>
      </details>
    </div>
  );
}
