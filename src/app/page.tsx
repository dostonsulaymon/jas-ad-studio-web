import Link from 'next/link';
import { ArrowRight, Plus, UploadSimple } from '@phosphor-icons/react/ssr';
import { Explorer } from '@/components/gallery/explorer';
import { SiteFooter } from '@/components/site-footer';
import { button } from '@/components/ui/button';
import { readGalleryCards, readPublicSettings, resolvePlates } from '@/lib/content';
import { t } from '@/lib/i18n';

/** The landing is server-rendered; the gallery (search, chips, play, prompt sheet) is the client island. */
export default async function Home() {
  const [cards, settings] = await Promise.all([readGalleryCards(), readPublicSettings()]);
  const plates = resolvePlates(settings?.heroPhotos?.photos ?? []);

  return (
    <>
      <main id="asosiy">
        <Explorer cards={cards} hero={<HeroCopy />} />
        <HowItWorks />
        <Moslashtirish plates={plates} />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function HeroCopy() {
  return (
    <>
      <p className="inline-flex h-7 items-center rounded-full border border-line bg-raised px-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
        {t.hero.badge}
      </p>
      <h1 className="mx-auto mt-6 max-w-[13em] text-[clamp(38px,5.6vw,78px)] leading-[1.06] font-black tracking-[-0.04em] text-balance">
        {t.hero.headline}
      </h1>
      <p className="mx-auto mt-6 max-w-[42ch] text-[17px] leading-[1.5] text-pretty text-muted sm:text-[19px]">{t.hero.sub}</p>
      <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <a href="#galereya" className={button({ variant: 'primary', size: 'lg' })}>
          {t.hero.primaryCta}
          <ArrowRight size={18} weight="bold" aria-hidden />
        </a>
        <Link href="/studiya" className={button({ variant: 'outline', size: 'lg' })}>
          {t.hero.secondaryCta}
        </Link>
      </div>
    </>
  );
}

function HowItWorks() {
  return (
    <section id="qanday" aria-labelledby="qanday-title" className="border-t border-line px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <h2 id="qanday-title" className="text-[clamp(30px,3.4vw,46px)] leading-[1.05] font-extrabold tracking-[-0.035em]">
          {t.how.title}
        </h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {t.how.steps.map((step, index) => (
            <li key={step.title} className="bg-bg p-6 sm:p-8 lg:p-10">
              <span aria-hidden className="block text-[72px] leading-[0.8] font-black tracking-[-0.06em] text-line-strong sm:text-[96px]">
                {index + 1}
              </span>
              <h3 className="mt-8 text-[20px] leading-tight font-bold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-2 max-w-[32ch] text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Moslashtirish({ plates }: { plates: { src: string; alt: string }[] }) {
  const cells = [...plates.slice(0, 5), null, ...plates.slice(5)];

  return (
    <section aria-labelledby="moslash-title" className="border-t border-line px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <h2 id="moslash-title" className="max-w-[14ch] text-[clamp(30px,3.4vw,46px)] leading-[1.05] font-extrabold tracking-[-0.035em]">
            {t.custom.title}
          </h2>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted">{t.custom.body}</p>
          <Link href="/studiya" className={button({ variant: 'solid', size: 'lg', className: 'mt-8 max-sm:w-full' })}>
            <UploadSimple size={18} weight="bold" aria-hidden />
            {t.custom.cta}
          </Link>
        </div>

        <ul className="grid grid-cols-4 gap-2 sm:gap-3">
          {cells.map((plate, index) =>
            plate ? (
              <li key={`${plate.src}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- owner photos served through the API proxy */}
                <img src={plate.src} alt={plate.alt} loading="lazy" className="aspect-square w-full rounded-input bg-raised object-cover" />
              </li>
            ) : (
              <li key="upload">
                <Link
                  href="/studiya"
                  className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-input border border-dashed border-line-strong p-2 text-center transition-colors duration-150 hover:border-ink hover:bg-raised"
                >
                  <Plus size={24} aria-hidden />
                  <span className="text-[12px] leading-tight text-muted max-sm:sr-only">{t.custom.uploadTile}</span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="savollar" aria-labelledby="savollar-title" className="border-t border-line px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <h2 id="savollar-title" className="text-[clamp(30px,3.4vw,46px)] leading-[1.05] font-extrabold tracking-[-0.035em] lg:sticky lg:top-24 lg:self-start">
          {t.faq.title}
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {t.faq.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-16 list-none items-center justify-between gap-6 py-5 text-[17px] leading-snug font-semibold tracking-[-0.01em] sm:text-[19px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus size={20} aria-hidden className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pr-10 pb-6 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-[1320px] rounded-card border border-line bg-raised px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="mx-auto max-w-[16ch] text-[clamp(34px,4.6vw,62px)] leading-[1] font-black tracking-[-0.045em] text-balance">{t.band.title}</h2>
        <p className="mx-auto mt-5 max-w-[42ch] text-[17px] text-muted">{t.band.body}</p>
        <Link href="/studiya" className={button({ variant: 'solid', size: 'lg', className: 'mt-8 max-sm:w-full' })}>
          {t.hero.secondaryCta}
        </Link>
      </div>
    </section>
  );
}
