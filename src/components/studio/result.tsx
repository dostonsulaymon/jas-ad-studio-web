'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import {
  copyText,
  downloadText,
  exportFilename,
  formatSeconds,
  toPlainText,
  FLOW_URL,
  type AdPackage,
} from '@/lib/generation';

/**
 * The inline result: concept, Uzbek shot plan, English prompt, and the three actions
 * source 01 §48 and §18 ask for.
 *
 * The visual idea: this is the one moment in the product worth marking, so the panel
 * opens with the single citron rule the rest of the studio never spends, and the prompt
 * block is treated as the deliverable rather than as the last section of a form. The
 * shot plan borrows the artboard's margin: times sit in a left rail against a hairline,
 * so a seller can scan the timing without reading the prose.
 *
 * Three product rules are load-bearing and survive the redesign:
 *   1. Only the PROMPT goes on the clipboard. Not the concept, not the shot plan — a
 *      seller pasting into Flow must get exactly what Flow should read (§48).
 *   2. The app never claims to make the video. The Flow control is a link out (D-050).
 *   3. The prompt block stays selectable and is never truncated: when the Clipboard API
 *      is missing, which is common in in-app browsers, that block IS the copy mechanism.
 */
export function GenerationResult({ pkg, productName }: { pkg: AdPackage; productName: string }) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const { result } = pkg;

  const onCopy = async () => {
    setManual(false);
    // §48: only the prompt.
    const ok = await copyText(pkg.promptEn);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2_500);
      return;
    }
    // Expected, not exceptional: no Clipboard API in some in-app browsers.
    setManual(true);
  };

  const onDownload = () => {
    downloadText(
      exportFilename(productName, pkg.createdAt),
      toPlainText(pkg, {
        concept: t.generate.conceptLabel,
        hook: t.generate.hookLabel,
        cta: t.generate.ctaLabel,
        shots: t.generate.shotsLabel,
        prompt: t.generate.promptLabel,
        // Carries the product rule into the exported file too: the app writes the
        // prompt, Flow makes the video.
        madeWith: t.footer.notVideo,
      }),
    );
  };

  return (
    <section aria-labelledby="result-title">
      {/* The one citron rule in the studio. Spent here because this is the delivery. */}
      <span aria-hidden className="block h-1 w-16 rounded-full bg-accent" />
      <h2
        id="result-title"
        className="mt-5 text-[clamp(1.625rem,3.4vw,2.125rem)] leading-tight font-extrabold tracking-[-0.035em]"
      >
        {t.generate.readyTitle}
      </h2>
      <p className="mt-2 max-w-[52ch] text-[15.5px] leading-relaxed text-muted">
        {t.generate.readySub}
      </p>

      {/* ---- the deliverable, first, because it is what the seller came for ---- */}
      <div className="mt-7 overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3 sm:px-5">
          <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.generate.promptLabel}
          </p>
          <button
            type="button"
            onClick={() => void onCopy()}
            aria-live="polite"
            className={`ml-auto inline-flex h-11 items-center gap-2 rounded-sm px-5 text-[15px] font-bold transition-colors duration-fast ${
              copied ? 'bg-accent text-ink' : 'bg-primary text-white'
            }`}
          >
            {copied ? (
              <>
                <span aria-hidden>✓</span>
                {t.generate.copied}
              </>
            ) : (
              t.generate.copy
            )}
          </button>
        </div>

        {/* Selectable and scrollable: when the clipboard is unavailable this is what the
            seller copies by hand, so it must never be truncated or collapsed. */}
        <pre className="max-h-[22rem] overflow-auto bg-stone-1 px-4 py-4 font-mono text-[13.5px] leading-[1.7] whitespace-pre-wrap select-all sm:px-5">
          {pkg.promptEn}
        </pre>

        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
          >
            {t.generate.download}
          </button>
          <a
            href={FLOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
          >
            {t.generate.openFlow}
          </a>
          <p className="basis-full text-[13.5px] leading-relaxed text-muted sm:basis-auto">
            {t.generate.flowNote}
          </p>
        </div>
      </div>

      {manual ? (
        <p
          role="status"
          className="mt-3 rounded-sm border border-border bg-primary/5 px-4 py-3 text-[14.5px] leading-relaxed font-semibold"
        >
          {t.generate.copyManual}
        </p>
      ) : null}

      {/* ---- the reasoning behind it, for a seller who wants to check ---- */}
      {result.concept ? (
        <div className="mt-10">
          <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.generate.conceptLabel}
          </p>
          <h3 className="mt-2 text-[20px] leading-snug font-bold tracking-[-0.02em]">
            {result.concept.titleUz}
          </h3>
          <p className="mt-2 max-w-[64ch] text-[15.5px] leading-relaxed text-muted">
            {result.concept.rationaleUz}
          </p>
          <dl className="mt-4 grid gap-x-5 gap-y-2 border-t border-border pt-4 sm:grid-cols-[110px_1fr]">
            <dt className="text-[14px] font-bold">{t.generate.hookLabel}</dt>
            <dd className="text-[15.5px] leading-relaxed">{result.concept.hookUz}</dd>
            <dt className="text-[14px] font-bold">{t.generate.ctaLabel}</dt>
            <dd className="text-[15.5px] leading-relaxed">{result.concept.ctaUz}</dd>
          </dl>
        </div>
      ) : null}

      {result.shots.length > 0 ? (
        <div className="mt-10">
          <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.generate.shotsLabel}
          </p>
          {/* Times in a left rail against a hairline: the timing is scannable without
              reading the prose, which is how a shot list is actually used. */}
          <ol className="mt-3 border-l border-border">
            {result.shots.map((shot, index) => (
              <li
                key={`${String(shot.startSeconds)}-${String(index)}`}
                className="relative grid gap-x-5 gap-y-1 py-4 pl-5 sm:grid-cols-[92px_1fr]"
              >
                <span
                  aria-hidden
                  className="absolute top-[26px] -left-[4.5px] size-[9px] rounded-full border-[1.5px] border-primary bg-bg"
                />
                <span className="font-mono text-[13px] tracking-tight text-muted tabular-nums">
                  {formatSeconds(shot.startSeconds)}–{formatSeconds(shot.endSeconds)}s
                </span>
                <div className="min-w-0">
                  <p className="text-[15.5px] leading-relaxed break-words">{shot.descriptionUz}</p>
                  <p className="mt-1 text-[14px] leading-snug text-muted">
                    {t.generate.cameraLabel}: {shot.cameraUz}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {result.product.fidelityConstraints.length > 0 ? (
        <div className="mt-10 rounded-md border border-border bg-stone-1 px-5 py-4">
          <p className="text-[12.5px] font-bold tracking-[0.1em] text-muted uppercase">
            {t.generate.fidelityLabel}
          </p>
          <ul className="mt-2.5 list-disc pl-5 text-[15px] leading-[1.8]">
            {result.product.fidelityConstraints.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
