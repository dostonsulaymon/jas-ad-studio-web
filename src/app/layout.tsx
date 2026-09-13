import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { t } from '@/lib/i18n';

/**
 * Onest, the only face. It draws U+02BB and U+02BC natively; Sora, Manrope and Geist substitute a
 * fallback glyph for `ʻ` (glyph proof in the v2 design spec §2). Both Latin subsets are requested
 * so the modifier letters are present whichever subset Google files them under.
 */
const onest = Onest({ subsets: ['latin', 'latin-ext'], variable: '--font-onest', display: 'swap' });

export const metadata: Metadata = {
  title: 'JAS Ad Studio',
  description: t.hero.sub,
};

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz-Latn" className={onest.variable}>
      <body>
        <a href="#asosiy" className="skip-link">
          {t.nav.skipToContent}
        </a>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
