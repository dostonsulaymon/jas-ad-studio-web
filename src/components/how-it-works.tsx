import { t } from '@/lib/i18n';

/**
 * Three steps, and genuinely a sequence, so the numbering carries information rather
 * than decorating the section. Laid out on a rule rather than in three cards: they are
 * one process, not three separate things.
 */
export function HowItWorks() {
  const steps = [
    { title: t.how.step1Title, body: t.how.step1Body },
    { title: t.how.step2Title, body: t.how.step2Body },
    { title: t.how.step3Title, body: t.how.step3Body },
  ];

  return (
    <section id="qanday-ishlaydi" className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-14">
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.03em]">
        {t.how.title}
      </h2>

      <ol className="mt-8 grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-3">
        {steps.map((step) => (
          <li key={step.title}>
            <h3 className="text-[15.5px] font-bold">{step.title}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
