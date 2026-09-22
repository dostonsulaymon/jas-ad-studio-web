import Link from 'next/link';
import { Envelope, TelegramLogo } from '@phosphor-icons/react/ssr';
import type { PublicSettings } from '@/lib/api/types';
import { t } from '@/lib/i18n';

function telegramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle;
  return `https://t.me/${handle.replace(/^@/, '')}`;
}

/** Support contacts render only when the owner has set them; any of the three may be null. */
export function SiteFooter({ settings }: { settings: PublicSettings | null }) {
  const contacts = settings?.supportContacts;
  const links = [
    contacts?.telegramUser ? { href: telegramHref(contacts.telegramUser), label: contacts.telegramUser, kind: t.footer.telegram, icon: 'tg' } : null,
    contacts?.telegramBot ? { href: telegramHref(contacts.telegramBot), label: contacts.telegramBot, kind: t.footer.bot, icon: 'tg' } : null,
    contacts?.email ? { href: `mailto:${contacts.email}`, label: contacts.email, kind: t.footer.email, icon: 'mail' } : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <footer className="border-t border-line px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[44ch]">
          <p className="flex items-center gap-2.5">
            <span aria-hidden className="grid size-7 place-items-center rounded-[8px] bg-ink text-[15px] font-black text-bg">
              P
            </span>
            <span className="text-[16px] font-bold tracking-[-0.02em]">{t.brand.name}</span>
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">{t.footer.notVideo}</p>
          <p className="mt-1 text-[14px] text-muted">{t.footer.madeFor}</p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          {links.length > 0 ? (
            <div>
              <h2 className="text-[13px] font-semibold">{t.footer.supportTitle}</h2>
              <ul className="mt-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.icon === 'tg' ? '_blank' : undefined}
                      rel={link.icon === 'tg' ? 'noopener noreferrer' : undefined}
                      className="inline-flex min-h-11 items-center gap-2.5 text-[14px] text-muted transition-colors hover:text-ink"
                    >
                      {link.icon === 'tg' ? <TelegramLogo size={18} aria-hidden /> : <Envelope size={18} aria-hidden />}
                      <span className="sr-only">{link.kind}: </span>
                      <span className="break-all">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h2 className="sr-only">{t.footer.privacy}</h2>
            <Link href="/maxfiylik" className="inline-flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-ink">
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
