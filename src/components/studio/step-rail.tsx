'use client';

import { Check } from '@phosphor-icons/react';
import { t } from '@/lib/i18n';

type Step = 1 | 2 | 3;

/** Three real buttons; steps past the furthest reached are disabled. On phones only the current step shows its name. */
export function StepRail({ step, reached, onGo, disabled }: { step: Step; reached: Step; onGo: (s: Step) => void; disabled?: boolean }) {
  return (
    <ol className="flex w-full items-center gap-1 rounded-full border border-line p-1 sm:w-fit">
      {t.studio.steps.map((name, index) => {
        const n = (index + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={name} className={active ? 'min-w-0 flex-1 sm:flex-none' : 'shrink-0'}>
            <button
              type="button"
              onClick={() => onGo(n)}
              disabled={disabled || n > reached}
              aria-current={active ? 'step' : undefined}
              className={`flex h-11 w-full items-center gap-2.5 rounded-full pr-4 pl-1.5 text-[14px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${
                active ? 'bg-ink text-bg' : n <= reached ? 'text-ink hover:bg-raised' : 'text-muted/60'
              }`}
            >
              <span
                aria-hidden
                className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${active ? 'bg-bg text-ink' : 'border border-line'}`}
              >
                {done ? <Check size={14} weight="bold" /> : n}
              </span>
              <span className={`truncate ${active ? '' : 'max-sm:sr-only'}`}>{name}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
