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
 * The layout here is deliberately plain — structure and behaviour only, reusing the
 * tokens and control sizes already established elsewhere in the studio. The visual
 * treatment of this panel is a design decision and belongs to the session that owns the
 * direction, not to this one.
 *
 * Two product rules are load-bearing and must survive any redesign:
 *   1. Only the PROMPT goes on the clipboard. Not the concept, not the shot plan — a
 *      seller pasting into Flow must get exactly what Flow should read.
 *   2. The app never claims to make the video. The Flow button is a link out.
 */
export function GenerationResult({
  pkg,
  productName,
}: {
  pkg: AdPackage;
  productName: string;
}) {
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
      <h2 id="result-title" className="text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold tracking-[-0.03em]">
        {t.generate.readyTitle}
      </h2>
      <p className="mt-1.5 mb-7 text-[15px] leading-relaxed text-muted">{t.generate.readySub}</p>

      {result.concept ? (
        <div className="border-t border-border py-4">
          <p className="text-[13px] font-bold tracking-wide text-muted uppercase">
            {t.generate.conceptLabel}
          </p>
          <p className="mt-1.5 text-[17px] font-bold">{result.concept.titleUz}</p>
          <p className="mt-1.5 text-[15.5px] leading-relaxed">{result.concept.rationaleUz}</p>
          <dl className="mt-3 grid gap-1.5 sm:grid-cols-[120px_1fr]">
            <dt className="text-[14px] font-bold">{t.generate.hookLabel}</dt>
            <dd className="text-[15.5px]">{result.concept.hookUz}</dd>
            <dt className="text-[14px] font-bold">{t.generate.ctaLabel}</dt>
            <dd className="text-[15.5px]">{result.concept.ctaUz}</dd>
          </dl>
        </div>
      ) : null}

      {result.shots.length > 0 ? (
        <div className="border-t border-border py-4">
          <p className="text-[13px] font-bold tracking-wide text-muted uppercase">
            {t.generate.shotsLabel}
          </p>
          <ol className="mt-2">
            {result.shots.map((shot, index) => (
              <li
                key={`${String(shot.startSeconds)}-${String(index)}`}
                className="grid gap-x-4 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[84px_1fr]"
              >
                <span className="font-mono text-[13.5px] text-muted">
                  {formatSeconds(shot.startSeconds)}–{formatSeconds(shot.endSeconds)}s
                </span>
                <div className="min-w-0">
                  <p className="text-[15.5px] leading-relaxed break-words">{shot.descriptionUz}</p>
                  <p className="mt-0.5 text-[14px] text-muted">
                    {t.generate.cameraLabel}: {shot.cameraUz}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {result.product.fidelityConstraints.length > 0 ? (
        <div className="border-t border-border py-4">
          <p className="text-[13px] font-bold tracking-wide text-muted uppercase">
            {t.generate.fidelityLabel}
          </p>
          <ul className="mt-2 list-disc pl-5">
            {result.product.fidelityConstraints.map((line) => (
              <li key={line} className="text-[15px] leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-border py-4">
        <p className="text-[13px] font-bold tracking-wide text-muted uppercase">
          {t.generate.promptLabel}
        </p>
        {/* Selectable and scrollable: when the clipboard is unavailable this is what the
            seller copies by hand, so it must never be truncated or collapsed. */}
        <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-border bg-primary/5 p-3.5 text-[13.5px] leading-relaxed whitespace-pre-wrap select-all">
          {pkg.promptEn}
        </pre>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onCopy()}
          className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-[15px] font-semibold text-white"
        >
          {copied ? t.generate.copied : t.generate.copy}
        </button>
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
      </div>

      {manual ? (
        <p role="status" className="mt-3 text-[14.5px] font-semibold text-primary">
          {t.generate.copyManual}
        </p>
      ) : null}

      <p className="mt-4 text-[14px] leading-relaxed text-muted">{t.generate.flowNote}</p>
    </section>
  );
}
