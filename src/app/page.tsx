import { App } from '@/components/app';
import { Faq } from '@/components/faq';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { SiteFooter } from '@/components/site-footer';
import { t } from '@/lib/i18n';

/**
 * One page, `/` (spec §8). The hero, how-it-works and FAQ are server-rendered; the
 * header, studio and drawer are the single client island inside <App>.
 */
export default function Home() {
  return (
    <>
      <a href="#asosiy" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <App
        hero={<Hero />}
        sections={
          <>
            <HowItWorks />
            <Faq />
          </>
        }
      />

      <SiteFooter />
    </>
  );
}
