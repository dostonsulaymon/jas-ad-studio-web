'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorNotice } from './error-notice';
import { TextInput } from './field';
import { api } from '@/lib/api/client';
import { formatDate, t } from '@/lib/i18n';
import type { components } from '@/lib/api/generated/schema';

type Balance = components['schemas']['CreditBalanceDto'];
type Pack = components['schemas']['CreditPackDto'];
type Order = components['schemas']['CreditOrderDto'];
type PublicSettings = components['schemas']['PublicSettingsDto'];
type PaymentMethod = Order['paymentMethod'];

const METHODS: ReadonlyArray<PaymentMethod> = ['card_transfer', 'payme', 'click', 'other'];

function money(uzs: number): string {
  return `${uzs.toLocaleString('ru-RU').replace(/ /g, ' ')} soʻm`;
}

/**
 * Buying credits, and the orders that came from it (D-007, D-008).
 *
 * Payment is manual: an order is a statement of intent that stays `pending` until the
 * owner confirms it against a real transfer. Nothing here takes a card number, and the
 * screen never implies the payment happened.
 *
 * No price is invented. `GET /api/packs` returns nothing to sell until Jakhongir prices
 * a pack, and this says so plainly rather than showing an empty grid.
 */
export function CreditsDrawer({
  open,
  onClose,
  onBalance,
}: {
  open: boolean;
  onClose: () => void;
  onBalance?: (balance: Balance) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<Element | null>(null);

  const [balance, setBalance] = useState<Balance | null>(null);
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState<unknown>(null);

  const [packId, setPackId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('card_transfer');
  const [payer, setPayer] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      api.get<Balance>('/api/credits/balance'),
      api.get<Pack[]>('/api/packs'),
      api.get<Order[]>('/api/orders'),
      api.get<PublicSettings>('/api/settings/public'),
    ])
      .then(([b, p, o, s]) => {
        setError(null);
        setBalance(b);
        setPacks(p);
        setOrders(o);
        setSettings(s);
        onBalance?.(b);
      })
      .catch(setError);
  }, [onBalance]);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    heading.current?.focus();
    load();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, load]);

  if (!open) return null;

  // A pack with no price is not for sale. The owner has not set one yet (D-082).
  const sellable = (packs ?? []).filter((p) => typeof p.priceUzs === 'number' && p.priceUzs > 0);
  const chosen = sellable.find((p) => p.id === packId) ?? null;
  const payment = settings?.paymentInstructions as
    | { cardNumber?: string | null; cardHolder?: string | null; instructionsUz?: string | null }
    | undefined;
  const hasPaymentInfo = Boolean(payment?.cardNumber ?? payment?.instructionsUz);

  const submit = async () => {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      await api.post<Order>('/api/orders', {
        json: {
          packId: chosen.id,
          paymentMethod: method,
          payerReference: payer.trim().length > 0 ? payer.trim() : null,
        },
      });
      setPackId(null);
      setPayer('');
      load();
    } catch (failed) {
      setError(failed);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    setCancelling(id);
    setError(null);
    try {
      await api.post<Order>(`/api/orders/${id}/cancel`);
      load();
    } catch (failed) {
      setError(failed);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.credits.close}
        onClick={onClose}
        className="absolute inset-0 w-full cursor-default bg-ink/35"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-bg shadow-[-28px_0_60px_rgba(23,33,29,0.14)]"
      >
        <div className="flex items-center gap-4 border-b border-border px-6 py-4 sm:px-8">
          <h2
            id="credits-title"
            ref={heading}
            tabIndex={-1}
            className="text-[24px] font-extrabold tracking-[-0.03em] outline-none"
          >
            {t.credits.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.credits.close}
            className="ml-auto flex size-11 items-center justify-center rounded-sm border border-border bg-white text-[15px]"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {error ? <ErrorNotice error={error} onRetry={load} className="mb-5" /> : null}

          {/* The number the seller came to see, stated once and large. */}
          <div className="rounded-lg border border-border bg-white px-5 py-5">
            <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
              {t.credits.balanceLabel}
            </p>
            <p className="mt-1 text-[44px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">
              {balance ? balance.available : '—'}
            </p>
            {balance && balance.reserved > 0 ? (
              <p className="mt-2 text-[14px] text-muted">
                {t.credits.reservedNote(balance.reserved)}
              </p>
            ) : null}
          </div>

          <h3 className="mt-8 text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.credits.packsTitle}
          </h3>

          {packs !== null && sellable.length === 0 ? (
            <div className="mt-3 rounded-md border-[1.5px] border-dashed border-border px-5 py-6">
              <p className="text-[15px] font-semibold">{t.credits.noPacks}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
                {t.credits.noPacksSub}
              </p>
            </div>
          ) : null}

          {sellable.length > 0 ? (
            <>
              <ul className="mt-3 flex flex-col gap-2.5">
                {sellable.map((pack) => {
                  const price = pack.priceUzs;
                  const isChosen = pack.id === packId;
                  return (
                    <li key={pack.id}>
                      <button
                        type="button"
                        onClick={() => setPackId(pack.id)}
                        aria-pressed={isChosen}
                        className={`flex w-full items-center gap-4 rounded-md border px-4 py-4 text-left transition-colors duration-fast ${
                          isChosen ? 'border-primary bg-primary/5' : 'border-border bg-white'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-bold">
                            {t.credits.packCredits(pack.credits)}
                          </span>
                          <span className="mt-0.5 block text-[13.5px] text-muted">
                            {t.credits.perPrompt(money(Math.round(price / pack.credits)))}
                          </span>
                        </span>
                        <span className="shrink-0 text-[16px] font-bold tabular-nums">
                          {money(price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {chosen ? (
                <div className="mt-6 border-t border-border pt-6">
                  <fieldset className="border-0 p-0">
                    <legend className="mb-2 text-[14px] font-bold">{t.credits.methodLabel}</legend>
                    <div className="flex flex-wrap gap-2">
                      {METHODS.map((m) => (
                        <label
                          key={m}
                          className={`inline-flex h-11 cursor-pointer items-center rounded-full border px-4 text-[14px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                            m === method
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-white text-muted'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={m}
                            checked={m === method}
                            onChange={() => setMethod(m)}
                            className="sr-only"
                          />
                          {t.credits.method[m]}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label htmlFor="payer" className="mt-5 mb-1.5 block text-[14px] font-bold">
                    {t.credits.payerLabel}
                  </label>
                  <TextInput
                    id="payer"
                    value={payer}
                    maxLength={200}
                    onChange={(e) => setPayer(e.target.value)}
                  />
                  <p className="mt-1.5 text-[13.5px] text-muted">{t.credits.payerHelp}</p>

                  {/* What to actually pay, from the owner's settings. Never invented. */}
                  <div className="mt-5 rounded-md border border-border bg-stone-1 px-4 py-4">
                    <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
                      {t.credits.howToPay}
                    </p>
                    {hasPaymentInfo ? (
                      <div className="mt-2 text-[15px] leading-relaxed">
                        {payment?.cardNumber ? (
                          <p>
                            <span className="text-muted">{t.credits.cardNumber}: </span>
                            <span className="font-semibold tabular-nums select-all">
                              {payment.cardNumber}
                            </span>
                          </p>
                        ) : null}
                        {payment?.cardHolder ? (
                          <p>
                            <span className="text-muted">{t.credits.cardHolder}: </span>
                            <span className="font-semibold">{payment.cardHolder}</span>
                          </p>
                        ) : null}
                        {payment?.instructionsUz ? (
                          <p className="mt-1.5 text-[14.5px] text-muted">
                            {payment.instructionsUz}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
                        {t.credits.noPaymentInfo}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={busy}
                    className="mt-5 inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white disabled:opacity-40"
                  >
                    {busy ? t.credits.submitting : t.credits.submit}
                  </button>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                    {t.credits.pendingNote}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}

          <h3 className="mt-10 text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.credits.ordersTitle}
          </h3>

          {orders !== null && orders.length === 0 ? (
            <p className="mt-2 text-[15px] text-muted">{t.credits.noOrders}</p>
          ) : null}

          <ul className="mt-3 flex flex-col gap-2.5">
            {(orders ?? []).map((order) => (
              <li key={order.id} className="rounded-md border border-border bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold">
                      {t.credits.packCredits(order.credits)} · {money(order.amountUzs)}
                    </p>
                    <p className="mt-0.5 text-[13.5px] text-muted">
                      {t.credits.method[order.paymentMethod]} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-[30px] shrink-0 items-center rounded-full px-3 text-[12.5px] font-bold ${
                      order.status === 'pending'
                        ? 'bg-accent text-ink'
                        : order.status === 'paid'
                          ? 'bg-primary text-white'
                          : 'border border-border bg-white text-muted'
                    }`}
                  >
                    {t.credits.status[order.status]}
                  </span>
                </div>

                {order.rejectionReason ? (
                  <p className="mt-3 rounded-sm bg-stone-1 px-3 py-2 text-[13.5px] leading-snug">
                    {order.rejectionReason}
                  </p>
                ) : null}

                {order.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => void cancel(order.id)}
                    disabled={cancelling === order.id}
                    className="mt-3 inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14px] font-semibold disabled:opacity-50"
                  >
                    {cancelling === order.id ? t.credits.cancelling : t.credits.cancel}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
