import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JAS Ad Studio',
  description:
    'Mahsulot rasmini yuklang, reklama ssenariysi va Google Flow uchun tayyor prompt oling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // uz-Latn is the only locale at launch (D-014). Task 2 adds the font and the skip link.
  return (
    <html lang="uz-Latn">
      <body>{children}</body>
    </html>
  );
}
