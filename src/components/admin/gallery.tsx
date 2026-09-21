'use client';

import { useId, useState } from 'react';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { button } from '../ui/button';
import { ErrorNotice } from '../ui/error-notice';
import { Field, Select, TextArea, TextInput } from '../ui/field';
import { Sheet, SheetHeader } from '../ui/sheet';
import { useToast } from '../ui/toast';
import { EmptyPanel, PanelHeading, SkeletonRows, StatusPill } from './parts';
import { MediaUpload } from './media-upload';
import { useLoad } from './use-load';
import { api, fieldIssues } from '@/lib/api/client';
import type { ExampleInput, GalleryCategory, OwnerExample } from '@/lib/api/types';
import { CATEGORY_ORDER, slugify } from '@/lib/gallery';
import { ASPECTS, FORMATS } from '@/lib/brief';
import { t } from '@/lib/i18n';

const SOURCE_TYPES: readonly ExampleInput['sourceType'][] = ['app-prompt', 'studio-made', 'external'];
const media = (path: string) => `/api/gallery/media/${path}`;

/**
 * A new example starts empty and unpublished (R-015). Only what identifies and orders it has a
 * value: the API accepts the rest blank until somebody ticks "saytda koʻrsatish".
 */
function blank(sortOrder: number): ExampleInput {
  return {
    slug: '',
    titleUz: '',
    category: 'kiyim',
    style: 'product-film',
    videoPath: '',
    posterPath: '',
    aspectRatio: '9:16',
    durationSeconds: 0,
    promptEn: '',
    conceptUz: '',
    creativePreset: { environment: '', lighting: '', cameraLanguage: '', pacing: '', mood: '' },
    sourceType: 'app-prompt',
    sourceNote: '',
    flowModel: null,
    flowMode: null,
    isPublished: false,
    sortOrder,
  };
}

/** Uzbek names for the paths the API refuses, so the panel can point at the field, not at a code. */
const FIELD_LABELS: Record<string, string> = {
  titleUz: t.admin.gallery.titleUz,
  slug: t.admin.gallery.slug,
  category: t.admin.gallery.category,
  style: t.admin.gallery.style,
  videoPath: t.admin.gallery.video,
  posterPath: t.admin.gallery.poster,
  aspectRatio: t.admin.gallery.aspectRatio,
  durationSeconds: t.admin.gallery.duration,
  sortOrder: t.admin.gallery.sortOrder,
  promptEn: t.admin.gallery.promptEn,
  conceptUz: t.admin.gallery.conceptUz,
  sourceNote: t.admin.gallery.sourceNote,
  flowModel: t.admin.gallery.flowModel,
  flowMode: t.admin.gallery.flowMode,
  'creativePreset.environment': t.admin.gallery.environment,
  'creativePreset.lighting': t.admin.gallery.lighting,
  'creativePreset.cameraLanguage': t.admin.gallery.cameraLanguage,
  'creativePreset.pacing': t.admin.gallery.pacing,
  'creativePreset.mood': t.admin.gallery.mood,
};

const fieldLabel = (path: string) => FIELD_LABELS[path];

function toInput(example: OwnerExample): ExampleInput {
  const { id: _id, ...input } = example;
  void _id;
  return input;
}

/** New examples go to the end of the list rather than fighting over 0. */
function nextSortOrder(examples: OwnerExample[] | undefined): number {
  return examples && examples.length > 0 ? Math.max(...examples.map((e) => e.sortOrder)) + 1 : 0;
}

