'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GoogleLogo } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { useSession } from '../session';
import { ADMIN_TABS, tabFromHash, type AdminTab } from '@/lib/admin-tab';
import { t } from '@/lib/i18n';
import { AdminOrders } from './orders';
import { AdminGrants } from './grants';
import { AdminSettings } from './settings';
import { AdminGallery } from './gallery';
import { AdminHeroPhotos } from './hero-photos';
import { AdminUsers } from './users';
import { AdminReports } from './reports';

/**
 * The owner panel. The role check only hides the interface; every call goes to /api/owner/*, which
 * the API guards itself. The open tab lives in the URL hash so a refresh keeps it.
 */
export function AdminPanel() {
  const session = useSession();
  const [tab, setTab] = useState<AdminTab>('orders');

  useEffect(() => {
    const sync = () => setTab(tabFromHash(window.location.hash));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const choose = (next: AdminTab) => {
    setTab(next);
    history.replaceState(null, '', `#${next}`);
  };

  if (session.status === 'loading') {
    return (
      <div aria-hidden className="mx-auto max-w-[1080px] py-12">
        <span className="block h-10 w-64 animate-pulse rounded-full bg-raised" />
        <span className="mt-8 block h-11 w-full animate-pulse rounded-full bg-raised" />
      </div>
    );
  }

  if (session.status !== 'signedIn' || session.user?.role !== 'owner') {
    const signedOut = session.status !== 'signedIn';
    return (
      <div className="mx-auto max-w-[560px] py-20">
        <h1 className="text-[clamp(30px,3.4vw,40px)] leading-tight font-extrabold tracking-[-0.035em]">{t.admin.deniedTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{signedOut ? t.admin.deniedSignedOut : t.admin.deniedBody}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {signedOut ? (
            <a href="/api/auth/google" className={button({ variant: 'solid', size: 'md' })}>
              <GoogleLogo size={18} weight="bold" aria-hidden />
              {t.auth.signInWithGoogle}
            </a>
          ) : null}
          <Link href="/" className={button({ variant: 'outline', size: 'md' })}>
            {t.admin.deniedAction}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] pt-10 pb-20 sm:pt-14">
      <h1 className="text-[clamp(32px,4vw,52px)] leading-[1] font-black tracking-[-0.045em]">{t.admin.title}</h1>
      <p className="mt-3 text-muted">{t.admin.sub}</p>

      <nav aria-label={t.admin.tabsLabel} className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto border-b border-line px-4 pb-4 sm:mx-0 sm:px-0">
        {ADMIN_TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            aria-current={id === tab ? 'page' : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap transition-colors duration-150 ${
              id === tab ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            {t.admin.tabs[id]}
          </button>
        ))}
      </nav>

      <div className="pt-8">
        {tab === 'orders' ? <AdminOrders /> : null}
        {tab === 'grants' ? <AdminGrants /> : null}
        {tab === 'settings' ? <AdminSettings /> : null}
        {tab === 'gallery' ? <AdminGallery /> : null}
        {tab === 'hero' ? <AdminHeroPhotos /> : null}
        {tab === 'users' ? <AdminUsers /> : null}
        {tab === 'reports' ? <AdminReports /> : null}
      </div>
    </div>
  );
}
