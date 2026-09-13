'use client';

import { Lightning } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { useSession } from '../session';
import type { Draft } from '@/lib/brief';
import { formatUzs, t } from '@/lib/i18n';

type Step = 1 | 2 | 3;

export function StepReview({ draft, photoCount, onEdit }: { draft: Draft; photoCount: number; onEdit: (step: Step) => void }) {
  const session = useSession();
  const balance = session.balance;
  const verified = draft.confirmedClaims.filter((c) => c.claim.trim());

  const product: Array<[string, string]> = [
    [t.product.nameLabel, draft.productName || t.review.notSet],
    [t.product.descriptionLabel, draft.description || t.review.notSet],
    [t.product.photosLabel, t.review.photos(photoCount)],
  ];
  const direction: Array<[string, string]> = [
    [t.direction.goalLabel, t.goal[draft.goal].label],
    [t.direction.formatLabel, t.format[draft.formatId].label],
    [t.direction.platformLabel, t.platform[draft.platform]],
    [t.direction.aspectLabel, `${draft.aspectRatio} ${t.aspect[draft.aspectRatio]}`],
    ...(draft.inspiration ? ([[t.inspiration.label, draft.inspiration.titleUz]] as Array<[string, string]>) : []),
    ...(draft.audience.trim() ? ([[t.direction.audienceLabel, draft.audience]] as Array<[string, string]>) : []),
    ...(verified.length ? ([[t.direction.claimsLabel, verified.map((c) => c.claim).join('; ')]] as Array<[string, string]>) : []),
    ...(draft.offer?.description.trim()
      ? ([[t.direction.offerLabel, [draft.offer.description, draft.offer.priceUzs ? formatUzs(draft.offer.priceUzs) : '', draft.offer.validUntil ?? ''].filter(Boolean).join(' · ')]] as Array<[string, string]>)
      : []),
  ];

  return (
    <div>
      <h2 className="text-[clamp(26px,2.8vw,34px)] leading-tight font-extrabold tracking-[-0.035em]">{t.review.title}</h2>
      <p className="mt-2 text-muted">{t.review.sub}</p>

      <div className="mt-8 flex flex-col gap-3">
        <Summary title={t.studio.steps[0]} rows={product} onEdit={() => onEdit(1)} />
        <Summary title={t.studio.steps[1]} rows={direction} onEdit={() => onEdit(2)} />
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-card border border-line p-5 sm:flex-row sm:items-center">
        <Lightning size={22} weight="fill" aria-hidden className="shrink-0" />
        <div className="min-w-0 flex-1 text-[14px] leading-relaxed">
          <p>{t.review.cost}</p>
          {balance ? <p className="text-muted">{balance.available > 0 ? t.review.balance(balance.available) : t.review.noCredits}</p> : null}
          {photoCount === 0 ? <p className="text-muted">{t.review.needPhoto}</p> : null}
        </div>
        {balance && balance.available === 0 ? (
          <button type="button" onClick={session.openCredits} className={button({ variant: 'outline', size: 'sm' })}>
            {t.review.topUp}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Summary({ title, rows, onEdit }: { title: string; rows: Array<[string, string]>; onEdit: () => void }) {
  return (
    <section className="rounded-card border border-line bg-raised p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[17px] font-bold tracking-[-0.01em]">{title}</h3>
        <button type="button" onClick={onEdit} className={button({ variant: 'ghost', size: 'sm', className: '-mr-2' })}>
          {t.review.edit}
        </button>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-[170px_minmax(0,1fr)]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="line-clamp-4 break-words whitespace-pre-line max-sm:mb-1.5">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
