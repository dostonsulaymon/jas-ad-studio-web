'use client';

import { useId } from 'react';

/**
 * Label above the input, helper below it, error below that. Never placeholder-as-label.
 * Every control is tied to its label by id, and the error is tied to the control by
 * aria-describedby so a screen reader reads the problem with the field, not beside it.
 */

interface FieldProps {
  label: string;
  help?: string;
  error?: string;
  counter?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode;
}

export function Field({ label, help, error, counter, children }: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className="mb-6">
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-bold">
        {label}
      </label>

      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}

      <div className="mt-1.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {help ? (
            <p id={helpId} className="text-[13.5px] leading-snug text-muted">
              {help}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="mt-1 text-[13.5px] font-semibold text-primary">
              {error}
            </p>
          ) : null}
        </div>
        {counter ? (
          <span className="shrink-0 text-[12.5px] tabular-nums text-muted">{counter}</span>
        ) : null}
      </div>
    </div>
  );
}

const CONTROL =
  'w-full rounded-sm border bg-white px-3.5 text-ink transition-colors duration-fast ' +
  'placeholder:text-[#8a948f] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20';

export function TextInput({
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} h-[52px] ${invalid ? 'border-primary' : 'border-border'}`}
    />
  );
}

export function TextArea({
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`${CONTROL} min-h-[104px] resize-y py-3.5 leading-relaxed ${invalid ? 'border-primary' : 'border-border'}`}
    />
  );
}

/**
 * A real fieldset with real radios. A div with click handlers would lose arrow-key
 * navigation, the group announcement, and the selected-state announcement, all of
 * which come free here.
 */
export function RadioGroup<T extends string>({
  legend,
  help,
  name,
  value,
  options,
  onChange,
  columns = 2,
}: {
  legend: string;
  help?: string;
  name: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; line?: string }>;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="mb-6 border-0 p-0">
      <legend className="mb-1.5 text-[14px] font-bold">{legend}</legend>
      {help ? <p className="mb-2.5 text-[13.5px] leading-snug text-muted">{help}</p> : null}

      <div className={`grid gap-2.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-sm border px-3.5 py-3 transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                checked ? 'border-primary bg-primary/5' : 'border-border bg-white'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-[18px] shrink-0 accent-[var(--color-primary)]"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold">{option.label}</span>
                {option.line ? (
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">
                    {option.line}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
