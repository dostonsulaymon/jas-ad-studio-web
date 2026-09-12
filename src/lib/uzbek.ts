/**
 * Uzbek Latin writes `oʻ` and `gʻ` with U+02BB MODIFIER LETTER TURNED COMMA, and the
 * tutuq belgisi `ʼ` with U+02BC MODIFIER LETTER APOSTROPHE. Both are letters.
 *
 * This matters more than it looks (W-001). The API already emits U+02BB 657 times and
 * U+02BC 14 times across the Uzbek shot plans, so the app has to render them. Sellers,
 * meanwhile, type whatever their phone keyboard gives them: usually ASCII `'`, sometimes
 * a curly quote their keyboard substituted. Those are quotation marks, not letters, and
 * they break line breaking, double-click word selection and search.
 *
 * So: accept anything on the way in, store the canonical form.
 */

/** U+02BB MODIFIER LETTER TURNED COMMA. The `ʻ` in `oʻ` and `gʻ`. */
export const TURNED_COMMA = 'ʻ';

/** U+02BC MODIFIER LETTER APOSTROPHE. The tutuq belgisi, as in `aʼlo`. */
export const MODIFIER_APOSTROPHE = 'ʼ';

/** Every mark a phone keyboard might produce where an Uzbek letter belongs. */
const LOOKALIKES = "'‘’´`ʹ′";

/**
 * Only `o` and `g` take the turned comma, so the rewrite is anchored to those letters.
 * Anything else keeps its apostrophe: `L'Oreal` is a brand, not a misspelling, and a
 * seller is allowed to type one.
 */
const AFTER_O_OR_G = new RegExp(`([oOgG])[${LOOKALIKES}]`, 'g');

/**
 * Rewrite the apostrophes a seller typed into the canonical Uzbek letters.
 *
 * Runs on every free-text field before it is sent to the API, so what gets stored
 * matches what the API's own Uzbek output uses.
 */
export function normalizeUzbek(input: string): string {
  return input.normalize('NFC').replace(AFTER_O_OR_G, `$1${TURNED_COMMA}`);
}

/**
 * True when the text still contains a lookalike where an Uzbek letter belongs. Used by
 * the tests and by the source-text check, never to block a seller: normalisation is
 * silent and automatic, because correcting someone's typing at them is rude.
 */
export function hasUzbekLookalike(input: string): boolean {
  return new RegExp(`[oOgG][${LOOKALIKES}]`).test(input);
}
