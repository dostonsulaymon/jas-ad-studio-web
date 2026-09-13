import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Stubbed API responses for signed-in screens. Google sign-in always returns to the public host, so a
 * real session cannot exist on localhost:3046; these shapes follow the generated contract types and
 * v1's live-captured fixtures (jas-ad-studio-web/tests/flow.spec.ts).
 */

export const photo = readFileSync(join(process.cwd(), 'public/namunalar/phones.jpg'));

export const PROJECT = {
  id: 'p-1',
  name: 'Pixel 9a, 128 GB',
  formatId: 'product-film',
  durationSeconds: 10,
  aspectRatio: '9:16',
  createdAt: '2026-09-12T10:42:33.741Z',
};

export const BRIEF = {
  productName: 'Pixel 9a, 128 GB',
  description: 'Uch rangda: siyoh koʻk, marjon va oq.',
  goal: 'awareness',
  formatId: 'product-film',
  platform: 'instagram',
  aspectRatio: '9:16',
  durationSeconds: 10,
  audience: null,
  offer: null,
  confirmedClaims: [],
  galleryInspirationId: null,
};

export const ASSET = { id: 'a-1', projectId: 'p-1', width: 780, height: 780, bytes: 115415, isPrimary: true };

export const PACKAGE = {
  generationId: 'g-1',
  promptEn: 'Product reference and source of truth\nUse the supplied reference image as the only visual source of truth.',
  createdAt: '2026-09-12T18:20:00.000Z',
  result: {
    status: 'ready',
    concept: {
      titleUz: 'Uch rangdagi sokin Pixel vitrini',
      rationaleUz: 'Maqsad tanishtirish boʻlgani uchun eng kuchli vizual dalil uch rang.',
      hookUz: 'Uch rang, bir xil toza Pixel koʻrinishi.',
      ctaUz: 'Rangini tanlang va batafsil maʼlumot oling.',
      formatId: 'product-film',
    },
    shots: [
      { startSeconds: 0, endSeconds: 3, descriptionUz: 'Yogʻoch sirt ustida uch telefon.', cameraUz: 'Sekin push-in.' },
      { startSeconds: 3, endSeconds: 10, descriptionUz: 'Hero kompozitsiya.', cameraUz: 'Statik framing.' },
    ],
    product: { category: 'elektronika', confirmedClaims: [], fidelityConstraints: ['Faqat referensda koʻringan orqa panel saqlansin.'], observedDetails: [], unknownDetails: [], referenceConflicts: [] },
    target: { aspectRatio: '9:16', durationSeconds: 10, targetId: 'flow' },
    assumptionsUz: [],
    reviewNotesUz: [],
    questionsUz: [],
    messageUz: null,
    promptEn: null,
  },
};

const DETAIL = {
  id: 'g-1',
  projectId: 'p-1',
  status: 'queued',
  questionsUz: [] as string[],
  messageUz: null,
  errorCode: null,
  createdAt: '2026-09-12T18:19:00.000Z',
  finishedAt: null,
  package: null as unknown,
};

export function readyVersion(id: string, createdAt: string, promptEn: string) {
  return { ...DETAIL, id, status: 'ready', createdAt, finishedAt: createdAt, package: { ...PACKAGE, generationId: id, promptEn, createdAt } };
}

export interface StubOptions {
  role?: 'seller' | 'owner';
  credits?: number;
  versions?: ReturnType<typeof readyVersion>[];
  slow?: boolean;
}

export async function signIn(page: Page, opts: StubOptions = {}) {
  const role = opts.role ?? 'seller';
  await page.route('**/api/me', (r) => r.fulfill({ json: { id: 'u-1', email: role === 'owner' ? 'egasi@example.uz' : 'sotuvchi@example.uz', role } }));
  await page.route('**/api/credits/balance', (r) => r.fulfill({ json: { available: opts.credits ?? 3, reserved: 0 } }));
  await page.route('**/api/packs', (r) => r.fulfill({ json: [] }));
  await page.route('**/api/orders', (r) => r.fulfill({ json: [] }));
  await page.route('**/api/projects', (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 201, json: PROJECT }) : r.fulfill({ json: [PROJECT] })));
  await page.route('**/api/projects/*', (r) => {
    const method = r.request().method();
    if (method === 'DELETE') return r.fulfill({ status: 204, body: '' });
    return r.fulfill({ json: method === 'GET' ? { ...PROJECT, brief: BRIEF } : PROJECT });
  });
  await page.route('**/api/projects/*/assets', (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 201, json: ASSET }) : r.fulfill({ json: [ASSET] })));
  await page.route('**/api/assets/*/reference', (r) => r.fulfill({ body: photo, contentType: 'image/jpeg' }));
  await page.route('**/api/projects/*/generations', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill({ json: opts.versions ?? [] })
      : r.fulfill({ status: 202, json: { generationId: 'g-1', status: 'queued', fromCache: false, questionsUz: [] } }),
  );
  let polls = 0;
  await page.route('**/api/generations/g-1', (r) => {
    polls += 1;
    if (opts.slow && polls < 2) return r.fulfill({ json: { ...DETAIL, status: 'running' } });
    return r.fulfill({ json: { ...DETAIL, status: 'ready', finishedAt: '2026-09-12T18:20:00.000Z', package: PACKAGE } });
  });

  if (role === 'owner') {
    await page.route('**/api/owner/orders*', (r) =>
      r.fulfill({
        json: [
          { id: 'o-1', userId: 'u-2', userEmail: 'dilnoza@example.uz', packId: 'pk-1', credits: 10, amountUzs: 49000, paymentMethod: 'card_transfer', payerReference: null, status: 'pending', rejectionReason: null, createdAt: '2026-09-13T08:00:00Z', confirmedAt: null },
        ],
      }),
    );
    await page.route('**/api/owner/orders/*/confirm', (r) => r.fulfill({ json: {} }));
    await page.route('**/api/owner/users', (r) => r.fulfill({ json: [{ id: 'u-2', email: 'dilnoza@example.uz', role: 'seller', available: 0, reserved: 0, createdAt: '2026-09-12T09:00:00Z' }] }));
    await page.route('**/api/owner/generations', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/owner/spend', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/owner/gallery', (r) => r.fulfill({ json: { examples: [] } }));
  }
}

/** Every visible control at least 44 px both ways, no horizontal page overflow, form controls at 16 px or more. */
export async function auditLayout(page: Page) {
  return page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const small = [...document.querySelectorAll<HTMLElement>('a[href],button,input:not([type=hidden]),select,textarea,summary')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || el.closest('.sr-only') || el.classList.contains('sr-only') || el.classList.contains('skip-link')) return false;
        if (getComputedStyle(el).visibility === 'hidden') return false;
        return r.height < 44 || r.width < 44;
      })
      .map((el) => `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 24)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    const smallInputs = [...document.querySelectorAll<HTMLElement>('input,textarea,select')]
      .filter((el) => el.getBoundingClientRect().width > 1 && parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.id || el.getAttribute('name') || el.tagName);
    return { overflow, small, smallInputs };
  });
}
