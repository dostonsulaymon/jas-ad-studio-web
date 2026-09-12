import type { components } from './api/generated/schema.ts';
import { api, ApiError, isApiError } from './api/client.ts';

export type AcceptedGenerationDto = components['schemas']['AcceptedGenerationDto'];
export type GenerationDetailDto = components['schemas']['GenerationDetailDto'];
export type JobStatus = GenerationDetailDto['status'];
export type AdPackage = NonNullable<GenerationDetailDto['package']>;
export type AdResult = AdPackage['result'];
export type Shot = AdResult['shots'][number];

/** The states the API will not move on from by itself. */
export const TERMINAL: readonly JobStatus[] = ['ready', 'needs_input', 'refused', 'failed'];

export function isTerminal(status: JobStatus): boolean {
  return TERMINAL.includes(status);
}

/**
 * One key per attempt, reused on every retry of that attempt.
 *
 * This is the whole double-click guard (source 01 §32): the API returns the same job for
 * a repeated key and charges once, so a fresh key per retry would be the one thing that
 * could produce two charges. It is generated here and held by the caller, never
 * regenerated inside a retry.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Polling backoff, in milliseconds.
 *
 * A real generation took about 60 seconds end to end, so a fixed 1s poll would make ~60
 * requests for one result. This starts responsive — a cached needs_input answers almost
 * at once — and settles to 3s, which costs about 20 requests for a normal run.
 */
export function pollDelayMs(attempt: number): number {
  if (attempt < 3) return 1_000;
  if (attempt < 8) return 2_000;
  return 3_000;
}

/** Give up rather than poll for ever: about three minutes at the delays above. */
export const MAX_POLLS = 70;

export interface StartResult {
  accepted: AcceptedGenerationDto;
  /** True when the §29 cache answered without a model call or a credit. */
  fromCache: boolean;
}

export async function startGeneration(
  projectId: string,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<StartResult> {
  const accepted = await api.post<AcceptedGenerationDto>(
    `/api/projects/${projectId}/generations`,
    { idempotencyKey, signal },
  );
  return { accepted, fromCache: accepted.fromCache };
}

export function readGeneration(id: string, signal?: AbortSignal): Promise<GenerationDetailDto> {
  return api.get<GenerationDetailDto>(`/api/generations/${id}`, { signal });
}

export interface PollHandlers {
  onStatus?: (status: JobStatus) => void;
  signal?: AbortSignal;
  /** Injected in tests so polling does not take real minutes. */
  wait?: (ms: number) => Promise<void>;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls until the job reaches a terminal state.
 *
 * A single failed poll is not a failed generation — the job is safe in Postgres and the
 * next poll will see it — so a network blip is swallowed and only a run of them gives up.
 * That matters because the credit is already spent: reporting failure to a seller whose
 * package is sitting on the server would be the worst possible answer.
 */
export async function pollUntilDone(
  id: string,
  handlers: PollHandlers = {},
): Promise<GenerationDetailDto> {
  const wait = handlers.wait ?? sleep;
  let consecutiveFailures = 0;

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    handlers.signal?.throwIfAborted();

    try {
      const detail = await readGeneration(id, handlers.signal);
      consecutiveFailures = 0;
      handlers.onStatus?.(detail.status);
      if (isTerminal(detail.status)) return detail;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      // A 404 or a 401 will not fix itself; anything else might.
      if (isApiError(error) && (error.status === 404 || error.status === 401)) throw error;
      consecutiveFailures += 1;
      if (consecutiveFailures >= 5) throw error;
    }

    await wait(pollDelayMs(attempt));
  }

  // Out of patience, not out of hope: the job may still finish, and the history drawer
  // will show it. The copy says so rather than claiming the generation failed.
  throw new ApiError({ code: 'GENERATION_STILL_RUNNING', status: 0 });
}

/**
 * The plain-text export (source 01 §48). Uzbek labels, because the seller reads it; the
 * English prompt verbatim, because Flow reads that.
 */
export function toPlainText(
  pkg: AdPackage,
  labels: {
    concept: string;
    hook: string;
    cta: string;
    shots: string;
    prompt: string;
    madeWith: string;
  },
): string {
  const lines: string[] = [];
  const { result } = pkg;

  if (result.concept) {
    lines.push(`${labels.concept}: ${result.concept.titleUz}`, '');
    lines.push(result.concept.rationaleUz, '');
    lines.push(`${labels.hook}: ${result.concept.hookUz}`);
    lines.push(`${labels.cta}: ${result.concept.ctaUz}`, '');
  }

  if (result.shots.length > 0) {
    lines.push(`${labels.shots}:`, '');
    for (const shot of result.shots) {
      lines.push(`${formatSeconds(shot.startSeconds)}–${formatSeconds(shot.endSeconds)}s`);
      lines.push(`  ${shot.descriptionUz}`);
      lines.push(`  ${shot.cameraUz}`, '');
    }
  }

  lines.push(`${labels.prompt}:`, '', pkg.promptEn, '', labels.madeWith);
  return lines.join('\n');
}

/** 6.5 stays 6.5; 4.0 becomes 4. */
export function formatSeconds(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * Copy with a fallback (source 01 §48).
 *
 * The Clipboard API needs a secure context and a user gesture, and it is simply absent
 * in some in-app browsers — which is where a lot of Uzbek sellers actually are, opening
 * a link from Telegram. So a failure here is expected, not exceptional, and the caller
 * shows the text for manual copying rather than an error.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Triggers a .txt download without a server round trip. */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** A filename a seller can find again, with no spaces or Cyrillic to mangle. */
export function exportFilename(productName: string, createdAt: string): string {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const day = createdAt.slice(0, 10);
  return `${slug || 'jas-prompt'}-${day}.txt`;
}

/**
 * D-050: the target is Google Flow itself, and the seller picks the model, the ratio and
 * the length inside it. So the handoff is a link plus the prompt on the clipboard — the
 * app never automates Flow and never touches Google credits.
 */
export const FLOW_URL = 'https://labs.google/flow';
