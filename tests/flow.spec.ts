import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The full seller flow, which the P5 exit check names and which nothing covered before.
 *
 * Every API response is stubbed. That is a deliberate choice, not a shortcut: the gated
 * path needs a signed-in seller holding a credit, and the only ways to get one are to
 * drive a real Google sign-in from CI or to forge a session row. The api repo is
 * explicit that forging one makes the evidence prove nothing, so this asserts what the
 * UI does with each response shape instead, and the real path stays a manual walk.
 *
 * The shapes below are copied from the live run on 2026-09-12, not invented.
 */

const ME = { id: 'u-1', email: 'sotuvchi@example.uz', role: 'seller' };
const PROJECT = {
  id: 'p-1',
  name: 'Pixel 9a, 128 GB',
  formatId: 'product-film',
  durationSeconds: 10,
  aspectRatio: '9:16',
  createdAt: '2026-09-12T10:42:33.741Z',
};
const ASSET = { id: 'a-1', projectId: 'p-1', width: 1365, height: 2048, bytes: 115415, isPrimary: true };

const PACKAGE = {
  promptEn: 'Product reference and source of truth\nUse the supplied reference image as the only visual source of truth.',
  createdAt: '2026-09-12T18:20:00.000Z',
  result: {
    concept: {
      titleUz: 'Uch rangdagi sokin Pixel vitrini',
      rationaleUz: 'Maqsad awareness boʻlgani uchun eng kuchli vizual dalil uch rang.',
      hookUz: 'Uch rang, bir xil toza Pixel koʻrinishi.',
      ctaUz: 'Rangini tanlang va batafsil maʼlumot oling.',
    },
    shots: [
      { startSeconds: 0, endSeconds: 3, descriptionUz: 'Yogʻoch sirt ustida uch telefon.', cameraUz: 'Sekin push-in.' },
      { startSeconds: 3, endSeconds: 10, descriptionUz: 'Hero kompozitsiya.', cameraUz: 'Statik framing.' },
    ],
    product: { fidelityConstraints: ['Faqat referensda koʻringan orqa panel saqlansin.'] },
  },
};

/** The full GenerationDetailDto shape, so the stub matches the contract's required set. */
const DETAIL = {
  id: 'g-1',
  projectId: 'p-1',
  status: 'queued' as const,
  questionsUz: [] as string[],
  messageUz: null,
  errorCode: null,
  createdAt: '2026-09-12T18:19:00.000Z',
  finishedAt: null,
  package: null as typeof PACKAGE | null,
};

const photo = readFileSync(join(process.cwd(), 'public/namunalar/phones.jpg'));

/** Signs the browser in and serves the studio's reads. */
async function asSeller(page: Page, opts: { credits?: number; generation?: 'ready' | 'slow' } = {}) {
  const credits = opts.credits ?? 1;

  await page.route('**/api/me', (r) => r.fulfill({ json: ME }));
  await page.route('**/api/credits/balance', (r) =>
    r.fulfill({ json: { available: credits, reserved: 0 } }),
  );
  await page.route('**/api/packs', (r) => r.fulfill({ json: [] }));
  await page.route('**/api/orders', (r) => r.fulfill({ json: [] }));
  await page.route('**/api/settings/public', (r) =>
    r.fulfill({ json: { paymentInstructions: {}, supportContacts: {} } }),
  );
  await page.route('**/api/projects', (r) =>
    r.request().method() === 'POST'
      ? r.fulfill({ status: 201, json: PROJECT })
      : r.fulfill({ json: [PROJECT] }),
  );
  // The save happens before the generate (D-085), so the PATCH has to be served too.
  // Without this it falls through to the real server and 401s, and the generation
  // never starts — which is exactly how this was failing.
  await page.route('**/api/projects/*', (r) =>
    r.request().method() === 'DELETE'
      ? r.fulfill({ status: 204, body: '' })
      : r.fulfill({ json: PROJECT }),
  );
  await page.route('**/api/projects/*/assets', (r) =>
    r.request().method() === 'POST' ? r.fulfill({ status: 201, json: ASSET }) : r.fulfill({ json: [ASSET] }),
  );
  await page.route('**/api/assets/*/reference', (r) =>
    r.fulfill({ body: photo, contentType: 'image/jpeg' }),
  );
  // AcceptedGenerationDto names it `generationId`, not `id`. The first version of this
  // stub used `id`, and the client dutifully polled /api/generations/undefined.
  await page.route('**/api/projects/*/generations', (r) =>
    r.fulfill({
      status: 202,
      json: { generationId: 'g-1', status: 'queued', fromCache: false, questionsUz: [] },
    }),
  );

  let polls = 0;
  await page.route('**/api/generations/g-1', (r) => {
    polls += 1;
    // One queued poll first, so the waiting state is genuinely rendered and asserted
    // rather than skipped by an instantly-ready stub.
    if (opts.generation === 'slow' && polls < 2) {
      return r.fulfill({ json: { ...DETAIL, status: 'running', package: null } });
    }
    return r.fulfill({ json: { ...DETAIL, status: 'ready', package: PACKAGE } });
  });
}

