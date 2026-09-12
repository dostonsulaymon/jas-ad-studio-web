import { uzLatn, type ErrorKey } from './uz-Latn.ts';
import { messageKeyFor } from '../api/errors.ts';

/**
 * uz-Latn is the only locale at launch (D-014), so there is no locale negotiation and
 * no runtime lookup by string path. The catalogue is imported directly and the compiler
 * checks every key, which is stronger than any `t('some.key')` could be.
 *
 * This file holds only the pieces that genuinely need logic: mapping an API error code
 * to its Uzbek message, and formatting.
 */

export { uzLatn as t } from './uz-Latn.ts';

export interface ErrorCopy {
  /** What went wrong, in one short sentence. */
  message: string;
  /** What the seller can do about it. Never empty (source 01 §47). */
  action: string;
  /** Optional reassurance or specifics, for example which formats are accepted. */
  detail: string;
}

const FALLBACK: ErrorCopy = uzLatn.errors.internal_error;

/**
 * Resolve an API error code to Uzbek copy.
 *
 * Falls back to "Kutilmagan xatolik" with a retry rather than showing the raw code, so
 * a code we have never seen still produces a usable screen instead of a dead end.
 */
export function errorCopy(code: string): ErrorCopy {
  const key = code.toLowerCase() as ErrorKey;
  return uzLatn.errors[key] ?? FALLBACK;
}

/** True when the catalogue has real copy for this code, rather than the fallback. */
export function hasErrorCopy(code: string): boolean {
  return (code.toLowerCase() as ErrorKey) in uzLatn.errors;
}

/** Every messageKey the catalogue can answer, in the API's own `errors.x` form. */
export function knownMessageKeys(): string[] {
  return Object.keys(uzLatn.errors).map((code) => messageKeyFor(code));
}

/**
 * Uzbek month names, written out rather than taken from Intl.
 *
 * Intl.DateTimeFormat('uz-Latn-UZ', { month: 'long' }) produces "M09" on this Node
 * build, because the ICU data it ships has no Uzbek Latin month names. A seller reading
 * "2026 M09 12" would reasonably think the page was broken.
 */
const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
] as const;

/** Formats an ISO timestamp from the API for display: "12-sentabr, 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}
