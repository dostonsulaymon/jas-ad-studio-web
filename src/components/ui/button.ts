/**
 * Button classes, usable on <button>, <a> and <Link> alike, from server or client components.
 *
 * primary: the white→pale-blue gradient pill, for the one main action of a screen, nothing else.
 * solid: white pill. outline: transparent with a line. ghost: muted text. danger: destructive.
 */
export type ButtonVariant = 'primary' | 'solid' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE =
  'inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ' +
  'transition-[background-color,border-color,color,transform,filter] duration-150 ease-[var(--ease-soft)] ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40';

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-11 px-4 text-[14px]',
  md: 'h-12 px-5 text-[15px]',
  lg: 'h-14 px-7 text-[16px]',
  icon: 'size-11',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'cta-gradient text-[#09090b] hover:brightness-[1.04]',
  solid: 'bg-ink text-bg hover:bg-[#e6e6e6]',
  outline: 'border border-line text-ink hover:border-line-strong hover:bg-raised',
  ghost: 'text-muted hover:bg-raised hover:text-ink',
  danger: 'border border-line text-danger hover:border-danger/60 hover:bg-danger/[0.06]',
};

export function button({
  variant = 'solid',
  size = 'md',
  full = false,
  className = '',
}: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string } = {}): string {
  return [BASE, SIZES[size], VARIANTS[variant], full ? 'w-full' : '', className].filter(Boolean).join(' ');
}
