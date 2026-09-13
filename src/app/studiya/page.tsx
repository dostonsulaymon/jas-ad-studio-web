import type { Metadata } from 'next';
import { Studio } from '@/components/studio/studio';
import { SiteFooter } from '@/components/site-footer';
import { readPublicSettings } from '@/lib/content';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t.studioPage.metaTitle };

/** `?loyiha=<id>` opens a saved project; the studio reads it after mount. */
export default async function StudioPage() {
  const settings = await readPublicSettings();
  return (
    <>
      <main id="asosiy" className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px] pt-10 pb-20 sm:pt-14 sm:pb-28">
          <h1 className="text-[clamp(34px,4.4vw,58px)] leading-[1] font-black tracking-[-0.045em]">{t.studioPage.title}</h1>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-muted">{t.studioPage.sub}</p>
          <Studio />
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
