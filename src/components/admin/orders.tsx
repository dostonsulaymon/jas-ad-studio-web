'use client';

import { useState } from 'react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { Field, TextArea } from '../ui/field';
import { useToast } from '../ui/toast';
import { EmptyPanel, PanelHeading, SkeletonRows, StatusPill } from './parts';
import { useLoad } from './use-load';
import { api } from '@/lib/api/client';
import type { OrderStatus, OwnerOrder, OwnerProOrder } from '@/lib/api/types';
import { formatDate, formatUzs, t } from '@/lib/i18n';

const STATUSES: readonly OrderStatus[] = ['pending', 'paid', 'rejected', 'cancelled'];

export function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus>('pending');
  return (
    <section>
      <PanelHeading title={t.admin.orders.title} />
      <div role="group" aria-label={t.admin.orders.title} className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={s === status}
            onClick={() => setStatus(s)}
            className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap ${
              s === status ? 'border-ink bg-raised-2 text-ink' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {t.credits.status[s]}
          </button>
        ))}
      </div>
      <OrderList key={status} status={status} />
      <ProOrderList />
    </section>
  );
}

/**
 * D-102: the PRO queue, under the credit queue rather than in a tab of its own — the owner's job
 * is the same one either way, "somebody says they paid, did they". Confirming grants the access.
 */
function ProOrderList() {
  const { data, error, loading, reload } = useLoad<OwnerProOrder[]>('/api/owner/pro/orders?status=pending');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  const act = async (id: string, mode: 'confirm' | 'reject') => {
    setBusy(true);
    setActionError(null);
    try {
      if (mode === 'confirm') await api.post(`/api/owner/pro/orders/${id}/confirm`);
      else await api.post(`/api/owner/pro/orders/${id}/reject`, { json: { reason: t.admin.proOrders.reject } });
      setOpen(null);
      reload();
    } catch (cause) {
      setActionError(cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12 border-t border-line pt-10">
      <PanelHeading title={t.admin.proOrders.title} sub={t.admin.proOrders.sub} />
      {error ? <ErrorNotice error={error} onRetry={reload} /> : null}
      {actionError ? <ErrorNotice error={actionError} className="mb-4" /> : null}
      {loading ? <SkeletonRows count={2} height="h-20" /> : null}
      {data && data.length === 0 ? <EmptyPanel title={t.admin.proOrders.empty} /> : null}
      <ul className="flex flex-col gap-3">
        {(data ?? []).map((order) => (
          <li key={order.id} className="rounded-card border border-line bg-raised p-4">
            <p className="font-semibold">{order.email}</p>
            <p className="mt-0.5 text-[14px] text-muted">
              {formatUzs(order.amountUzs)} · {t.admin.proOrders.days(order.days)} · {formatDate(order.createdAt)}
            </p>
            {open === order.id ? (
              <div className="mt-3 rounded-input border border-line bg-bg p-3">
                <p className="text-[15px] leading-snug">{t.admin.proOrders.confirmWarn(order.days, order.email)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => void act(order.id, 'confirm')} className={button({ variant: 'solid', size: 'sm' })}>
                    {busy ? t.admin.proOrders.confirming : t.admin.proOrders.confirm}
                  </button>
                  <button type="button" onClick={() => setOpen(null)} className={button({ variant: 'outline', size: 'sm' })}>
                    {t.admin.proOrders.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setOpen(order.id)} className={button({ variant: 'solid', size: 'sm' })}>
                  {t.admin.proOrders.confirm}
                </button>
                <button type="button" disabled={busy} onClick={() => void act(order.id, 'reject')} className={button({ variant: 'ghost', size: 'sm' })}>
                  {t.admin.proOrders.reject}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Confirming moves real credits, so it is never one stray click: the row first names the seller and the amount. */
function OrderList({ status }: { status: OrderStatus }) {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad<OwnerOrder[]>(`/api/owner/orders?status=${status}`);
  const [open, setOpen] = useState<{ id: string; mode: 'confirm' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  const act = async (id: string, mode: 'confirm' | 'reject') => {
    setBusy(true);
    setActionError(null);
    try {
      if (mode === 'confirm') await api.post(`/api/owner/orders/${id}/confirm`);
      else await api.post(`/api/owner/orders/${id}/reject`, { json: { reason: reason.trim() } });
      setOpen(null);
      setReason('');
      toast(t.admin.orders.done);
      reload();
    } catch (cause) {
      setActionError(cause);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorNotice error={error} onRetry={reload} />;
  if (loading) return <SkeletonRows count={2} height="h-32" />;
  if (!data || data.length === 0) return <EmptyPanel title={t.admin.orders.empty} body={t.admin.orders.emptyHint} />;

  return (
    <>
      {actionError ? <ErrorNotice error={actionError} className="mb-4" /> : null}
      <ul className="flex flex-col gap-3">
        {data.map((order) => (
          <li key={order.id} className="rounded-card border border-line bg-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div className="min-w-0">
                <p className="font-semibold break-all">{order.userEmail}</p>
                <p className="mt-1 text-[14px] text-muted">
                  {t.admin.orders.credits(order.credits)} · {formatUzs(order.amountUzs)} · {t.credits.method[order.paymentMethod]}
                </p>
                <p className="mt-0.5 text-[14px] text-muted">
                  {t.admin.orders.payer}: {order.payerReference ?? t.admin.orders.noPayer} · {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusPill tone={order.status === 'paid' ? 'success' : order.status === 'rejected' ? 'danger' : order.status === 'pending' ? 'strong' : 'neutral'}>
                {t.credits.status[order.status]}
              </StatusPill>
            </div>

            {order.rejectionReason ? <p className="mt-3 rounded-input bg-bg px-3 py-2 text-[14px]">{order.rejectionReason}</p> : null}

            {order.status === 'pending' ? (
              <div className="mt-4 border-t border-line pt-4">
                {open?.id === order.id && open.mode === 'confirm' ? (
                  <div>
                    <p className="text-[15px] leading-snug">{t.admin.orders.confirmWarn(order.credits, order.userEmail)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => void act(order.id, 'confirm')} className={button({ variant: 'solid', size: 'sm' })}>
                        {busy ? t.admin.orders.confirming : t.admin.orders.confirm}
                      </button>
                      <button type="button" onClick={() => setOpen(null)} className={button({ variant: 'outline', size: 'sm' })}>
                        {t.admin.orders.cancel}
                      </button>
                    </div>
                  </div>
                ) : open?.id === order.id && open.mode === 'reject' ? (
                  <div>
                    <Field label={t.admin.orders.rejectReason} help={t.admin.orders.rejectReasonHelp}>
                      {({ id, describedBy }) => <TextArea id={id} aria-describedby={describedBy} value={reason} onChange={(e) => setReason(e.target.value)} />}
                    </Field>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={busy || !reason.trim()} onClick={() => void act(order.id, 'reject')} className={button({ variant: 'danger', size: 'sm' })}>
                        {t.admin.orders.rejectSubmit}
                      </button>
                      <button type="button" onClick={() => setOpen(null)} className={button({ variant: 'outline', size: 'sm' })}>
                        {t.admin.orders.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setOpen({ id: order.id, mode: 'confirm' })} className={button({ variant: 'solid', size: 'sm' })}>
                      {t.admin.orders.confirm}
                    </button>
                    <button type="button" onClick={() => setOpen({ id: order.id, mode: 'reject' })} className={button({ variant: 'outline', size: 'sm' })}>
                      {t.admin.orders.reject}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
