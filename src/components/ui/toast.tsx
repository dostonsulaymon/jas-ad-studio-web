'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';

type Toast = { id: number; message: string };

const ToastContext = createContext<(message: string) => void>(() => {});

/** Transient confirmations only (saved, sent, deleted). Errors stay inline where they happened. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const push = useCallback((message: string) => {
    const id = next.current++;
    setToasts((list) => [...list.slice(-2), { id, message }]);
    setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className="animate-sheet flex items-center gap-2 rounded-full border border-line bg-raised-2 px-4 py-2.5 text-[14px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
          >
            <CheckCircle size={18} weight="fill" aria-hidden className="text-success" />
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
