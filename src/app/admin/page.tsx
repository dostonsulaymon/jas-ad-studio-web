'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminOrders } from '@/components/admin/orders';
import { AdminSettings } from '@/components/admin/settings';
import { AdminGrants, AdminUsers } from '@/components/admin/users-and-grants';
import { api } from '@/lib/api/client';
import { t } from '@/lib/i18n';
import type { CurrentUserDto } from '@/lib/brief';

/**
 * The owner panel (D-037). Phone-friendly, and it calls only `/api/owner/*`.
 *
 * The role check below only hides the interface. It is not the gate and must never be
 * treated as one: the API guards every one of these routes with SessionGuard plus
 * OwnerGuard, and the role itself comes from the OWNER_EMAILS allowlist at sign-in,
 * never from the client. Someone who edits `role` in their browser gets a panel whose
 * every request returns 403.
 */

type Tab = 'orders' | 'grants' | 'settings' | 'users';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'orders', label: t.admin.tabOrders },
  { id: 'grants', label: t.admin.tabGrants },
  { id: 'settings', label: t.admin.tabSettings },
  { id: 'users', label: t.admin.tabUsers },
];

export default function AdminPage() {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    let cancelled = false;
    api
      .get<CurrentUserDto>('/api/me')
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        // Signed out, or not the owner. Either way the panel does not render.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <main className="mx-auto w-full max-w-[1080px] px-5 py-12 sm:px-10">
        <div className="h-10 w-48 animate-pulse rounded-full bg-stone-2" aria-hidden />
      </main>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <main className="mx-auto w-full max-w-[560px] px-5 py-20 sm:px-10">
        <h1 className="text-[28px] font-extrabold tracking-[-0.03em]">{t.admin.deniedTitle}</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">{t.admin.deniedBody}</p>
        <Link
          href="/"
          className="mt-7 inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-base font-bold text-white"
        >
          {t.admin.deniedAction}
        </Link>
      </main>
    );
  }

  return (
    <>
      <a href="#panel" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <header className="border-b border-border">
        <div className="mx-auto flex h-[72px] w-full max-w-[1080px] items-center gap-4 px-5 sm:px-10">
          <Link
            href="/"
            className="inline-flex h-11 items-center text-[17px] font-extrabold tracking-[-0.02em] whitespace-nowrap"
          >
            <span>
              JAS <span className="text-primary">Ad Studio</span>
            </span>
          </Link>
          <span className="inline-flex h-[30px] items-center rounded-full bg-accent px-3 text-[12.5px] font-bold text-ink">
            {t.admin.badge}
          </span>
          <Link
            href="/"
            className="ml-auto inline-flex h-11 items-center rounded-sm px-3 text-[14.5px] font-semibold text-muted hover:text-ink"
          >
            {t.admin.backToStudio}
          </Link>
        </div>
      </header>

      <nav aria-label={t.admin.title} className="border-b border-border bg-stone-1">
        <div className="mx-auto flex w-full max-w-[1080px] gap-1 overflow-x-auto px-5 py-2 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={item.id === tab ? 'page' : undefined}
              className={`inline-flex h-11 shrink-0 items-center rounded-sm px-4 text-[14.5px] font-semibold whitespace-nowrap ${
                item.id === tab ? 'bg-bg text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main id="panel" className="mx-auto w-full max-w-[1080px] px-5 py-9 sm:px-10">
        {tab === 'orders' ? <AdminOrders /> : null}
        {tab === 'grants' ? <AdminGrants /> : null}
        {tab === 'settings' ? <AdminSettings /> : null}
        {tab === 'users' ? <AdminUsers /> : null}
      </main>
    </>
  );
}
