'use client';

import { errorCopy, t } from '@/lib/i18n';

/**
 * The state the plan called neglected, built as four simultaneous fates.
 *
 * A seller who picks four files at once gets one done, one mid-flight, one queued and
 * one refused, all at the same moment. Showing only the happy path here is what makes
 * an upload feel broken: the seller cannot tell whether to wait or to act.
 *
 * `fetch` cannot report upload progress, so the caller drives these rows from an
 * XMLHttpRequest's upload.onprogress. This component only renders what it is told.
 */

export type UploadState =
  | { status: 'queued' }
  | { status: 'uploading'; percent: number }
  | { status: 'done'; assetId: string; url: string }
  | { status: 'refused'; code: string };

export interface UploadItem {
  id: string;
  name: string;
  bytes: number;
  state: UploadState;
}

function sizeLabel(bytes: number): string {
  // A 28 KB photo read as "0,0 MB" in the first version, which looks like a broken
  // file rather than a small one.
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function UploadList({
  items,
  onRemove,
}: {
  items: UploadItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const refused = items.filter((i) => i.state.status === 'refused');

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-4 py-3.5">
            {item.state.status === 'done' ? (
              // eslint-disable-next-line @next/next/no-img-element -- cookie-authenticated, no-store
              <img
                src={item.state.url}
                alt=""
                className="size-14 shrink-0 rounded-[10px] border border-border object-cover"
              />
            ) : (
              <span
                aria-hidden
                className={`size-14 shrink-0 rounded-[10px] ${
                  item.state.status === 'refused' ? 'bg-stone-2' : 'animate-pulse bg-stone-2'
                }`}
              />
            )}

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-semibold">{item.name}</span>
              <span className="block text-[13px] text-muted">
                {item.state.status === 'refused' ? (
                  <span className="font-semibold text-primary">{t.upload.notAnImage}</span>
                ) : (
                  <>
                    {sizeLabel(item.bytes)} ·{' '}
                    {item.state.status === 'queued'
                      ? t.upload.queued
                      : item.state.status === 'uploading'
                        ? t.upload.uploading(item.state.percent)
                        : t.upload.done}
                  </>
                )}
              </span>

              {/* The bar on a phone sits under the name rather than beside it. */}
              {item.state.status === 'uploading' ? (
                <span
                  role="progressbar"
                  aria-valuenow={item.state.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.name}
                  className="mt-2 block h-[5px] w-full overflow-hidden rounded-full bg-stone-2 sm:hidden"
                >
                  <span
                    className="block h-full rounded-full bg-primary transition-[width] duration-base"
                    style={{ width: `${item.state.percent}%` }}
                  />
                </span>
              ) : null}
            </span>

            {item.state.status === 'uploading' ? (
              <span
                aria-hidden
                className="hidden h-[5px] w-[210px] shrink-0 overflow-hidden rounded-full bg-stone-2 sm:block"
              >
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-base"
                  style={{ width: `${item.state.percent}%` }}
                />
              </span>
            ) : null}

            {item.state.status === 'done' ? (
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white"
              >
                ✓
              </span>
            ) : null}

            {item.state.status === 'refused' ? (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="h-11 shrink-0 rounded-sm border border-border bg-white px-3 text-[13.5px] font-semibold"
              >
                {t.upload.remove}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {/* The specific reason, once, under the list rather than repeated on every row. */}
      {refused.length > 0 ? (
        <div className="border-t border-border bg-primary/5 px-4 py-3.5">
          {refused.map((item) => {
            const copy = errorCopy((item.state as { code: string }).code);
            return (
              <p key={item.id} className="text-[14px] leading-snug">
                <span className="font-bold">{t.upload.refusedFile(item.name)}</span>{' '}
                <span className="text-muted">{copy.detail || copy.message}</span>
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
