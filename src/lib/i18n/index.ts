import { uz, type ErrorKey } from './uz.ts';

export { uz as t } from './uz.ts';

export interface ErrorCopy {
  message: string;
  action: string;
  detail: string;
}

/** API error code → Uzbek copy. An unknown code falls back to "Kutilmagan xatolik", never the raw code. */
export function errorCopy(code: string): ErrorCopy {
  return uz.errors[code.toLowerCase() as ErrorKey] ?? uz.errors.internal_error;
}

/** Intl has no Uzbek Latin month names on this ICU build ("M09"), so they are written out. */
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/** 1250000 → "1 250 000 soʻm", with a narrow no-break space so it never wraps mid-number. */
export function formatUzs(value: number): string {
  return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} soʻm`;
}
