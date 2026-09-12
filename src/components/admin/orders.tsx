'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorNotice } from '../error-notice';
import { TextArea } from '../field';
import { api } from '@/lib/api/client';
import { formatDate, t } from '@/lib/i18n';
import type { components } from '@/lib/api/generated/schema';

type OwnerOrder = components['schemas']['OwnerOrderDto'];
type Status = OwnerOrder['status'];

const STATUSES: ReadonlyArray<Status> = ['pending', 'paid', 'rejected', 'cancelled'];

function money(uzs: number): string {
  return `${uzs.toLocaleString('ru-RU').replace(/ /g, ' ')} soʻm`;
}

/**
 * Pending orders: confirm, or reject with a reason (D-037).
 *
 * Confirming moves real credits through the ledger, so it is never one stray click: the
 * row expands into a sentence naming the seller and the amount, and only then confirms.
 */
export function AdminOrders() {
  const [status, setStatus] = useState<Status>('pending');
  // Keyed by status rather than a single list plus a loading flag: switching tabs then
  // needs no state write from the effect body, which is what React 19 objects to.
  const [byStatus, setByStatus] = useState<Partial<Record<Status, OwnerOrder[]>>>({});
  const [error, setError] = useState<unknown>(null);
  const [open, setOpen] = useState<{ id: string; mode: 'confirm' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback((next: Status) => {
    api
      .get<OwnerOrder[]>(`/api/owner/orders?status=${next}`)
      .then((list) => setByStatus((current) => ({ ...current, [next]: list })))
      .catch(setError);
  }, []);

  useEffect(() => {
    if (byStatus[status] === undefined) load(status);
  }, [status, byStatus, load]);

  const orders = byStatus[status] ?? [];
  const loading = byStatus[status] === undefined && !error;

  const act = async (id: string, mode: 'confirm' | 'reject') => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'confirm') {
        await api.post(`/api/owner/orders/${id}/confirm`);
      } else {
        await api.post(`/api/owner/orders/${id}/reject`, { json: { reason: reason.trim() } });
      }
      setOpen(null);
      setReason('');
      // Confirming or rejecting changes two lists at once: the order leaves `pending`
      // and appears under `paid` or `rejected`. Dropping both forces a fresh read.
      setByStatus({});
    } catch (failed) {
      setError(failed);
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    setError(null);
    setByStatus({});
  };

  return (
    <div>
      <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{t.admin.orders.title}</h2>

      <div
        role="tablist"
        aria-label={t.admin.orders.title}
        className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={s === status}
            onClick={() => setStatus(s)}
            className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-semibold whitespace-nowrap ${
              s === status
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-muted'
            }`}
          >
            {t.admin.orders.status[s]}
          </button>
        ))}
      </div>

      {error ? <ErrorNotice error={error} onRetry={retry} className="mt-5" /> : null}

      {loading ? (
        <ul className="mt-5 flex flex-col gap-3" aria-hidden>
          {[0, 1].map((i) => (
            <li key={i} className="h-[120px] animate-pulse rounded-md bg-stone-2" />
          ))}
        </ul>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-5 rounded-md border-[1.5px] border-dashed border-border px-5 py-8 text-center">
          <p className="text-[15px] font-semibold">{t.admin.orders.empty}</p>
          <p className="mt-1 text-[14px] text-muted">{t.admin.orders.emptyHint}</p>
        </div>
      ) : null}

      <ul className="mt-5 flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-md border border-border bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <div className="min-w-0">
                <p className="text-[15.5px] font-bold break-words">{order.userEmail}</p>
                <p className="mt-0.5 text-[13.5px] text-muted">
                  {t.admin.orders.credits(order.credits)} · {money(order.amountUzs)} ·{' '}
                  {t.admin.orders.method[order.paymentMethod]}
                </p>
                <p className="mt-0.5 text-[13.5px] text-muted">
                  {t.admin.orders.payer}:{' '}
                  {order.payerReference ?? (
                    <span className="text-muted">{t.admin.orders.noPayer}</span>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                {/* State is a shape plus a word, never colour alone. */}
                <span
                  className={`inline-flex h-[30px] items-center rounded-full px-3 text-[12.5px] font-bold ${
                    order.status === 'pending'
                      ? 'bg-accent text-ink'
                      : order.status === 'paid'
                        ? 'bg-primary text-white'
                        : 'border border-border bg-white text-muted'
                  }`}
                >
                  {t.admin.orders.status[order.status]}
                </span>
                <span className="text-[12.5px] text-muted">{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {order.rejectionReason ? (
              <p className="mt-3 rounded-sm bg-stone-1 px-3 py-2 text-[13.5px] leading-snug">
                {order.rejectionReason}
              </p>
            ) : null}

            {order.status === 'pending' ? (
              <div className="mt-4 border-t border-border pt-4">
                {open?.id === order.id && open.mode === 'confirm' ? (
                  <div className="rounded-sm border border-border bg-primary/5 p-4">
                    <p className="text-[14px] leading-snug">
                      {t.admin.orders.confirmWarn(order.credits, order.userEmail)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(order.id, 'confirm')}
                        className="h-11 rounded-sm bg-primary px-5 text-[14px] font-bold text-white disabled:opacity-50"
                      >
                        {busy ? t.admin.orders.confirming : t.admin.orders.confirm}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        className="h-11 rounded-sm border border-border bg-white px-5 text-[14px] font-semibold"
                      >
                        {t.admin.orders.cancel}
                      </button>
                    </div>
                  </div>
                ) : open?.id === order.id && open.mode === 'reject' ? (
                  <div>
                    <label
                      htmlFor={`reason-${order.id}`}
                      className="mb-1.5 block text-[14px] font-bold"
                    >
                      {t.admin.orders.rejectReason}
                    </label>
                    <TextArea
                      id={`reason-${order.id}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[88px] w-full rounded-sm border border-border bg-white px-3.5 py-3"
                    />
                    <p className="mt-1.5 text-[13.5px] text-muted">
                      {t.admin.orders.rejectReasonHelp}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || reason.trim().length === 0}
                        onClick={() => act(order.id, 'reject')}
                        className="h-11 rounded-sm bg-primary px-5 text-[14px] font-bold text-white disabled:opacity-40"
                      >
                        {t.admin.orders.rejectSubmit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(null);
                          setReason('');
                        }}
                        className="h-11 rounded-sm border border-border bg-white px-5 text-[14px] font-semibold"
                      >
                        {t.admin.orders.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen({ id: order.id, mode: 'confirm' })}
                      className="h-11 rounded-sm bg-primary px-5 text-[14px] font-bold text-white"
                    >
                      {t.admin.orders.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen({ id: order.id, mode: 'reject' })}
                      className="h-11 rounded-sm border border-border bg-white px-5 text-[14px] font-semibold"
                    >
                      {t.admin.orders.reject}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
