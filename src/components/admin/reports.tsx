'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorNotice } from '../error-notice';
import { api } from '@/lib/api/client';
import { formatDate, t } from '@/lib/i18n';
import type { components } from '@/lib/api/generated/schema';

type Generation = components['schemas']['OwnerGenerationDto'];
type SpendDay = components['schemas']['OwnerSpendDayDto'];
type Status = keyof typeof t.admin.reports.status;

/** USD, to the cent, with a leading dollar. Never soʻm: this is provider cost. */
function usd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function statusLabel(status: string): string {
  return t.admin.reports.status[status as Status] ?? status;
}

/**
 * The two read-only owner views D-037 names: what has been generated, and what it cost
 * per day.
 *
 * Spend is the recorded USD cost of AI calls, which is a different number from credits.
 * The subtitle says so, because an owner comparing "xarajat" against prompt balances and
 * finding they disagree would reasonably think one of them was broken.
 */
export function AdminReports() {
  const [generations, setGenerations] = useState<Generation[] | null>(null);
  const [spend, setSpend] = useState<SpendDay[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const fetchAll = useCallback(() => {
    Promise.all([
      api.get<Generation[]>('/api/owner/generations'),
      api.get<SpendDay[]>('/api/owner/spend'),
    ])
      .then(([g, s]) => {
        setError(null);
        setGenerations(g);
        setSpend(s);
      })
      .catch(setError);
  }, []);

  useEffect(() => {
    if (generations === null && spend === null && !error) fetchAll();
  }, [generations, spend, error, fetchAll]);

  const retry = () => {
    setError(null);
    setGenerations(null);
    setSpend(null);
  };

  const loading = generations === null && !error;
  const total = (spend ?? []).reduce((sum, day) => sum + day.estCostUsd, 0);

  return (
    <div>
      <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{t.admin.reports.title}</h2>
      <p className="mt-1.5 mb-6 text-[15px] text-muted">{t.admin.reports.sub}</p>

      {error ? <ErrorNotice error={error} onRetry={retry} className="mb-5" /> : null}
      {loading ? <div className="h-32 animate-pulse rounded-md bg-stone-2" aria-hidden /> : null}

      {spend !== null ? (
        <section className="mb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[17px] font-bold">{t.admin.reports.spendTitle}</h3>
            <p className="text-[15px] text-muted">
              {t.admin.reports.total30}:{' '}
              <span className="font-bold text-ink tabular-nums">{usd(total)}</span>
            </p>
          </div>
          <p className="mt-1 mb-4 max-w-[64ch] text-[14px] leading-relaxed text-muted">
            {t.admin.reports.spendSub}
          </p>

          {spend.length === 0 ? (
            <p className="text-[15px] text-muted">{t.admin.reports.noSpend}</p>
          ) : (
            <ul className="border-t border-border">
              {spend.map((day) => {
                // A bar relative to the busiest day. No axis and no grid: this is a
                // sense of shape beside a real number, not a chart pretending to be one.
                const peak = Math.max(...spend.map((d) => d.estCostUsd), 0.0001);
                return (
                  <li
                    key={day.day}
                    className="grid grid-cols-[110px_1fr_auto] items-center gap-x-4 border-b border-border py-2.5"
                  >
                    <span className="text-[14px] text-muted tabular-nums">
                      {formatDate(`${day.day}T00:00:00.000Z`)}
                    </span>
                    <span aria-hidden className="h-1.5 rounded-full bg-stone-2">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(2, (day.estCostUsd / peak) * 100)}%` }}
                      />
                    </span>
                    <span className="text-right text-[14.5px] font-semibold tabular-nums">
                      {usd(day.estCostUsd)}
                      <span className="ml-2 font-normal text-muted">
                        {day.generations}
                        {day.failed > 0 ? ` · ${day.failed} ${t.admin.reports.failed}` : ''}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {generations !== null ? (
        <section>
          <h3 className="mb-4 text-[17px] font-bold">{t.admin.reports.generationsTitle}</h3>

          {generations.length === 0 ? (
            <p className="text-[15px] text-muted">{t.admin.reports.noGenerations}</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-collapse text-[14.5px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {[
                        t.admin.reports.user,
                        t.admin.reports.project,
                        t.admin.reports.statusHeader,
                        t.admin.reports.model,
                        t.admin.reports.cost,
                        t.admin.reports.when,
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-2.5 pr-4 text-[12px] font-bold tracking-[0.1em] text-muted uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generations.map((g) => (
                      <tr key={g.id} className="border-b border-border">
                        <td className="py-3 pr-4 font-semibold break-all">{g.userEmail}</td>
                        <td className="py-3 pr-4">
                          {g.projectName ?? (
                            <span className="text-muted">{t.admin.reports.noProject}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex h-[26px] items-center rounded-full px-2.5 text-[12.5px] font-bold ${
                              g.status === 'ready'
                                ? 'bg-primary text-white'
                                : g.status === 'failed' || g.status === 'refused'
                                  ? 'border border-border bg-white text-muted'
                                  : 'bg-accent text-ink'
                            }`}
                          >
                            {statusLabel(g.status)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted">{g.model ?? '—'}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {g.estCostUsd === null ? '—' : usd(g.estCostUsd)}
                        </td>
                        <td className="py-3 text-muted">{formatDate(g.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="flex flex-col gap-3 sm:hidden">
                {generations.map((g) => (
                  <li key={g.id} className="rounded-md border border-border bg-white p-4">
                    <p className="text-[15px] font-bold break-all">{g.userEmail}</p>
                    <p className="mt-0.5 text-[13.5px] text-muted">
                      {g.projectName ?? t.admin.reports.noProject} · {formatDate(g.createdAt)}
                    </p>
                    <p className="mt-2 text-[14px]">
                      {statusLabel(g.status)}
                      {g.estCostUsd === null ? '' : ` · ${usd(g.estCostUsd)}`}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
