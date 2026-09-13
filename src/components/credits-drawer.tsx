'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { Lightning } from '@phosphor-icons/react';
import { Sheet, SheetHeader } from './ui/sheet';
import { button } from './ui/button';
import { ErrorNotice } from './ui/error-notice';
import { ChoiceChip, Field, TextInput } from './ui/field';
import { useToast } from './ui/toast';
import { useSession } from './session';
import { api } from '@/lib/api/client';
import type { Balance, Order, Pack, PaymentMethod, PublicSettings } from '@/lib/api/types';
import { formatDate, formatUzs, t } from '@/lib/i18n';

const METHODS: readonly PaymentMethod[] = ['card_transfer', 'payme', 'click', 'other'];

/**
 * Buying credits by manual transfer. No price is ever invented: `GET /api/packs` is empty until the
 * owner prices a pack, and the drawer says so instead of showing a placeholder.
 */
export function CreditsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const toast = useToast();
  const { setBalance } = useSession();
  const [balance, setLocalBalance] = useState<Balance | null>(null);
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [packId, setPackId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('card_transfer');
  const [payer, setPayer] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((n) => n + 1), []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const signal = controller.signal;
    Promise.all([
      api.get<Balance>('/api/credits/balance', { signal }),
      api.get<Pack[]>('/api/packs', { signal }),
      api.get<Order[]>('/api/orders', { signal }),
      api.get<PublicSettings>('/api/settings/public', { signal }),
    ])
      .then(([b, p, o, s]) => {
        setError(null);
        setLocalBalance(b);
        setBalance(b);
        setPacks(p);
        setOrders(o);
        setSettings(s);
      })
      .catch((cause: unknown) => {
        if (!signal.aborted) setError(cause);
      });
    return () => controller.abort();
  }, [open, version, setBalance]);

  const sellable = (packs ?? []).filter((p) => typeof p.priceUzs === 'number' && p.priceUzs > 0);
  const chosen = sellable.find((p) => p.id === packId) ?? null;
  const payment = settings?.paymentInstructions;
  const hasPaymentInfo = Boolean(payment?.cardNumber || payment?.instructionsUz || payment?.paymeUrl || payment?.clickUrl);

  const submit = async () => {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      await api.post<Order>('/api/orders', {
        json: { packId: chosen.id, paymentMethod: method, payerReference: payer.trim() ? payer.trim() : null },
      });
      setPackId(null);
      setPayer('');
      toast(t.credits.submitted);
      reload();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    setCancelling(id);
    setError(null);
    try {
      await api.post<Order>(`/api/orders/${id}/cancel`);
      reload();
    } catch (cause) {
      setError(cause);
    } finally {
      setCancelling(null);
    }
  };

  const heading = 'text-[13px] font-semibold text-muted';

  return (
    <Sheet open={open} onClose={onClose} titleId={titleId}>
      <SheetHeader titleId={titleId} title={t.credits.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
        {error ? <ErrorNotice error={error} onRetry={reload} className="mb-5" /> : null}

        <div className="rounded-card border border-line bg-bg p-5">
          <p className={heading}>{t.credits.balanceLabel}</p>
          <p className="mt-2 flex items-center gap-3 text-[52px] leading-none font-black tracking-[-0.05em] tabular-nums">
            <Lightning size={30} weight="fill" aria-hidden />
            {balance ? balance.available : <span className="inline-block h-11 w-16 animate-pulse rounded-input bg-raised-2" />}
          </p>
          {balance && balance.reserved > 0 ? <p className="mt-3 text-[14px] text-muted">{t.credits.reservedNote(balance.reserved)}</p> : null}
        </div>

        <h3 className={`${heading} mt-8`}>{t.credits.packsTitle}</h3>
        {packs !== null && sellable.length === 0 ? (
          <div className="mt-3 rounded-card border border-dashed border-line-strong p-5">
            <p className="font-semibold">{t.credits.noPacks}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.credits.noPacksSub}</p>
          </div>
        ) : null}

        {sellable.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2.5">
            {sellable.map((pack) => {
              const isChosen = pack.id === packId;
              return (
                <li key={pack.id}>
                  <button
                    type="button"
                    aria-pressed={isChosen}
                    onClick={() => setPackId(isChosen ? null : pack.id)}
                    className={`flex min-h-[72px] w-full items-center gap-4 rounded-input border px-4 py-3 text-left transition-colors duration-150 ${
                      isChosen ? 'border-ink bg-raised-2' : 'border-line bg-bg hover:border-line-strong'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.credits.packCredits(pack.credits)}</span>
                      <span className="mt-0.5 block text-[13.5px] text-muted">{t.credits.perPrompt(formatUzs(pack.priceUzs / pack.credits))}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatUzs(pack.priceUzs)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {chosen ? (
          <div className="mt-6 border-t border-line pt-6">
            <fieldset>
              <legend className="mb-2 text-[14px] font-semibold">{t.credits.methodLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <ChoiceChip key={m} name="payment-method" value={m} checked={m === method} onChange={() => setMethod(m)}>
                    {t.credits.method[m]}
                  </ChoiceChip>
                ))}
              </div>
            </fieldset>

            <Field label={t.credits.payerLabel} help={t.credits.payerHelp} optional className="mt-5">
              {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={payer} maxLength={200} onChange={(e) => setPayer(e.target.value)} />}
            </Field>

            <div className="mt-5 rounded-input border border-line bg-bg p-4">
              <p className={heading}>{t.credits.howToPay}</p>
              {hasPaymentInfo ? (
                <dl className="mt-2 space-y-1 text-[15px]">
                  {payment?.cardNumber ? (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-muted">{t.credits.cardNumber}:</dt>
                      <dd className="font-semibold tabular-nums select-all">{payment.cardNumber}</dd>
                    </div>
                  ) : null}
                  {payment?.cardHolder ? (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-muted">{t.credits.cardHolder}:</dt>
                      <dd className="font-semibold">{payment.cardHolder}</dd>
                    </div>
                  ) : null}
                  {payment?.instructionsUz ? <p className="pt-1 text-[14px] leading-relaxed text-muted">{payment.instructionsUz}</p> : null}
                  {payment?.paymeUrl ? (
                    <a href={payment.paymeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">
                      Payme
                    </a>
                  ) : null}
                  {payment?.clickUrl ? (
                    <a href={payment.clickUrl} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex min-h-11 items-center underline underline-offset-4">
                      Click
                    </a>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{t.credits.noPaymentInfo}</p>
              )}
            </div>

            <button type="button" onClick={() => void submit()} disabled={busy} className={button({ variant: 'primary', size: 'md', full: true, className: 'mt-5' })}>
              {busy ? t.credits.submitting : t.credits.submit}
            </button>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{t.credits.pendingNote}</p>
          </div>
        ) : null}

        <h3 className={`${heading} mt-10`}>{t.credits.ordersTitle}</h3>
        {orders !== null && orders.length === 0 ? <p className="mt-2 text-[15px] text-muted">{t.credits.noOrders}</p> : null}
        <ul className="mt-3 flex flex-col gap-2.5">
          {(orders ?? []).map((order) => (
            <li key={order.id} className="rounded-input border border-line bg-bg p-4">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {t.credits.packCredits(order.credits)} · {formatUzs(order.amountUzs)}
                  </p>
                  <p className="mt-0.5 text-[13.5px] text-muted">
                    {t.credits.method[order.paymentMethod]} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatus status={order.status} />
              </div>
              {order.rejectionReason ? <p className="mt-3 rounded-input bg-raised px-3 py-2 text-[13.5px] leading-snug">{order.rejectionReason}</p> : null}
              {order.status === 'pending' ? (
                <button type="button" onClick={() => void cancel(order.id)} disabled={cancelling === order.id} className={button({ variant: 'outline', size: 'sm', className: 'mt-3' })}>
                  {cancelling === order.id ? t.credits.cancelling : t.credits.cancel}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

/** State is a word plus a shape; green and red are reserved for paid and rejected. */
export function OrderStatus({ status }: { status: Order['status'] }) {
  const tone =
    status === 'paid'
      ? 'border-success/40 text-success'
      : status === 'rejected'
        ? 'border-danger/40 text-danger'
        : status === 'pending'
          ? 'border-line-strong text-ink'
          : 'border-line text-muted';
  return <span className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-[12.5px] font-semibold ${tone}`}>{t.credits.status[status]}</span>;
}
