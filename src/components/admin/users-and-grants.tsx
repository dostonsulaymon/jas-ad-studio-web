'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorNotice } from '../error-notice';
import { Field, TextArea, TextInput } from '../field';
import { api } from '@/lib/api/client';
import { formatDate, t } from '@/lib/i18n';
import type { components } from '@/lib/api/generated/schema';

type OwnerUser = components['schemas']['OwnerUserDto'];
type Balance = components['schemas']['CreditBalanceDto'];

function useUsers() {
  // `null` is "not loaded yet", so the effect never writes state synchronously.
  const [users, setUsers] = useState<OwnerUser[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const fetchUsers = useCallback(() => {
    api.get<OwnerUser[]>('/api/owner/users').then(setUsers).catch(setError);
  }, []);

  useEffect(() => {
    if (users === null && !error) fetchUsers();
  }, [users, error, fetchUsers]);

  const load = useCallback(() => {
    setError(null);
    setUsers(null);
  }, []);

  return { users: users ?? [], loading: users === null && !error, error, load };
}

/**
 * Granting credits by hand. The note is required by the API (GRANT_NOTE_REQUIRED) and
 * required here too, because every owner action is written to the audit log and a grant
 * with no reason is unauditable six months later.
 */
export function AdminGrants() {
  const { users, loading, error, load } = useUsers();
  const [userId, setUserId] = useState('');
  const [credits, setCredits] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const chosen = users.find((u) => u.id === userId);
  const amount = Number(credits);
  const ready = Boolean(userId) && Number.isInteger(amount) && amount > 0 && note.trim().length > 0;

  const submit = async () => {
    if (!ready || !chosen) return;
    setBusy(true);
    setSubmitError(null);
    setDone(null);
    try {
      await api.post<Balance>('/api/owner/grants', {
        json: { userId, credits: amount, note: note.trim() },
      });
      setDone(t.admin.grants.done(amount, chosen.email));
      setCredits('');
      setNote('');
      load();
    } catch (failed) {
      setSubmitError(failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[640px]">
      <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{t.admin.grants.title}</h2>
      <p className="mt-1.5 mb-6 text-[15px] leading-relaxed text-muted">{t.admin.grants.sub}</p>

      {error ? <ErrorNotice error={error} onRetry={load} className="mb-5" /> : null}

      <Field label={t.admin.grants.user} help={t.admin.grants.userHelp}>
        {({ id, describedBy }) => (
          <select
            id={id}
            aria-describedby={describedBy}
            value={userId}
            disabled={loading}
            onChange={(e) => setUserId(e.target.value)}
            className="h-[52px] w-full rounded-sm border border-border bg-white px-3.5 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20"
          >
            <option value="">—</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email} ({u.available})
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label={t.admin.grants.credits}>
        {({ id }) => (
          <TextInput
            id={id}
            type="number"
            min={1}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />
        )}
      </Field>

      <Field label={t.admin.grants.note} help={t.admin.grants.noteHelp}>
        {({ id, describedBy }) => (
          <TextArea
            id={id}
            aria-describedby={describedBy}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}
      </Field>

      {submitError ? <ErrorNotice error={submitError} className="mb-5" /> : null}

      {done ? (
        <p role="status" className="mb-5 text-[15px] font-bold text-primary">
          {done}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!ready || busy}
        onClick={submit}
        className="inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white disabled:opacity-40"
      >
        {busy ? t.admin.grants.submitting : t.admin.grants.submit}
      </button>
    </div>
  );
}

/**
 * Users, read-only (D-037). A table on a wide screen and stacked rows on a phone: a
 * five-column table at 390 px is unreadable, and this panel has to work from a phone.
 */
export function AdminUsers() {
  const { users, loading, error, load } = useUsers();

  return (
    <div>
      <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{t.admin.users.title}</h2>
      <p className="mt-1.5 mb-6 text-[15px] text-muted">{t.admin.users.sub}</p>

      {error ? <ErrorNotice error={error} onRetry={load} className="mb-5" /> : null}
      {loading ? <div className="h-24 animate-pulse rounded-md bg-stone-2" aria-hidden /> : null}

      {!loading && users.length === 0 && !error ? (
        <p className="text-[15px] text-muted">{t.admin.users.empty}</p>
      ) : null}

      {users.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-[14.5px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2.5 pr-4 text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t.admin.users.email}
                  </th>
                  <th className="py-2.5 pr-4 text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t.admin.users.role}
                  </th>
                  <th className="py-2.5 pr-4 text-right text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t.admin.users.available}
                  </th>
                  <th className="py-2.5 pr-4 text-right text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t.admin.users.reserved}
                  </th>
                  <th className="py-2.5 text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
                    {t.admin.users.joined}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border">
                    <td className="py-3 pr-4 font-semibold break-all">{u.email}</td>
                    <td className="py-3 pr-4 text-muted">
                      {u.role === 'owner' ? t.admin.users.roleOwner : t.admin.users.roleSeller}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">{u.available}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-muted">{u.reserved}</td>
                    <td className="py-3 text-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 sm:hidden">
            {users.map((u) => (
              <li key={u.id} className="rounded-md border border-border bg-white p-4">
                <p className="text-[15px] font-bold break-all">{u.email}</p>
                <p className="mt-1 text-[13.5px] text-muted">
                  {u.role === 'owner' ? t.admin.users.roleOwner : t.admin.users.roleSeller} ·{' '}
                  {formatDate(u.createdAt)}
                </p>
                <p className="mt-2 text-[14px] tabular-nums">
                  {t.admin.users.available}: <b>{u.available}</b>
                  {u.reserved > 0 ? (
                    <span className="text-muted">
                      {' · '}
                      {t.admin.users.reserved}: {u.reserved}
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
