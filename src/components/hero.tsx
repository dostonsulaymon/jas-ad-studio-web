import { t } from '@/lib/i18n';
import { HeroTray } from './hero-tray';

/**
 * The hand-drawn annotation, and the one piece of decoration in the whole page that is
 * doing real work: it circles "Google Flow" and names who actually makes the video.
 * The never-imply-video rule, drawn rather than stated.
 *
 * aria-hidden because the note beside it is real text; a screen reader gets the words,
 * not a description of a squiggle.
 */
function FlowAnnotation() {
  return (
    <span aria-hidden className="pointer-events-none absolute -top-3.5 -left-4 hidden lg:block">
      <svg width="420" height="74" viewBox="0 0 420 74" fill="none" className="overflow-visible">
        <path
          d="M88 5.5C62 2 28 4 13 11 -1 17.5 2 30 20 38c22 9 76 10 110 4 25-4.5 34-13 26-21C147 12 118 5 88 5.5Z"
          stroke="var(--color-primary)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
{/* The leader sweeps clear of the baseline before running right to the note.
            Its first version crossed "ʼda tayyorlaysiz", which read as a strike-through. */}
        <path
          d="M150 44c70 22 180 26 258 20"
          stroke="var(--color-primary)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M28 6l8 16-18 3"
          stroke="var(--color-primary)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36 24c28 14 70 20 114 20"
          stroke="var(--color-primary)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Hero() {
  return (
    <section id="studiya" className="pt-14 pb-2">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-14">
        <h1 className="max-w-[15ch] text-[clamp(2.125rem,7vw,4.625rem)] leading-[1.04] font-extrabold tracking-[-0.042em] text-balance">
          {t.hero.headlineLine1}
          <br />
          {t.hero.headlineLine2}
        </h1>

        <p className="mt-5 max-w-[56ch] text-[clamp(1rem,2.2vw,1.219rem)] leading-[1.62] text-muted">
          Rasmni yuklang. Mahsulotingizga mos{' '}
          <span className="font-semibold text-ink">{t.hero.subKeyword1}</span> va tayyor{' '}
          <span className="font-semibold text-ink">{t.hero.subKeyword2}</span> oling. Videoni{' '}
          <span className="relative inline-block font-semibold text-ink">
            Google&nbsp;Flow
            <FlowAnnotation />
          </span>
          ʼda tayyorlaysiz.
          <span className="mt-3 block font-[family-name:var(--font-caveat)] text-[19px] leading-tight text-primary lg:absolute lg:mt-0 lg:translate-x-[428px] lg:translate-y-[14px]">
            {t.hero.annotation}
          </span>
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a
            href="#studiya-boshlash"
            className="inline-flex h-[52px] items-center justify-center rounded-md bg-primary px-6 text-base font-bold whitespace-nowrap text-white transition-transform duration-fast active:translate-y-px"
          >
            {t.hero.primaryCta}
          </a>
          <a
            href="#qanday-ishlaydi"
            className="inline-flex h-[52px] items-center justify-center px-1 text-base font-bold text-primary underline decoration-[1.5px] underline-offset-[5px]"
          >
            {t.hero.secondaryCta}
          </a>
        </div>
      </div>

      <HeroTray />
    </section>
  );
}
