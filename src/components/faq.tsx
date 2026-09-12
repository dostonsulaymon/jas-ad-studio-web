import { t } from '@/lib/i18n';

/**
 * Native <details>, so it works without JavaScript, is keyboard operable for free, and
 * is announced correctly. A hand-rolled accordion would be worse in all three ways.
 */
export function Faq() {
  const items = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  return (
    <section id="savollar" className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-14">
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.03em]">
        {t.faq.title}
      </h2>

      <div className="mt-8 max-w-[72ch] border-t border-border">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-border">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16.5px] font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden
                className="shrink-0 text-2xl leading-none font-normal text-muted transition-transform duration-fast group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-5 text-[15.5px] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
