'use client';

import { useRef, useState } from 'react';
import { ArrowSquareOut, Check, CheckCircle, Copy, DownloadSimple, Lightning } from '@phosphor-icons/react';
import { button } from '../ui/button';
import type { AdPackage, GenerationDetail } from '@/lib/api/types';
import { copyText, downloadText, exportFilename, FLOW_URL, formatSeconds, toPlainText } from '@/lib/generation';
import { t } from '@/lib/i18n';

/**
 * The deliverable first: the English prompt with Copy, TXT and the link out to Flow. Copy puts the
 * prompt and nothing else on the clipboard; the block stays selectable and untruncated because it
 * is the copy mechanism when the Clipboard API is missing.
 */
export function GenerationResult({
  pkg,
  productName,
  versions,
  shownId,
  onPickVersion,
  onNewVersion,
}: {
  pkg: AdPackage;
  productName: string;
  versions: GenerationDetail[];
  shownId: string;
  onPickVersion: (id: string) => void;
  onNewVersion: () => void;
}) {
  const [copy, setCopy] = useState<'idle' | 'ok' | 'manual'>('idle');
  const pre = useRef<HTMLPreElement>(null);
  const { result } = pkg;

  const onCopy = async () => {
    const ok = await copyText(pkg.promptEn);
    setCopy(ok ? 'ok' : 'manual');
    if (ok) setTimeout(() => setCopy('idle'), 2500);
    else if (pre.current) {
      const range = document.createRange();
      range.selectNodeContents(pre.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  const onDownload = () =>
    downloadText(
      exportFilename(productName, pkg.createdAt),
      toPlainText(pkg, {
        concept: t.generate.conceptLabel,
        hook: t.generate.hookLabel,
        cta: t.generate.ctaLabel,
        shots: t.generate.shotsLabel,
        camera: t.generate.cameraLabel,
        prompt: t.generate.promptLabel,
        footer: t.footer.notVideo,
      }),
    );

  const heading = 'text-[13px] font-semibold text-muted';
  const notes: Array<[string, string[]]> = [
    [t.generate.fidelityLabel, result.product.fidelityConstraints],
    [t.generate.assumptionsLabel, result.assumptionsUz],
    [t.generate.reviewNotesLabel, result.reviewNotesUz],
  ].filter(([, lines]) => (lines as string[]).length > 0) as Array<[string, string[]]>;

  return (
    <section aria-labelledby="result-title">
      {versions.length > 1 ? (
        <div className="mb-8">
          <p id="versions-label" className={`${heading} mb-2`}>
            {t.generate.versionsLabel}
          </p>
          <div role="group" aria-labelledby="versions-label" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
            {versions.map((version, index) => {
              const shown = version.id === shownId;
              return (
                <button
                  key={version.id}
                  type="button"
                  aria-pressed={shown}
                  onClick={() => onPickVersion(version.id)}
                  className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap transition-colors duration-150 ${
                    shown ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {t.generate.version(index + 1)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <CheckCircle size={30} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-success" />
        <div>
          <h2 id="result-title" className="text-[clamp(26px,2.8vw,34px)] leading-tight font-extrabold tracking-[-0.035em]">
            {t.generate.readyTitle}
          </h2>
          <p className="mt-1 text-muted">{t.generate.readySub}</p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-card border border-line bg-raised">
        <div className="flex flex-wrap items-center gap-3 border-b border-line py-2.5 pr-2.5 pl-5">
          <p className={heading}>{t.generate.promptLabel}</p>
          <button type="button" onClick={() => void onCopy()} className={button({ variant: 'solid', size: 'sm', className: 'ml-auto max-sm:w-full' })}>
            {copy === 'ok' ? <Check size={17} weight="bold" aria-hidden className="text-success" /> : <Copy size={17} aria-hidden />}
            {copy === 'ok' ? t.generate.copied : t.generate.copy}
          </button>
        </div>
        <pre ref={pre} className="max-h-[28rem] overflow-auto bg-bg p-5 font-mono text-[13.5px] leading-[1.7] break-words whitespace-pre-wrap text-ink/90 select-all">
          {pkg.promptEn}
        </pre>
        <div className="flex flex-wrap items-center gap-2 border-t border-line p-2.5">
          <button type="button" onClick={onDownload} className={button({ variant: 'outline', size: 'sm' })}>
            <DownloadSimple size={17} aria-hidden />
            {t.generate.download}
          </button>
          <a href={FLOW_URL} target="_blank" rel="noopener noreferrer" className={button({ variant: 'outline', size: 'sm' })}>
            <ArrowSquareOut size={17} aria-hidden />
            {t.generate.openFlow}
          </a>
        </div>
      </div>
      <p role="status" aria-live="polite" className={copy === 'manual' ? 'mt-3 text-[14px] font-medium' : 'sr-only'}>
        {copy === 'manual' ? t.generate.copyManual : copy === 'ok' ? t.generate.copied : ''}
      </p>
      <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{t.generate.flowNote}</p>

      {result.concept ? (
        <div className="mt-12">
          <p className={heading}>{t.generate.conceptLabel}</p>
          <h3 className="mt-2 text-[22px] leading-snug font-bold tracking-[-0.02em]">{result.concept.titleUz}</h3>
          <p className="mt-2 max-w-[64ch] leading-relaxed text-muted">{result.concept.rationaleUz}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-input border border-line p-4">
              <dt className={heading}>{t.generate.hookLabel}</dt>
              <dd className="mt-1 leading-relaxed">{result.concept.hookUz}</dd>
            </div>
            <div className="rounded-input border border-line p-4">
              <dt className={heading}>{t.generate.ctaLabel}</dt>
              <dd className="mt-1 leading-relaxed">{result.concept.ctaUz}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {result.shots.length > 0 ? (
        <div className="mt-12">
          <p className={heading}>{t.generate.shotsLabel}</p>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {result.shots.map((shot, index) => (
              <li key={`${shot.startSeconds}-${index}`} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[88px_minmax(0,1fr)]">
                <span className="font-mono text-[13px] text-muted tabular-nums">
                  {formatSeconds(shot.startSeconds)}-{formatSeconds(shot.endSeconds)}s
                </span>
                <div className="min-w-0">
                  <p className="leading-relaxed break-words">{shot.descriptionUz}</p>
                  <p className="mt-1 text-[14px] text-muted">
                    {t.generate.cameraLabel}: {shot.cameraUz}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {notes.map(([label, lines]) => (
            <div key={label}>
              <p className={heading}>{label}</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
                {lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-12 border-t border-line pt-6">
        <button type="button" onClick={onNewVersion} className={button({ variant: 'outline', size: 'md', className: 'max-sm:w-full' })}>
          <Lightning size={18} aria-hidden />
          {t.generate.newVersion}
        </button>
      </div>
    </section>
  );
}
