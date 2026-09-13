'use client';

import { useId } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { t } from '@/lib/i18n';

/** Label above, help and error below, tied to the control by id and aria-describedby. Never placeholder-as-label. */
export function Field({
  label,
  help,
  error,
  counter,
  optional,
  className = '',
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  counter?: string;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-[14px] font-semibold">
        {label}
        {optional ? <span className="font-normal text-muted">({t.common.optional})</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {help || error || counter ? (
        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {help ? (
              <p id={`${id}-help`} className="text-[13.5px] leading-snug text-muted">
                {help}
              </p>
            ) : null}
            {error ? (
              <p id={`${id}-error`} className="mt-1 text-[13.5px] font-medium text-danger">
                {error}
              </p>
            ) : null}
          </div>
          {counter ? <span className="shrink-0 text-[12.5px] text-muted tabular-nums">{counter}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

const CONTROL =
  'w-full rounded-input border bg-raised text-[16px] text-ink placeholder:text-muted transition-colors duration-150 hover:border-line-strong';

export function TextInput({ invalid, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} h-13 px-4 ${invalid ? 'border-danger' : 'border-line'} ${className}`}
    />
  );
}

export function TextArea({ invalid, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} min-h-[120px] resize-y px-4 py-3.5 leading-relaxed ${invalid ? 'border-danger' : 'border-line'} ${className}`}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${CONTROL} h-13 appearance-none border-line pr-11 pl-4`}>
        {children}
      </select>
      <CaretDown size={16} aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

/** A real radio inside a 12px card: arrow keys, group and state announcements come for free. */
export function OptionCard({
  name,
  value,
  checked,
  onChange,
  label,
  line,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  line?: string;
}) {
  return (
    <label
      className={`flex min-h-[72px] items-start gap-3 rounded-input border p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
        checked ? 'border-ink bg-raised-2' : 'border-line bg-raised hover:border-line-strong'
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${checked ? 'border-ink bg-ink' : 'border-line-strong'}`}
      >
        {checked ? <span className="size-2 rounded-full bg-bg" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold">{label}</span>
        {line ? <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{line}</span> : null}
      </span>
    </label>
  );
}

/** A radio styled as a pill chip, for short option lists (platform, aspect ratio). */
export function ChoiceChip({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
        checked ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:border-line-strong hover:text-ink'
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
