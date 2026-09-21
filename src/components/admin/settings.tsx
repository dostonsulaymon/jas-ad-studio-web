'use client';

import { useState } from 'react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { Field, TextArea, TextInput } from '../ui/field';
import { useToast } from '../ui/toast';
import { PanelHeading, SkeletonRows } from './parts';
import { useLoad } from './use-load';
import { api } from '@/lib/api/client';
import type { Pack, PaymentInstructions, ProSubscription, PublicSettings, SupportContacts } from '@/lib/api/types';
import { t } from '@/lib/i18n';

const orNull = (value: string) => (value.trim() ? value.trim() : null);

export function AdminSettings() {
  const settings = useLoad<PublicSettings>('/api/settings/public');
  const packs = useLoad<Pack[]>('/api/packs');

  if (settings.error) return <ErrorNotice error={settings.error} onRetry={settings.reload} />;
  if (!settings.data) return <SkeletonRows count={2} height="h-64" />;

  return (
    <div className="max-w-[640px]">
      <ProForm initial={settings.data.proSubscription} />
      <PaymentForm initial={settings.data.paymentInstructions} />
      <SupportForm initial={settings.data.supportContacts} />
      <section className="mt-12 border-t border-line pt-10">
        <PanelHeading title={t.admin.settings.packs} sub={t.admin.settings.packsSub} />
        {packs.error ? <ErrorNotice error={packs.error} onRetry={packs.reload} /> : null}
        {packs.data && packs.data.length === 0 ? <p className="rounded-card border border-dashed border-line-strong p-5 text-[14px] text-muted">{t.admin.settings.packsEmpty}</p> : null}
        <ul className="flex flex-col gap-3">
          {(packs.data ?? []).map((pack) => (
            <PackRow key={`${pack.id}-${pack.priceUzs}`} pack={pack} />
          ))}
        </ul>
      </section>
    </div>
  );
}

/** D-102: one plan, one price. A blank price means PRO is not for sale and the panel says so. */
function ProForm({ initial }: { initial: ProSubscription }) {
  const save = useSave();
  const [priceUzs, setPrice] = useState(initial.priceUzs === null ? '' : String(initial.priceUzs));
  const [days, setDays] = useState(String(initial.days));

  return (
    <section>
      <PanelHeading title={t.admin.settings.proTitle} sub={t.admin.settings.proSub} />
      {save.error ? <ErrorNotice error={save.error} className="mb-4" /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.admin.settings.proPrice}>
          {({ id }) => <TextInput id={id} inputMode="numeric" value={priceUzs} onChange={(e) => setPrice(e.target.value)} />}
        </Field>
        <Field label={t.admin.settings.proDays}>
          {({ id }) => <TextInput id={id} type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />}
        </Field>
      </div>
      <button
        type="button"
        disabled={save.busy}
        onClick={() =>
          void save.run(() =>
            api.patch('/api/owner/settings/pro-subscription', {
              json: {
                priceUzs: priceUzs.trim() === '' ? null : Math.trunc(Number(priceUzs)),
                days: Math.trunc(Number(days)),
              },
            }),
          )
        }
        className={button({ variant: 'solid', size: 'md', className: 'mt-5' })}
      >
        {save.busy ? t.admin.settings.saving : t.admin.settings.save}
      </button>
    </section>
  );
}

function useSave() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const run = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
      toast(t.admin.settings.saved);
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

