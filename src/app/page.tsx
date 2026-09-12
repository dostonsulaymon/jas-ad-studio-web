import { Faq } from '@/components/faq';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { t } from '@/lib/i18n';

/**
 * One page, server-rendered (spec §8). The studio is the only client island, and it
 * arrives in Task 9. Everything here is static.
 */
export default function Home() {
  return (
    <>
      <a href="#asosiy" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <SiteHeader
        right={
          <a
            href="/api/auth/google"
            className="inline-flex h-11 items-center rounded-sm px-3 text-[14.5px] font-semibold text-muted hover:text-ink"
          >
            {t.nav.signIn}
          </a>
        }
      />

      <main id="asosiy">
        <Hero />
        <HowItWorks />
        <Faq />
      </main>

      <SiteFooter />
    </>
  );
}
