'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderSimple, Lightning, ShieldCheck, SignOut } from '@phosphor-icons/react';
import { button } from './ui/button';
import { useSession } from './session';
import { t } from '@/lib/i18n';

const NAV = [
  { href: '/#galereya', label: t.nav.examples },
  { href: '/#qanday', label: t.nav.how },
  { href: '/#savollar', label: t.nav.faq },
  { href: '/studiya', label: t.nav.studio },
];

export function Logo() {
  return (
    <>
      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-ink text-[15px] leading-none font-black text-bg">
        P
      </span>
      <span className="text-[16px] font-bold tracking-[-0.02em] max-sm:sr-only">{t.brand.name}</span>
    </>
  );
}

/**
 * Must fit at 360 px signed in, owner included: below `md` every account control is a 44 px icon
 * button whose label is screen-reader text.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const session = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="-ml-2 flex h-11 min-w-11 shrink-0 items-center justify-center gap-2.5 rounded-full px-2">
          <Logo />
        </Link>

        <nav aria-label={t.nav.primary} className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex h-11 items-center rounded-full px-4 text-[14px] font-medium transition-colors duration-150 ${
                  active ? 'bg-raised text-ink' : 'text-muted hover:bg-raised hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {session.status === 'loading' ? <span aria-hidden className="h-11 w-24 animate-pulse rounded-full bg-raised" /> : null}

          {session.status === 'signedOut' ? (
            <a href="/api/auth/google" className={button({ variant: 'solid', size: 'sm' })}>
              {t.nav.signIn}
            </a>
          ) : null}

          {session.status === 'signedIn' ? (
            <>
              <button type="button" onClick={session.openCredits} className={button({ variant: 'outline', size: 'sm', className: 'px-3.5' })}>
                <Lightning size={17} weight="fill" aria-hidden />
                <span className="tabular-nums" aria-hidden>
                  {session.balance ? session.balance.available : '·'}
                </span>
                <span className="sr-only">{t.nav.balance(session.balance?.available ?? null)}</span>
                <span aria-hidden className="font-normal text-muted max-xl:hidden">
                  {t.credits.title}
                </span>
              </button>

              <button type="button" onClick={session.openProjects} className={button({ variant: 'outline', size: 'sm', className: 'max-md:w-11 max-md:px-0' })}>
                <FolderSimple size={18} aria-hidden />
                <span className="max-md:sr-only">{t.nav.projects}</span>
              </button>

              {session.user?.role === 'owner' ? (
                <Link
                  href="/admin"
                  aria-current={pathname === '/admin' ? 'page' : undefined}
                  className={button({ variant: 'outline', size: 'sm', className: 'max-xl:w-11 max-xl:px-0' })}
                >
                  <ShieldCheck size={18} aria-hidden />
                  <span className="max-xl:sr-only">{t.nav.admin}</span>
                </Link>
              ) : null}

              <button type="button" onClick={() => void session.signOut()} className={button({ variant: 'ghost', size: 'icon' })}>
                <SignOut size={18} aria-hidden />
                <span className="sr-only">{t.nav.signOut}</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