async function uploadPhoto(page: Page) {
  await page.locator('#studiya-boshlash input[type=file]').first().setInputFiles({
    name: 'pixel-9a-uchta.jpg',
    mimeType: 'image/jpeg',
    buffer: photo,
  });
  // Wait on the thumbnail itself. A text match on the photo count picks up the mobile
  // sticky strip too, which is present but hidden at desktop width.
  await expect(page.locator('#studiya-boshlash img:visible').first()).toBeVisible();
}

async function reachReview(page: Page) {
  await page.getByRole('button', { name: 'Davom etish' }).first().click();
  await page.getByRole('button', { name: 'Davom etish' }).first().click();
  await expect(page.getByRole('heading', { name: 'Hammasini tekshiring' })).toBeVisible();
}

async function fillStepOne(page: Page) {
  await page.locator('#studiya-boshlash').scrollIntoViewIfNeeded();
  await page.getByLabel('Mahsulot nomi').fill('Pixel 9a, 128 GB');
  await page.getByLabel('Qisqa tavsif').fill("Uch rangda: siyoh ko'k, marjon va oq.");
  await page.getByLabel('Qisqa tavsif').blur();
}

test('a seller goes from an empty studio to a prompt on the clipboard', async ({ page }) => {
  await asSeller(page, { generation: 'slow' });
  await page.goto('/');

  await fillStepOne(page);

  // Typed with the ASCII apostrophe a phone keyboard produces; stored as the letter.
  await expect(page.getByLabel('Qisqa tavsif')).toHaveValue(/koʻk/);

  await uploadPhoto(page);

  await page.getByRole('button', { name: 'Davom etish' }).first().click();
  await page.getByRole('radio', { name: /Tabiiy UGC/ }).check();
  await page.getByRole('button', { name: 'Davom etish' }).first().click();

  await expect(page.getByRole('heading', { name: 'Hammasini tekshiring' })).toBeVisible();
  await page.getByRole('button', { name: 'Prompt tayyorlash' }).click();

  // The waiting state must actually appear: pressing the button and seeing nothing is
  // the failure this test exists to catch.
  await expect(page.getByRole('status').filter({ hasText: /Tayyorlanmoqda|Navbatda/ })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Uch rangdagi sokin Pixel vitrini')).toBeVisible();
  await expect(page.getByText(/Yogʻoch sirt ustida uch telefon/)).toBeVisible();
});

test('only the prompt reaches the clipboard, never the concept or the shot plan', async ({
  page,
  context,
}) => {
  // Source 01 §48. A seller pasting into Flow must get exactly what Flow should read.
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await asSeller(page);
  await page.goto('/');
  await fillStepOne(page);
  await uploadPhoto(page);
  await reachReview(page);
  await page.getByRole('button', { name: 'Prompt tayyorlash' }).click();
  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Nusxalash', exact: false }).first().click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());

  expect(clip).toBe(PACKAGE.promptEn);
  expect(clip).not.toContain(PACKAGE.result.concept.titleUz);
  expect(clip).not.toContain(PACKAGE.result.shots[0].descriptionUz);
});

test('the prompt block is selectable and never truncated', async ({ page }) => {
  // When the Clipboard API is missing, which is normal in in-app browsers, this block
  // is the copy mechanism. An ellipsis here would silently corrupt what Flow receives.
  await asSeller(page);
  await page.goto('/');
  await fillStepOne(page);
  await uploadPhoto(page);
  await reachReview(page);
  await page.getByRole('button', { name: 'Prompt tayyorlash' }).click();
  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible({ timeout: 15_000 });

  const block = page.locator('pre').first();
  await expect(block).toHaveText(PACKAGE.promptEn);
  const style = await block.evaluate((el) => getComputedStyle(el));
  expect(style.textOverflow).not.toBe('ellipsis');
  expect(style.userSelect === 'all' || style.webkitUserSelect === 'all').toBe(true);
});

test('the app never claims to make the video itself', async ({ page }) => {
  await asSeller(page);
  await page.goto('/');
  const body = (await page.locator('body').innerText()).toLowerCase();

  // The rule is about claims, not the word: the FAQ asks "JAS Ad Studio videoni oʻzi
  // tayyorlaydimi?" precisely so it can answer no. What must never appear is a first
  // person claim to produce video, or a call to action that offers one.
  for (const claim of [
    'video tayyorlaymiz',
    'videolar tayyorlaymiz',
    'video yaratamiz',
    'videongizni tayyorlaymiz',
    'video tayyorlash',
  ]) {
    expect(body, `the page claims "${claim}"`).not.toContain(claim);
  }

  // And the main action is about the prompt, never the video.
  await expect(page.getByRole('link', { name: 'Reklama promptini tayyorlash' })).toBeVisible();
});

test('a seller with no credits is told, and offered the way to fix it', async ({ page }) => {
  await asSeller(page, { credits: 0 });
  await page.goto('/');
  // The balance is a control, not a dead badge: seeing zero must lead somewhere.
  const balance = page.getByRole('button', { name: /Prompt limiti/ });
  await expect(balance).toBeVisible();
  await balance.click();
  await expect(page.getByRole('dialog', { name: 'Prompt limiti' })).toBeVisible();
  // Nothing is priced yet, so the drawer says so instead of showing an empty grid.
  await expect(page.getByText('Paketlar hali sozlanmagan.')).toBeVisible();
});
