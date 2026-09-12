import { t } from '@/lib/i18n';

/**
 * One line at desktop, 72px tall. Below `lg` the section links drop and only the
 * wordmark and the account control stay, rather than wrapping to a second row.
 */
export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center gap-9 px-5 sm:px-14">
        <a
          href="#asosiy"
          className="inline-flex h-11 items-center text-[17px] font-extrabold tracking-[-0.02em] whitespace-nowrap"
        >
          <span>
            JAS <span className="text-primary">Ad Studio</span>
          </span>
        </a>

        <nav aria-label={t.nav.menu} className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[14.5px] font-medium text-muted">
            <li>
              <a href="#studiya" className="inline-flex h-11 items-center hover:text-ink">
                {t.nav.studio}
              </a>
            </li>
            <li>
              <a href="#qanday-ishlaydi" className="inline-flex h-11 items-center hover:text-ink">
                {t.nav.how}
              </a>
            </li>
            <li>
              <a href="#savollar" className="inline-flex h-11 items-center hover:text-ink">
                {t.nav.faq}
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}
