'use client';

import { ErrorNotice } from '../ui/error-notice';
import { EmptyPanel, PanelHeading, SkeletonRows, StatusPill } from './parts';
import { useLoad } from './use-load';
import type { OwnerGeneration, SpendDay } from '@/lib/api/types';
import { formatDate, t } from '@/lib/i18n';

const usd = (value: number) => `$${value.toFixed(2)}`;
const th = 'py-3 pr-4 text-left text-[13px] font-semibold text-muted';
type Status = keyof typeof t.admin.reports.status;

function tone(status: string) {
  if (status === 'ready') return 'success' as const;
  if (status === 'failed' || status === 'refused') return 'danger' as const;
  return 'strong' as const;
}

/** Spend is provider cost in USD, a different number from credits; the subtitle says so. */
export function AdminReports() {
  const spend = useLoad<SpendDay[]>('/api/owner/spend');
  const generations = useLoad<OwnerGeneration[]>('/api/owner/generations');
  const total = (spend.data ?? []).reduce((sum, day) => sum + day.estCostUsd, 0);
  const peak = Math.max(0.0001, ...(spend.data ?? []).map((d) => d.estCostUsd));
  const label = (s: string) => t.admin.reports.status[s as Status] ?? s;

  return (
    <section>
      <PanelHeading title={t.admin.reports.title} sub={t.admin.reports.sub} />

      <div className="rounded-card border border-line bg-raised p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="text-[18px] font-bold">{t.admin.reports.spendTitle}</h3>
          <p className="text-[14px] text-muted">
            {t.admin.reports.total30}: <span className="text-[18px] font-bold text-ink tabular-nums">{usd(total)}</span>
          </p>
        </div>
        <p className="mt-1 max-w-[64ch] text-[14px] text-muted">{t.admin.reports.spendSub}</p>
        <div className="mt-5">
          {spend.error ? <ErrorNotice error={spend.error} onRetry={spend.reload} /> : null}
          {spend.loading ? <SkeletonRows count={2} height="h-8" /> : null}
          {spend.data && spend.data.length === 0 ? <p className="text-muted">{t.admin.reports.noSpend}</p> : null}
          {spend.data && spend.data.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {spend.data.map((day) => (
                <li key={day.day} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[130px_minmax(0,1fr)_auto]">
                  <span className="text-[14px] text-muted tabular-nums">{formatDate(`${day.day}T12:00:00Z`)}</span>
                  <span aria-hidden className="block h-2 rounded-full bg-ink" style={{ width: `${Math.max(2, (day.estCostUsd / peak) * 100)}%` }} />
                  <span className="text-right text-[14px] tabular-nums">
                    <b>{usd(day.estCostUsd)}</b>
                    <span className="ml-2 text-muted">
                      {t.admin.reports.runs(day.generations)}
                      {day.failed > 0 ? `, ${day.failed} ${t.admin.reports.failed}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <h3 className="mt-10 mb-4 text-[18px] font-bold">{t.admin.reports.generationsTitle}</h3>
      {generations.error ? <ErrorNotice error={generations.error} onRetry={generations.reload} /> : null}
      {generations.loading ? <SkeletonRows count={3} height="h-14" /> : null}
      {generations.data && generations.data.length === 0 ? <EmptyPanel title={t.admin.reports.noGenerations} /> : null}
      {generations.data && generations.data.length > 0 ? (
        <>
          <div className="overflow-x-auto max-sm:hidden">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line">
                  {[t.admin.reports.user, t.admin.reports.project, t.admin.reports.statusHeader, t.admin.reports.model, t.admin.reports.cost, t.admin.reports.when].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {generations.data.map((g) => (
                  <tr key={g.id}>
                    <td className="py-3.5 pr-4 font-medium break-all">{g.userEmail}</td>
                    <td className="py-3.5 pr-4">{g.projectName ?? <span className="text-muted">{t.admin.reports.noProject}</span>}</td>
                    <td className="py-3.5 pr-4">
                      <StatusPill tone={tone(g.status)}>{label(g.status)}</StatusPill>
                    </td>
                    <td className="py-3.5 pr-4 text-muted">{g.model ?? t.common.notSet}</td>
                    <td className="py-3.5 pr-4 tabular-nums">{g.estCostUsd === null ? t.common.notSet : usd(g.estCostUsd)}</td>
                    <td className="py-3.5 text-muted">{formatDate(g.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 sm:hidden">
            {generations.data.map((g) => (
              <li key={g.id} className="rounded-card border border-line bg-raised p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-semibold break-all">{g.userEmail}</p>
                  <StatusPill tone={tone(g.status)}>{label(g.status)}</StatusPill>
                </div>
                <p className="mt-1 text-[14px] text-muted">
                  {g.projectName ?? t.admin.reports.noProject} · {formatDate(g.createdAt)}
                  {g.estCostUsd === null ? '' : ` · ${usd(g.estCostUsd)}`}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
