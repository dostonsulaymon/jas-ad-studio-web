import type { Metadata } from 'next';
import { Caveat, Inter } from 'next/font/google';
import './globals.css';

/**
 * Inter, not Manrope (W-001).
 *
 * Manrope has no glyph at U+02BB or U+02BC, the two characters standard Uzbek Latin
 * uses for `oʻ`, `gʻ` and the tutuq belgisi, and the API already emits U+02BB 657 times
 * across the Uzbek shot plans. Source 01 §5 permits "Manrope or a suitable equivalent
 * supporting Uzbek characters"; Inter is that equivalent.
 *
 * Both Latin subsets are requested because Google Fonts has moved U+02BB between
 * `latin` and `latin-ext` before. Asking for both means the glyph is present whichever
 * side of that line it currently sits on.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * The hand-drawn annotation device from the artboards. Used for exactly one note per
 * screen, never for interface text: it marks up the page the way someone would with a
 * pen, and a second use would turn a device into decoration.
 */
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JAS Ad Studio',
  description:
    'Mahsulot rasmini yuklang. Reklama ssenariysi va Google Flow uchun tayyor prompt oling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // uz-Latn is the only locale at launch (D-014).
  return (
    <html lang="uz-Latn" className={`${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
