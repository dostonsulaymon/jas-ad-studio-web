import { t } from '@/lib/i18n';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-stone-1">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-10 sm:px-14">
        <p className="text-[15px] font-bold">
          JAS <span className="text-primary">Ad Studio</span>
        </p>
        <p className="text-[14px] text-muted">{t.footer.madeFor}</p>
        {/* The rule, stated plainly where it cannot be missed. */}
        <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">
          {t.footer.notVideo}
        </p>
      </div>
    </footer>
  );
}