function PaymentForm({ initial }: { initial: PaymentInstructions }) {
  const [value, setValue] = useState<PaymentInstructions>(initial);
  const save = useSave();
  const field = (key: keyof PaymentInstructions, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label}>
      {({ id }) => <TextInput id={id} {...props} value={value[key] ?? ''} onChange={(e) => setValue({ ...value, [key]: e.target.value })} />}
    </Field>
  );

  return (
    <section>
      <PanelHeading title={t.admin.settings.payment} sub={t.admin.settings.paymentSub} />
      <div className="flex flex-col gap-5">
        {field('cardNumber', t.admin.settings.cardNumber, { inputMode: 'numeric' })}
        {field('cardHolder', t.admin.settings.cardHolder)}
        {field('paymeUrl', t.admin.settings.paymeUrl, { type: 'url' })}
        {field('clickUrl', t.admin.settings.clickUrl, { type: 'url' })}
        <Field label={t.admin.settings.instructions}>
          {({ id }) => <TextArea id={id} value={value.instructionsUz ?? ''} onChange={(e) => setValue({ ...value, instructionsUz: e.target.value })} />}
        </Field>
      </div>
      {save.error ? <ErrorNotice error={save.error} className="mt-5" /> : null}
      <button
        type="button"
        disabled={save.busy}
        onClick={() =>
          void save.run(() =>
            api.patch('/api/owner/settings/payment-instructions', {
              json: {
                cardNumber: orNull(value.cardNumber ?? ''),
                cardHolder: orNull(value.cardHolder ?? ''),
                paymeUrl: orNull(value.paymeUrl ?? ''),
                clickUrl: orNull(value.clickUrl ?? ''),
                instructionsUz: orNull(value.instructionsUz ?? ''),
              },
            }),
          )
        }
        className={button({ variant: 'solid', size: 'md', className: 'mt-6 max-sm:w-full' })}
      >
        {save.busy ? t.admin.settings.saving : t.admin.settings.save}
      </button>
    </section>
  );
}

function SupportForm({ initial }: { initial: SupportContacts }) {
  const [value, setValue] = useState<SupportContacts>(initial);
  const save = useSave();

  return (
    <section className="mt-12 border-t border-line pt-10">
      <PanelHeading title={t.admin.settings.support} sub={t.admin.settings.supportSub} />
      <div className="flex flex-col gap-5">
        {(
          [
            ['telegramUser', t.admin.settings.telegramUser, 'text'],
            ['telegramBot', t.admin.settings.telegramBot, 'text'],
            ['email', t.admin.settings.email, 'email'],
          ] as const
        ).map(([key, label, type]) => (
          <Field key={key} label={label}>
            {({ id }) => <TextInput id={id} type={type} value={value[key] ?? ''} onChange={(e) => setValue({ ...value, [key]: e.target.value })} />}
          </Field>
        ))}
      </div>
      {save.error ? <ErrorNotice error={save.error} className="mt-5" /> : null}
      <button
        type="button"
        disabled={save.busy}
        onClick={() =>
          void save.run(() =>
            api.patch('/api/owner/settings/support-contacts', {
              json: { telegramUser: orNull(value.telegramUser ?? ''), telegramBot: orNull(value.telegramBot ?? ''), email: orNull(value.email ?? '') },
            }),
          )
        }
        className={button({ variant: 'solid', size: 'md', className: 'mt-6 max-sm:w-full' })}
      >
        {save.busy ? t.admin.settings.saving : t.admin.settings.save}
      </button>
    </section>
  );
}

function PackRow({ pack }: { pack: Pack }) {
  const [price, setPrice] = useState(String(pack.priceUzs));
  const save = useSave();

  return (
    <li className="rounded-card border border-line bg-raised p-4">
      <p className="font-semibold">{t.admin.settings.packCredits(pack.credits)}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Field label={t.admin.settings.packPrice} className="min-w-0 flex-1 basis-[180px]">
          {({ id }) => <TextInput id={id} type="number" inputMode="numeric" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />}
        </Field>
        <button
          type="button"
          disabled={save.busy || !(Number(price) > 0)}
          onClick={() => void save.run(() => api.patch(`/api/owner/packs/${pack.id}`, { json: { priceUzs: Math.trunc(Number(price)) } }))}
          className={button({ variant: 'outline', size: 'md' })}
        >
          {t.admin.settings.save}
        </button>
      </div>
      {save.error ? <ErrorNotice error={save.error} className="mt-3" /> : null}
    </li>
  );
}
