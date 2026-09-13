/**
 * Uzbek Latin writes `oʻ`/`gʻ` with U+02BB and the tutuq belgisi with U+02BC. Both are letters.
 * Sellers type whatever their keyboard gives (usually `'`), so free text is normalised on the way out.
 */

export const TURNED_COMMA = 'ʻ';
export const MODIFIER_APOSTROPHE = 'ʼ';

const LOOKALIKES = "'‘’´`ʹ′";
const AFTER_O_OR_G = new RegExp(`([oOgG])[${LOOKALIKES}]`, 'g');

export function normalizeUzbek(input: string): string {
  return input.normalize('NFC').replace(AFTER_O_OR_G, `$1${TURNED_COMMA}`);
}

/** Loose form for search: case-folded, with every apostrophe-like mark removed. */
export function foldForSearch(input: string): string {
  return input.normalize('NFC').toLowerCase().replace(/[ʻʼ'‘’´`ʹ′]/g, '');
}
