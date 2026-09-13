'use client';

import { ToastProvider } from './ui/toast';
import { SessionProvider } from './session';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SessionProvider>{children}</SessionProvider>
    </ToastProvider>
  );
}
