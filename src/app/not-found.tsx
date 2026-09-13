import Link from 'next/link';
import { button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export default function NotFound() {
  return (
    <main id="asosiy" className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[560px] py-24 text-center">
        <p aria-hidden className="text-[120px] leading-none font-black tracking-[-0.06em] text-line-strong">404</p>
        <h1 className="mt-4 text-[28px] font-extrabold tracking-[-0.03em]">{t.errors.not_found.message}</h1>
        <Link href="/" className={button({ variant: 'solid', size: 'md', className: 'mt-8' })}>
          {t.nav.home}
        </Link>
      </div>
    </main>
  );
}
