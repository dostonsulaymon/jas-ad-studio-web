'use client';

/** Shared admin building blocks, so every tab reads the same. */

export function PanelHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[clamp(24px,2.4vw,30px)] leading-tight font-extrabold tracking-[-0.03em]">{title}</h2>
      {sub ? <p className="mt-1.5 max-w-[64ch] text-[15px] leading-relaxed text-muted">{sub}</p> : null}
    </div>
  );
}

export function SkeletonRows({ count = 3, height = 'h-24' }: { count?: number; height?: string }) {
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${height} animate-pulse rounded-card bg-raised`} />
      ))}
    </ul>
  );
}

export function EmptyPanel({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {body ? <p className="mt-1 text-[14px] text-muted">{body}</p> : null}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: 'neutral' | 'strong' | 'success' | 'danger'; children: React.ReactNode }) {
  const tones = {
    neutral: 'border-line text-muted',
    strong: 'border-line-strong text-ink',
    success: 'border-success/40 text-success',
    danger: 'border-danger/40 text-danger',
  };
  return <span className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-[12.5px] font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}
