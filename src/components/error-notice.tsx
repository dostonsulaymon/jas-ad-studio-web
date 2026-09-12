'use client';

import { errorCopy } from '@/lib/i18n';
import { isApiError } from '@/lib/api/client';
import { t } from '@/lib/i18n';

/**
 * The one error component. A message, and always an action: source 01 §47 forbids
 * showing only "Something went wrong", so there is no variant of this without a button.
 *
 * `role="alert"` so a screen reader hears it when it appears, rather than the seller
 * discovering it by scrolling.
 */
export function ErrorNotice({
  error,
  onRetry,
  className = '',
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  if (!error) return null;

  const code = isApiError(error) ? error.code : 'INTERNAL_ERROR';
  const requestId = isApiError(error) ? error.requestId : undefined;
  const copy = errorCopy(code);

  return (
    <div
      role="alert"
      className={`rounded-md border border-border bg-primary/5 px-4 py-3.5 ${className}`}
    >
      <p className="text-[15px] font-bold">{copy.message}</p>
      {copy.detail ? <p className="mt-1 text-[14px] text-muted">{copy.detail}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center rounded-sm border border-border bg-white px-4 text-[14.5px] font-semibold"
          >
            {copy.action}
          </button>
        ) : (
          <span className="text-[14.5px] font-semibold text-primary">{copy.action}</span>
        )}

        {/* The request id is how Doston finds this exact failure in the logs. Small,
            selectable, and never the main message. */}
        {requestId ? (
          <span className="font-mono text-[12px] text-muted select-all">
            {t.common.requestId(requestId)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
