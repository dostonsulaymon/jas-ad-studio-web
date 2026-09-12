'use client';

import { useEffect, useState } from 'react';
import { ErrorNotice } from '../error-notice';
import { Field, TextArea, TextInput } from '../field';
import { api } from '@/lib/api/client';
import { t } from '@/lib/i18n';
import type { components } from '@/lib/api/generated/schema';

type Payment = components['schemas']['PaymentInstructionsDto'];
type Support = components['schemas']['SupportContactsDto'];
type PublicSettings = components['schemas']['PublicSettingsDto'];
type AdminPack = components['schemas']['AdminPackDto'];
type Pack = components['schemas']['CreditPackDto'];

const blankPayment: Payment = {
  cardNumber: null,
  cardHolder: null,
  paymeUrl: null,
  clickUrl: null,
  instructionsUz: null,
};
const blankSupport: Support = { telegramUser: null, telegramBot: null, email: null };

/** An empty box means "not set", which the API stores as null rather than "". */
const orNull = (value: string): string | null => (value.trim().length > 0 ? value.trim() : null);

export function AdminSettings() {
  const [payment, setPayment] = useState<Payment>(blankPayment);
  const [support, setSupport] = useState<Support>(blankSupport);
  const [packs, setPacks] = useState<AdminPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The owner reads the current values through the public settings endpoint: they are
    // the same values sellers see, which is the point of editing them here.
    Promise.all([
      api.get<PublicSettings>('/api/settings/public'),
      api.get<Pack[]>('/api/packs'),
    ])
      .then(([settings, list]) => {
        if (cancelled) return;
        setPayment({ ...blankPayment, ...(settings.paymentInstructions as Payment) });
        setSupport({ ...blankSupport, ...(settings.supportContacts as Support) });
        setPacks(list.map((p) => ({ ...p, isActive: true, sortOrder: p.sortOrder })));
      })
      .catch((failed: unknown) => {
        if (!cancelled) setError(failed);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (what: 'payment' | 'support') => {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      if (what === 'payment') {
        await api.patch<Payment>('/api/owner/settings/payment-instructions', { json: payment });
      } else {
        await api.patch<Support>('/api/owner/settings/support-contacts', { json: support });
      }
      setSaved(what);
    } catch (failed) {
      setError(failed);
    } finally {
      setBusy(false);
    }
  };

  const savePack = async (pack: AdminPack, priceUzs: number | null) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await api.patch<AdminPack>(`/api/owner/packs/${pack.id}`, {
        json: { priceUzs, isActive: pack.isActive, sortOrder: pack.sortOrder },
      });
      setPacks((list) => list.map((p) => (p.id === pack.id ? { ...p, ...updated } : p)));
      setSaved('packs');
    } catch (failed) {
      setError(failed);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="h-40 animate-pulse rounded-md bg-stone-2" aria-hidden />;

  return (
    <div className="max-w-[640px]">
      <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{t.admin.settings.title}</h2>

      {error ? <ErrorNotice error={error} className="mt-5" /> : null}

      <section className="mt-8">
        <h3 className="text-[17px] font-bold">{t.admin.settings.payment}</h3>
        <p className="mt-1 mb-5 text-[14px] text-muted">{t.admin.settings.paymentSub}</p>

        <Field label={t.admin.settings.cardNumber}>
          {({ id }) => (
            <TextInput
              id={id}
              inputMode="numeric"
              value={payment.cardNumber ?? ''}
              onChange={(e) => setPayment({ ...payment, cardNumber: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.cardHolder}>
          {({ id }) => (
            <TextInput
              id={id}
              value={payment.cardHolder ?? ''}
              onChange={(e) => setPayment({ ...payment, cardHolder: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.paymeUrl}>
          {({ id }) => (
            <TextInput
              id={id}
              type="url"
              value={payment.paymeUrl ?? ''}
              onChange={(e) => setPayment({ ...payment, paymeUrl: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.clickUrl}>
          {({ id }) => (
            <TextInput
              id={id}
              type="url"
              value={payment.clickUrl ?? ''}
              onChange={(e) => setPayment({ ...payment, clickUrl: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.instructions}>
          {({ id }) => (
            <TextArea
              id={id}
              value={payment.instructionsUz ?? ''}
              onChange={(e) => setPayment({ ...payment, instructionsUz: orNull(e.target.value) })}
            />
          )}
        </Field>

        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => save('payment')}
            className="inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white disabled:opacity-40"
          >
            {busy ? t.admin.settings.saving : t.admin.settings.save}
          </button>
          {saved === 'payment' ? (
            <span role="status" className="text-[15px] font-bold text-primary">
              {t.admin.settings.saved}
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h3 className="text-[17px] font-bold">{t.admin.settings.support}</h3>
        <p className="mt-1 mb-5 text-[14px] text-muted">{t.admin.settings.supportSub}</p>

        <Field label={t.admin.settings.telegramUser}>
          {({ id }) => (
            <TextInput
              id={id}
              value={support.telegramUser ?? ''}
              onChange={(e) => setSupport({ ...support, telegramUser: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.telegramBot}>
          {({ id }) => (
            <TextInput
              id={id}
              value={support.telegramBot ?? ''}
              onChange={(e) => setSupport({ ...support, telegramBot: orNull(e.target.value) })}
            />
          )}
        </Field>
        <Field label={t.admin.settings.email}>
          {({ id }) => (
            <TextInput
              id={id}
              type="email"
              value={support.email ?? ''}
              onChange={(e) => setSupport({ ...support, email: orNull(e.target.value) })}
            />
          )}
        </Field>

        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => save('support')}
            className="inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white disabled:opacity-40"
          >
            {busy ? t.admin.settings.saving : t.admin.settings.save}
          </button>
          {saved === 'support' ? (
            <span role="status" className="text-[15px] font-bold text-primary">
              {t.admin.settings.saved}
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h3 className="text-[17px] font-bold">{t.admin.settings.packs}</h3>
        <p className="mt-1 mb-5 text-[14px] text-muted">{t.admin.settings.packsSub}</p>

        <ul className="flex flex-col gap-3">
          {packs.map((pack) => (
            <PackRow key={pack.id} pack={pack} busy={busy} onSave={savePack} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function PackRow({
  pack,
  busy,
  onSave,
}: {
  pack: AdminPack;
  busy: boolean;
  onSave: (pack: AdminPack, priceUzs: number | null) => void;
}) {
  const [price, setPrice] = useState(pack.priceUzs === null ? '' : String(pack.priceUzs));

  return (
    <li className="rounded-md border border-border bg-white p-4">
      <p className="text-[15px] font-bold">{t.admin.settings.packCredits(pack.credits)}</p>
      {pack.priceUzs === null ? (
        <p className="mt-0.5 text-[13.5px] text-muted">{t.admin.settings.packNoPrice}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex-1 basis-[180px]">
          <span className="mb-1.5 block text-[13.5px] font-semibold">
            {t.admin.settings.packPrice}
          </span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-[52px] w-full rounded-sm border border-border bg-white px-3.5 tabular-nums focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave(pack, price.trim() === '' ? null : Number(price))}
          className="h-[52px] rounded-md border border-border bg-white px-5 text-[15px] font-bold disabled:opacity-40"
        >
          {t.admin.settings.save}
        </button>
      </div>
    </li>
  );
}
