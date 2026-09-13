import { api, ApiError, isAbort, isApiError } from './api/client.ts';
import type { AcceptedGeneration, AdPackage, GenerationDetail, JobStatus } from './api/types.ts';

export const TERMINAL: readonly JobStatus[] = ['ready', 'needs_input', 'refused', 'failed'];

export function isTerminal(status: JobStatus): boolean {
  return TERMINAL.includes(status);
}

/** Ready generations with a package, oldest first, so "Versiya 1" is always the first one made. */
export function readyVersions(list: readonly GenerationDetail[]): GenerationDetail[] {
  return list
    .filter((g) => g.status === 'ready' && g.package)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * One key per attempt. A retry of the same attempt reuses it (the API returns the same job and
 * charges once); only a finished attempt lets the next press take a fresh key.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function pollDelayMs(attempt: number): number {
  if (attempt < 3) return 1_000;
  if (attempt < 8) return 2_000;
  return 3_000;
}

export const MAX_POLLS = 70;

export function startGeneration(projectId: string, idempotencyKey: string, signal?: AbortSignal) {
  return api.post<AcceptedGeneration>(`/api/projects/${projectId}/generations`, { idempotencyKey, signal });
}

export function listGenerations(projectId: string, signal?: AbortSignal) {
  return api.get<GenerationDetail[]>(`/api/projects/${projectId}/generations`, { signal });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Poll with backoff until the job is final. A single failed poll is not a failed generation (the
 * job is safe server-side), so only a run of five failures, a 401 or a 404 gives up.
 */
export async function pollUntilDone(
  id: string,
  handlers: { onStatus?: (s: JobStatus) => void; signal?: AbortSignal; wait?: (ms: number) => Promise<void> } = {},
): Promise<GenerationDetail> {
  const wait = handlers.wait ?? sleep;
  let failures = 0;

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    handlers.signal?.throwIfAborted();
    try {
      const detail = await api.get<GenerationDetail>(`/api/generations/${id}`, { signal: handlers.signal });
      failures = 0;
      handlers.onStatus?.(detail.status);
      if (isTerminal(detail.status)) return detail;
    } catch (error) {
      if (isAbort(error)) throw error;
      if (isApiError(error) && (error.status === 404 || error.status === 401)) throw error;
      failures += 1;
      if (failures >= 5) throw error;
    }
    await wait(pollDelayMs(attempt));
  }
  throw new ApiError({ code: 'GENERATION_STILL_RUNNING', status: 0 });
}

export function formatSeconds(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** The TXT export: Uzbek labels for the seller, the English prompt verbatim for Flow. */
export function toPlainText(
  pkg: AdPackage,
  labels: { concept: string; hook: string; cta: string; shots: string; camera: string; prompt: string; footer: string },
): string {
  const lines: string[] = [];
  const { result } = pkg;
  if (result.concept) {
    lines.push(`${labels.concept}: ${result.concept.titleUz}`, '', result.concept.rationaleUz, '');
    lines.push(`${labels.hook}: ${result.concept.hookUz}`, `${labels.cta}: ${result.concept.ctaUz}`, '');
  }
  if (result.shots.length > 0) {
    lines.push(`${labels.shots}:`, '');
    for (const shot of result.shots) {
      lines.push(`${formatSeconds(shot.startSeconds)}-${formatSeconds(shot.endSeconds)}s`, `  ${shot.descriptionUz}`, `  ${labels.camera}: ${shot.cameraUz}`, '');
    }
  }
  lines.push(`${labels.prompt}:`, '', pkg.promptEn, '', labels.footer);
  return lines.join('\n');
}

export function exportFilename(productName: string, createdAt: string): string {
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return `${slug || 'jas-prompt'}-${createdAt.slice(0, 10)}.txt`;
}

/** Clipboard with an expected failure path: in-app browsers often have no Clipboard API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const FLOW_URL = 'https://labs.google/flow';
