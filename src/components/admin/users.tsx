'use client';

import { ErrorNotice } from '../ui/error-notice';
import { EmptyPanel, PanelHeading, SkeletonRows } from './parts';
import { useLoad } from './use-load';
import type { OwnerUser } from '@/lib/api/types';
import { formatDate, t } from '@/lib/i18n';

const th = 'py-3 pr-4 text-left text-[13px] font-semibold text-muted';

/** A table on wide screens, stacked rows on phones: five columns at 390 px are unreadable. */
export function AdminUsers() {
  const { data, error, loading, reload } = useLoad<OwnerUser[]>('/api/owner/users');
  const role = (r: string) => (r === 'owner' ? t.admin.users.roleOwner : t.admin.users.roleSeller);

  return (
    <section>
      <PanelHeading title={t.admin.users.title} sub={t.admin.users.sub} />
      {error ? <ErrorNotice error={error} onRetry={reload} /> : null}
      {loading ? <SkeletonRows count={3} height="h-16" /> : null}
      {data && data.length === 0 ? <EmptyPanel title={t.admin.users.empty} /> : null}
      {data && data.length > 0 ? (
        <>
          <div className="overflow-x-auto max-sm:hidden">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>{t.admin.users.email}</th>
                  <th className={th}>{t.admin.users.role}</th>
                  <th className={`${th} text-right`}>{t.admin.users.available}</th>
                  <th className={`${th} text-right`}>{t.admin.users.reserved}</th>
                  <th className={th}>{t.admin.users.joined}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3.5 pr-4 font-medium break-all">{u.email}</td>
                    <td className="py-3.5 pr-4 text-muted">{role(u.role)}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{u.available}</td>
                    <td className="py-3.5 pr-4 text-right text-muted tabular-nums">{u.reserved}</td>
                    <td className="py-3.5 text-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 sm:hidden">
            {data.map((u) => (
              <li key={u.id} className="rounded-card border border-line bg-raised p-4">
                <p className="font-semibold break-all">{u.email}</p>
                <p className="mt-1 text-[14px] text-muted">
                  {role(u.role)} · {formatDate(u.createdAt)}
                </p>
                <p className="mt-2 text-[14px] tabular-nums">
                  {t.admin.users.available}: <b>{u.available}</b>
                  {u.reserved > 0 ? <span className="text-muted"> · {t.admin.users.reserved}: {u.reserved}</span> : null}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
