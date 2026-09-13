import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { readPublicSettings } from '@/lib/content';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t.privacy.metaTitle };

/** Interim text describing what the app does today; Jakhongir's final text replaces it (D-022). */
export default async function PrivacyPage() {
  const settings = await readPublicSettings();
  return (
    <>
      <main id="asosiy" className="px-4 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-[68ch] pt-12 pb-24 sm:pt-20">
          <h1 className="text-[clamp(34px,4.4vw,56px)] leading-[1] font-black tracking-[-0.045em]">{t.privacy.title}</h1>
          <p className="mt-4 text-[14px] text-muted">{t.privacy.updated}</p>
          <p className="mt-8 rounded-card border border-line bg-raised p-5 leading-relaxed">{t.privacy.interim}</p>
          {t.privacy.sections.map((section) => (
            <section key={section.title} className="mt-12">
              <h2 className="text-[22px] font-bold tracking-[-0.02em]">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-[1.7] text-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
