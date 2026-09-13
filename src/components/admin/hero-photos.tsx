'use client';

import { useState } from 'react';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { TextInput } from '../ui/field';
import { useToast } from '../ui/toast';
import { PanelHeading, SkeletonRows, StatusPill } from './parts';
import { MediaUpload } from './media-upload';
import { useLoad } from './use-load';
import { api } from '@/lib/api/client';
import type { HeroOverride, PublicSettings } from '@/lib/api/types';
import { resolvePlates } from '@/lib/content';
import { t } from '@/lib/i18n';

export function AdminHeroPhotos() {
  const settings = useLoad<PublicSettings>('/api/settings/public');
  if (settings.error) return <ErrorNotice error={settings.error} onRetry={settings.reload} />;
  if (!settings.data) return <SkeletonRows count={2} height="h-48" />;
  return <HeroEditor initial={settings.data.heroPhotos?.photos ?? []} />;
}

/** Every plate as the landing shows it, each replaceable on its own; the rest stay where they are. */
function HeroEditor({ initial }: { initial: HeroOverride[] }) {
  const toast = useToast();
  const [overrides, setOverrides] = useState<HeroOverride[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const plates = resolvePlates(overrides);
  const missingAlt = overrides.some((o) => !o.altUz.trim());

  const replace = (slot: number, path: string) =>
    setOverrides((list) => [...list.filter((o) => o.slot !== slot), { slot, path, altUz: list.find((o) => o.slot === slot)?.altUz ?? '' }]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch('/api/owner/settings/hero-photos', { json: { photos: [...overrides].sort((a, b) => a.slot - b.slot) } });
      toast(t.admin.hero.saved);
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <PanelHeading title={t.admin.hero.title} sub={t.admin.hero.sub} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plates.map((plate, slot) => {
          const own = overrides.find((o) => o.slot === slot);
          return (
            <li key={slot} className="flex flex-col gap-3 rounded-card border border-line bg-raised p-4">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- owner media through the API proxy */}
                <img src={plate.src} alt={plate.alt} className="size-20 shrink-0 rounded-input bg-bg object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold">{t.admin.hero.slot(slot + 1)}</p>
                  <div className="mt-1.5">
                    <StatusPill tone={own ? 'strong' : 'neutral'}>{own ? t.admin.hero.own : t.admin.hero.standard}</StatusPill>
                  </div>
                </div>
              </div>
              {own ? (
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold">{t.admin.hero.alt}</span>
                  <TextInput
                    value={own.altUz}
                    placeholder={t.admin.hero.altHelp}
                    invalid={!own.altUz.trim()}
                    onChange={(e) => setOverrides((list) => list.map((o) => (o.slot === slot ? { ...o, altUz: e.target.value } : o)))}
                  />
                </label>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-2">
                <MediaUpload accept="image/jpeg,image/webp" label={t.admin.hero.replace} onUploaded={(path) => replace(slot, path)} onError={setError} />
                {own ? (
                  <button type="button" onClick={() => setOverrides((list) => list.filter((o) => o.slot !== slot))} className={button({ variant: 'ghost', size: 'sm' })}>
                    <ArrowCounterClockwise size={16} aria-hidden />
                    {t.admin.hero.revert}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {error ? <ErrorNotice error={error} className="mt-5" /> : null}
      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        <button type="button" disabled={busy || missingAlt} onClick={() => void save()} className={button({ variant: 'solid', size: 'md', className: 'max-sm:w-full' })}>
          {busy ? t.admin.hero.saving : t.admin.hero.save}
        </button>
        <span className="text-[13.5px] text-muted">{missingAlt ? t.admin.hero.altMissing : t.admin.hero.saveHint}</span>
      </div>
    </section>
  );
}