export function AdminGallery() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad<{ examples: OwnerExample[] }>('/api/owner/gallery');
  const [editing, setEditing] = useState<{ id: string | null; input: ExampleInput } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const remove = async (example: OwnerExample) => {
    setActionError(null);
    try {
      await api.delete(`/api/owner/gallery/${example.id}`);
      setConfirming(null);
      reload();
    } catch (cause) {
      setActionError(cause);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelHeading title={t.admin.gallery.title} sub={t.admin.gallery.sub} />
        <button type="button" onClick={() => setEditing({ id: null, input: blank(nextSortOrder(data?.examples)) })} className={button({ variant: 'solid', size: 'sm', className: 'max-sm:w-full' })}>
          <Plus size={16} aria-hidden />
          {t.admin.gallery.add}
        </button>
      </div>

      {error ? <ErrorNotice error={error} onRetry={reload} /> : null}
      {actionError ? <ErrorNotice error={actionError} className="mb-4" /> : null}
      {loading ? <SkeletonRows count={3} height="h-28" /> : null}
      {data && data.examples.length === 0 ? <EmptyPanel title={t.admin.gallery.empty} /> : null}

      {data && data.examples.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {[...data.examples]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((example) => (
              <li key={example.id} className="rounded-card border border-line bg-raised p-3 pr-4">
                <div className="flex items-center gap-4">
                  {example.posterPath ? (
                    // eslint-disable-next-line @next/next/no-img-element -- owner media through the API proxy
                    <img src={media(example.posterPath)} alt="" className="h-20 w-12 shrink-0 rounded-[8px] bg-bg object-cover" />
                  ) : (
                    <span aria-hidden className="h-20 w-12 shrink-0 rounded-[8px] bg-bg" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{example.titleUz}</p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      {t.gallery.categories[example.category]} · {t.format[example.style as keyof typeof t.format]?.label ?? example.style} · {example.slug}
                    </p>
                    <div className="mt-2">
                      <StatusPill tone={example.isPublished ? 'success' : 'neutral'}>{example.isPublished ? t.admin.gallery.published : t.admin.gallery.draft}</StatusPill>
                    </div>
                  </div>
                  {confirming !== example.id ? (
                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                      <button type="button" onClick={() => setEditing({ id: example.id, input: toInput(example) })} className={button({ variant: 'outline', size: 'sm', className: 'max-sm:w-11 max-sm:px-0' })}>
                        <PencilSimple size={16} aria-hidden />
                        <span className="max-sm:sr-only">{t.admin.gallery.edit}</span>
                      </button>
                      <button type="button" onClick={() => setConfirming(example.id)} className={button({ variant: 'ghost', size: 'icon' })}>
                        <Trash size={18} aria-hidden />
                        <span className="sr-only">
                          {t.admin.gallery.remove}: {example.titleUz}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
                {confirming === example.id ? (
                  <div className="mt-3 rounded-input border border-line bg-bg p-3">
                    <p className="text-[14px]">{t.admin.gallery.removeConfirm(example.titleUz)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void remove(example)} className={button({ variant: 'danger', size: 'sm' })}>
                        {t.admin.gallery.removeYes}
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className={button({ variant: 'outline', size: 'sm' })}>
                        {t.admin.gallery.cancel}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}

      {editing ? (
        <ExampleSheet
          id={editing.id}
          initial={editing.input}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast(t.admin.gallery.saved);
            reload();
          }}
        />
      ) : null}
    </section>
  );
}

function ExampleSheet({ id, initial, onClose, onSaved }: { id: string | null; initial: ExampleInput; onClose: () => void; onSaved: () => void }) {
  const titleId = useId();
  const [draft, setDraft] = useState<ExampleInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  /** An owner who types their own slug keeps it; otherwise it follows the title. */
  const [slugEdited, setSlugEdited] = useState(id !== null);
  const change = (patch: Partial<ExampleInput>) => setDraft((d) => ({ ...d, ...patch }));
  const preset = (patch: Partial<ExampleInput['creativePreset']>) => setDraft((d) => ({ ...d, creativePreset: { ...d.creativePreset, ...patch } }));

  const refused = new Map(fieldIssues(error).map((issue) => [issue.path, issue.message]));
  const problem = (path: string) => (refused.has(path) ? t.admin.gallery.fieldRequired : undefined);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (id) await api.patch(`/api/owner/gallery/${id}`, { json: draft });
      else await api.post('/api/owner/gallery', { json: draft });
      onSaved();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };

  const text = (key: 'titleUz' | 'slug' | 'sourceNote', label: string, help?: string) => (
    <Field label={label} help={help} error={problem(key)}>
      {({ id: fieldId, describedBy, invalid }) => (
        <TextInput
          id={fieldId}
          aria-describedby={describedBy}
          invalid={invalid}
          value={draft[key]}
          onChange={(e) => {
            if (key === 'slug') setSlugEdited(true);
            change(
              key === 'titleUz' && !slugEdited
                ? { titleUz: e.target.value, slug: slugify(e.target.value) }
                : { [key]: e.target.value },
            );
          }}
        />
      )}
    </Field>
  );

  return (
    <Sheet open onClose={onClose} titleId={titleId} width="sm:max-w-[720px]">
      <SheetHeader titleId={titleId} title={id ? t.admin.gallery.editTitle : t.admin.gallery.newTitle} onClose={onClose} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-6">
          {text('titleUz', t.admin.gallery.titleUz)}
          {text('slug', t.admin.gallery.slug, t.admin.gallery.slugHelp)}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.admin.gallery.category}>
              {({ id: fieldId }) => (
                <Select id={fieldId} value={draft.category} onChange={(e) => change({ category: e.target.value as GalleryCategory })}>
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {t.gallery.categories[c]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t.admin.gallery.style}>
              {({ id: fieldId }) => (
                <Select id={fieldId} value={draft.style} onChange={(e) => change({ style: e.target.value })}>
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {t.format[f].label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t.admin.gallery.aspectRatio}>
              {({ id: fieldId }) => (
                <Select id={fieldId} value={draft.aspectRatio} onChange={(e) => change({ aspectRatio: e.target.value as ExampleInput['aspectRatio'] })}>
                  {ASPECTS.map((a) => (
                    <option key={a} value={a}>
                      {a} {t.aspect[a]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t.admin.gallery.duration} error={problem('durationSeconds')}>
              {({ id: fieldId, invalid }) => (
                <TextInput id={fieldId} type="number" min={0} invalid={invalid} value={draft.durationSeconds} onChange={(e) => change({ durationSeconds: Number(e.target.value) })} />
              )}
            </Field>
            <Field label={t.admin.gallery.sortOrder}>
              {({ id: fieldId }) => <TextInput id={fieldId} type="number" value={draft.sortOrder} onChange={(e) => change({ sortOrder: Number(e.target.value) })} />}
            </Field>
            <Field label={t.admin.gallery.sourceType}>
              {({ id: fieldId }) => (
                <Select id={fieldId} value={draft.sourceType} onChange={(e) => change({ sourceType: e.target.value as ExampleInput['sourceType'] })}>
                  {SOURCE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {t.admin.gallery.sourceTypes[s]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <section aria-labelledby={`${titleId}-publish`} className="rounded-card border border-line p-5">
            <h3 id={`${titleId}-publish`} className="font-semibold">
              {t.admin.gallery.publishSection}
            </h3>
            <p className="mt-1 mb-5 text-[13.5px] leading-snug text-muted">{t.admin.gallery.publishSectionHelp}</p>

            <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`rounded-input border bg-bg p-4 ${problem('posterPath') ? 'border-danger' : 'border-line'}`}>
              <p className="text-[14px] font-semibold">{t.admin.gallery.poster}</p>
              {draft.posterPath ? (
                // eslint-disable-next-line @next/next/no-img-element -- owner media through the API proxy
                <img src={media(draft.posterPath)} alt="" className="mt-3 h-40 w-auto rounded-[8px] object-cover" />
              ) : (
                <p className="mt-2 text-[13px] text-muted">{t.admin.gallery.noFile}</p>
              )}
              <div className="mt-3">
                <MediaUpload accept="image/jpeg,image/webp" label={draft.posterPath ? t.admin.gallery.replace : t.admin.gallery.upload} onUploaded={(path) => change({ posterPath: path })} onError={setError} />
              </div>
            </div>
            <div className={`rounded-input border bg-bg p-4 ${problem('videoPath') ? 'border-danger' : 'border-line'}`}>
              <p className="text-[14px] font-semibold">{t.admin.gallery.video}</p>
              <p className="mt-2 font-mono text-[12.5px] break-all text-muted">{draft.videoPath || t.admin.gallery.noFile}</p>
              <div className="mt-3">
                <MediaUpload
                  accept="video/mp4,video/webm"
                  label={draft.videoPath ? t.admin.gallery.replace : t.admin.gallery.upload}
                  onUploaded={(path) => change({ videoPath: path })}
                  onMeta={(meta) => change({ durationSeconds: meta.durationSeconds, ...(meta.aspectRatio ? { aspectRatio: meta.aspectRatio } : {}) })}
                  onError={setError}
                />
              </div>
            </div>
          </div>

          <Field label={t.admin.gallery.conceptUz} error={problem('conceptUz')}>
            {({ id: fieldId, invalid }) => <TextArea id={fieldId} rows={3} invalid={invalid} value={draft.conceptUz} onChange={(e) => change({ conceptUz: e.target.value })} />}
          </Field>
          <Field label={t.admin.gallery.promptEn} error={problem('promptEn')}>
            {({ id: fieldId, invalid }) => (
              <TextArea id={fieldId} rows={8} invalid={invalid} value={draft.promptEn} onChange={(e) => change({ promptEn: e.target.value })} className="font-mono !text-[14px]" />
            )}
          </Field>

          <fieldset className="rounded-card border border-line p-5">
            <legend className="px-1 font-semibold">{t.admin.gallery.preset}</legend>
            <p className="mb-4 text-[13.5px] text-muted">{t.admin.gallery.presetHelp}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['environment', t.admin.gallery.environment],
                  ['lighting', t.admin.gallery.lighting],
                  ['cameraLanguage', t.admin.gallery.cameraLanguage],
                  ['pacing', t.admin.gallery.pacing],
                  ['mood', t.admin.gallery.mood],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label} error={problem(`creativePreset.${key}`)}>
                  {({ id: fieldId, invalid }) => (
                    <TextInput id={fieldId} invalid={invalid} value={draft.creativePreset[key]} onChange={(e) => preset({ [key]: e.target.value })} />
                  )}
                </Field>
              ))}
            </div>
          </fieldset>

          {text('sourceNote', t.admin.gallery.sourceNote, t.admin.gallery.sourceNoteHelp)}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.admin.gallery.flowModel} help={t.admin.gallery.flowHelp} error={problem('flowModel')}>
              {({ id: fieldId, describedBy, invalid }) => (
                <TextInput id={fieldId} aria-describedby={describedBy} invalid={invalid} value={draft.flowModel ?? ''} onChange={(e) => change({ flowModel: e.target.value || null })} />
              )}
            </Field>
            <Field label={t.admin.gallery.flowMode} error={problem('flowMode')}>
              {({ id: fieldId, invalid }) => (
                <TextInput id={fieldId} invalid={invalid} value={draft.flowMode ?? ''} onChange={(e) => change({ flowMode: e.target.value || null })} />
              )}
            </Field>
          </div>
            </div>
          </section>

          <label className="flex min-h-11 items-start gap-3">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => change({ isPublished: e.target.checked })} className="mt-1 size-5 accent-[#fafafa]" />
            <span>
              <span className="block font-semibold">{t.admin.gallery.publishedLabel}</span>
              <span className="block text-[13.5px] text-muted">{t.admin.gallery.publishedHelp}</span>
            </span>
          </label>

          {error ? <ErrorNotice error={error} fieldLabel={fieldLabel} /> : null}
        </div>
      </div>
      <div className="flex gap-2 border-t border-line px-5 py-4 sm:px-7">
        <button type="button" disabled={busy} onClick={() => void submit()} className={button({ variant: 'solid', size: 'md', className: 'flex-1 sm:flex-none' })}>
          {busy ? t.admin.gallery.saving : t.admin.gallery.save}
        </button>
        <button type="button" onClick={onClose} className={button({ variant: 'outline', size: 'md' })}>
          {t.admin.gallery.cancel}
        </button>
      </div>
    </Sheet>
  );
}
