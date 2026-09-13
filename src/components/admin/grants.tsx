'use client';

import { useState } from 'react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { Field, Select, TextArea, TextInput } from '../ui/field';
import { PanelHeading } from './parts';
import { useLoad } from './use-load';
import { api } from '@/lib/api/client';
import type { OwnerUser } from '@/lib/api/types';
import { t } from '@/lib/i18n';

/** A grant with no note is unauditable later, so the note is required here as well as by the API. */
export function AdminGrants() {
  const users = useLoad<OwnerUser[]>('/api/owner/users');
  const [userId, setUserId] = useState('');
  const [credits, setCredits] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const chosen = users.data?.find((u) => u.id === userId);
  const amount = Number(credits);
  const ready = Boolean(chosen) && Number.isInteger(amount) && amount > 0 && note.trim().length > 0;

  const submit = async () => {
    if (!ready || !chosen) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await api.post('/api/owner/grants', { json: { userId, credits: amount, note: note.trim() } });
      setDone(t.admin.grants.done(amount, chosen.email));
      setCredits('');
      setNote('');
      users.reload();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-[640px]">
      <PanelHeading title={t.admin.grants.title} sub={t.admin.grants.sub} />
      {users.error ? <ErrorNotice error={users.error} onRetry={users.reload} className="mb-5" /> : null}

      <div className="flex flex-col gap-6">
        <Field label={t.admin.grants.user}>
          {({ id }) => (
            <Select id={id} value={userId} disabled={users.loading} onChange={(e) => setUserId(e.target.value)}>
              <option value="">{t.admin.grants.userPlaceholder}</option>
              {(users.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.available})
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.admin.grants.credits}>
          {({ id }) => <TextInput id={id} type="number" inputMode="numeric" min={1} value={credits} onChange={(e) => setCredits(e.target.value)} />}
        </Field>
        <Field label={t.admin.grants.note} help={t.admin.grants.noteHelp}>
          {({ id, describedBy }) => <TextArea id={id} aria-describedby={describedBy} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
      </div>

      {error ? <ErrorNotice error={error} className="mt-5" /> : null}
      {done ? (
        <p role="status" className="mt-5 font-medium text-success">
          {done}
        </p>
      ) : null}

      <button type="button" disabled={!ready || busy} onClick={() => void submit()} className={button({ variant: 'solid', size: 'md', className: 'mt-6 max-sm:w-full' })}>
        {busy ? t.admin.grants.submitting : t.admin.grants.submit}
      </button>
    </section>
  );
}
