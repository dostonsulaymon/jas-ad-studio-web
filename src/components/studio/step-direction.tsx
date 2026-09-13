'use client';

import { CaretDown, Plus, Sparkle, Trash, X } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { ChoiceChip, Field, OptionCard, TextInput } from '../ui/field';
import { ASPECTS, FORMATS, GOALS, LIMITS, PLATFORMS, type Draft } from '@/lib/brief';
import { t } from '@/lib/i18n';

const legend = 'mb-3 text-[14px] font-semibold';

export function StepDirection({ draft, onChange }: { draft: Draft; onChange: (patch: Partial<Draft>) => void }) {
  const claims = draft.confirmedClaims;
  const setClaim = (index: number, patch: Partial<Draft['confirmedClaims'][number]>) =>
    onChange({ confirmedClaims: claims.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  const offer = draft.offer ?? { description: '', priceUzs: null, validUntil: null };
  const setOffer = (patch: Partial<typeof offer>) => onChange({ offer: { ...offer, ...patch } });

  return (
    <div>
      <h2 className="text-[clamp(26px,2.8vw,34px)] leading-tight font-extrabold tracking-[-0.035em]">{t.direction.title}</h2>
      <p className="mt-2 text-muted">{t.direction.sub}</p>

      {draft.inspiration ? (
        <div className="mt-6 rounded-card border border-line bg-raised p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-bg">
              <Sparkle size={18} weight="fill" />
            </span>
            <p className="min-w-0 flex-1">
              <span className="block text-[13px] text-muted">{t.inspiration.label}</span>
              <span className="block font-semibold break-words">{draft.inspiration.titleUz}</span>
            </p>
            <button type="button" onClick={() => onChange({ inspiration: null })} className={button({ variant: 'ghost', size: 'icon' })}>
              <X size={18} aria-hidden />
              <span className="sr-only">{t.inspiration.remove}</span>
            </button>
          </div>
          <p className="mt-3 text-[13.5px] leading-snug text-muted">{t.inspiration.note}</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        <fieldset>
          <legend className={legend}>{t.direction.goalLabel}</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {GOALS.map((goal) => (
              <OptionCard key={goal} name="goal" value={goal} checked={draft.goal === goal} onChange={() => onChange({ goal })} label={t.goal[goal].label} line={t.goal[goal].line} />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>{t.direction.formatLabel}</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {FORMATS.map((format) => (
              <OptionCard
                key={format}
                name="format"
                value={format}
                checked={draft.formatId === format}
                onChange={() => onChange({ formatId: format })}
                label={t.format[format].label}
                line={t.format[format].line}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>{t.direction.platformLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <ChoiceChip key={platform} name="platform" value={platform} checked={draft.platform === platform} onChange={() => onChange({ platform })}>
                {t.platform[platform]}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[14px] font-semibold">{t.direction.aspectLabel}</legend>
          <p className="mb-3 text-[13.5px] text-muted">{t.direction.aspectHelp}</p>
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((aspect) => (
              <ChoiceChip key={aspect} name="aspect" value={aspect} checked={draft.aspectRatio === aspect} onChange={() => onChange({ aspectRatio: aspect })}>
                <span className="tabular-nums">{aspect}</span>
                <span className="opacity-70">{t.aspect[aspect]}</span>
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        <details className="group rounded-card border border-line" open={Boolean(draft.audience || claims.length || draft.offer)}>
          <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 font-semibold [&::-webkit-details-marker]:hidden">
            {t.direction.advanced}
            <CaretDown size={18} aria-hidden className="text-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>

          <div className="flex flex-col gap-7 border-t border-line p-5">
            <Field label={t.direction.audienceLabel} help={t.direction.audienceHelp}>
              {({ id, describedBy }) => (
                <TextInput id={id} aria-describedby={describedBy} value={draft.audience} maxLength={LIMITS.audience} onChange={(e) => onChange({ audience: e.target.value })} />
              )}
            </Field>

            <fieldset>
              <legend className="mb-1 text-[14px] font-semibold">{t.direction.claimsLabel}</legend>
              <p className="mb-3 text-[13.5px] text-muted">{t.direction.claimsHelp}</p>
              <ul className="flex flex-col gap-2">
                {claims.map((claim, index) => (
                  <li key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <TextInput
                      aria-label={`${t.direction.claimPlaceholder} ${index + 1}`}
                      value={claim.claim}
                      maxLength={LIMITS.claim}
                      onChange={(e) => setClaim(index, { claim: e.target.value })}
                      className="min-w-0 flex-1 basis-full sm:basis-auto"
                    />
                    <label className="inline-flex h-11 items-center gap-2 px-1 text-[14px] text-muted">
                      <input type="checkbox" checked={claim.verified} onChange={(e) => setClaim(index, { verified: e.target.checked })} className="size-5 accent-[#fafafa]" />
                      {t.direction.claimVerified}
                    </label>
                    <button
                      type="button"
                      onClick={() => onChange({ confirmedClaims: claims.filter((_, i) => i !== index) })}
                      className={button({ variant: 'ghost', size: 'icon', className: 'ml-auto' })}
                    >
                      <Trash size={18} aria-hidden />
                      <span className="sr-only">{t.direction.removeClaim}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {claims.length < LIMITS.maxClaims ? (
                <button
                  type="button"
                  onClick={() => onChange({ confirmedClaims: [...claims, { claim: '', verified: true }] })}
                  className={button({ variant: 'outline', size: 'sm', className: 'mt-3' })}
                >
                  <Plus size={16} aria-hidden />
                  {t.direction.addClaim}
                </button>
              ) : null}
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-[14px] font-semibold">{t.direction.offerLabel}</legend>
              <p className="mb-3 text-[13.5px] text-muted">{t.direction.offerHelp}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.direction.offerDescription} className="sm:col-span-2">
                  {({ id }) => <TextInput id={id} value={offer.description} maxLength={LIMITS.offerDescription} onChange={(e) => setOffer({ description: e.target.value })} />}
                </Field>
                <Field label={t.direction.offerPrice}>
                  {({ id }) => (
                    <TextInput
                      id={id}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={offer.priceUzs ?? ''}
                      onChange={(e) => setOffer({ priceUzs: e.target.value === '' ? null : Number(e.target.value) })}
                    />
                  )}
                </Field>
                <Field label={t.direction.offerValidUntil}>
                  {({ id }) => <TextInput id={id} type="date" value={offer.validUntil ?? ''} onChange={(e) => setOffer({ validUntil: e.target.value || null })} />}
                </Field>
              </div>
            </fieldset>
          </div>
        </details>
      </div>
    </div>
  );
}
