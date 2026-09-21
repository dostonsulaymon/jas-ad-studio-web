'use client';

import { WarningCircle } from '@phosphor-icons/react';
import { button } from './button';
import { fieldIssues, isApiError } from '@/lib/api/client';
import { errorCopy, t } from '@/lib/i18n';
import { useSession } from '../session';

/**
 * The one error component: what happened, what to do, and the request id for the logs. The action
 * is real wherever it can be: sign in again, open the credits drawer, reload, or the caller's retry.
 */
export function ErrorNotice({
  error,
  onRetry,
  fieldLabel,
  className = '',
}: {
  error: unknown;
  onRetry?: () => void;
  /** Names the refused fields in Uzbek. Without it the list stays hidden: the API's own messages are English. */
  fieldLabel?: (path: string) => string | undefined;
  className?: string;
}) {
  const session = useSession();
  if (!error) return null;

  const code = isApiError(error) ? error.code : 'INTERNAL_ERROR';
  const named = fieldLabel ? fieldIssues(error).flatMap((issue) => fieldLabel(issue.path) ?? []) : [];
  const requestId = isApiError(error) ? error.requestId : undefined;
  const copy = errorCopy(code);
  const actionClass = button({ variant: 'outline', size: 'sm' });

  let action: React.ReactNode;
  if (code === 'SESSION_EXPIRED' || code === 'OAUTH_STATE_INVALID') {
    action = (
      <a href="/api/auth/google" className={actionClass}>
        {copy.action}
      </a>
    );
  } else if (code === 'NO_CREDITS') {
    action = (
      <button type="button" onClick={session.openCredits} className={actionClass}>
        {copy.action}
      </button>
    );
  } else if (code === 'CROSS_ORIGIN_REFUSED') {
    action = (
      <button type="button" onClick={() => window.location.reload()} className={actionClass}>
        {copy.action}
      </button>
    );
  } else if (onRetry) {
    action = (
      <button type="button" onClick={onRetry} className={actionClass}>
        {copy.action}
      </button>
    );
  } else {
    action = <span className="text-[14px] font-medium">{copy.action}</span>;
  }

  return (
    <div role="alert" className={`rounded-input border border-danger/35 bg-danger/[0.06] p-4 ${className}`}>
      <div className="flex gap-3">
        <WarningCircle size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="font-semibold">{copy.message}</p>
          {copy.detail ? <p className="mt-1 text-[14px] text-muted">{copy.detail}</p> : null}
          {named.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-[14px] font-medium">
              {named.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {action}
            {requestId ? <span className="font-mono text-[12px] break-all text-muted select-all">{t.common.requestId(requestId)}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
