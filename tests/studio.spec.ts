import { expect, test, type Page } from '@playwright/test';
import { PACKAGE, photo, readyVersion, signIn } from './fixtures';

async function fillProduct(page: Page) {
  await page.getByLabel('Mahsulot nomi').fill('Pixel 9a, 128 GB');
  await page.getByLabel('Qisqa tavsif').fill("Uch rangda: siyoh ko'k, marjon va oq.");
  await page.getByLabel('Qisqa tavsif').blur();
}

async function uploadPhoto(page: Page) {
  await page.locator('input[type=file]').setInputFiles({ name: 'pixel.jpg', mimeType: 'image/jpeg', buffer: photo });
  await expect(page.getByRole('button', { name: 'Rasmni olib tashlash' })).toBeVisible();
}

async function reachReview(page: Page) {
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await expect(page.getByRole('heading', { name: 'Reklama yoʻnalishini tanlang' })).toBeVisible();
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await expect(page.getByRole('heading', { name: 'Hammasini tekshiring' })).toBeVisible();
}

test('the draft is restored on mount and survives a reload (StrictMode double effects)', async ({ page }) => {
  await page.goto('/studiya');
  await page.getByLabel('Mahsulot nomi').fill('Qayta tiklanadigan nom');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByLabel('Mahsulot nomi')).toHaveValue('Qayta tiklanadigan nom');
  await page.reload();
  await expect(page.getByLabel('Mahsulot nomi')).toHaveValue('Qayta tiklanadigan nom');
});

test('signed out, the studio asks for sign-in and keeps uploads locked', async ({ page }) => {
  await page.goto('/studiya');
  await expect(page.getByRole('link', { name: 'Google orqali kirish' })).toHaveAttribute('href', '/api/auth/google');
  await expect(page.locator('input[type=file]')).toBeDisabled();
});

test('a seller goes from an empty studio to a ready prompt; the brief is saved before generating', async ({ page }) => {
  await signIn(page, { slow: true });
  const calls: string[] = [];
  let idempotencyKey: string | undefined;
  page.on('request', (req) => {
    const path = new URL(req.url()).pathname;
    if (!path.startsWith('/api/projects')) return;
    calls.push(`${req.method()} ${path}`);
    if (req.method() === 'POST' && path.endsWith('/generations')) idempotencyKey = req.headers()['idempotency-key'];
  });

  await page.goto('/studiya');
  await fillProduct(page);
  await expect(page.getByLabel('Qisqa tavsif')).toHaveValue(/koʻk/);
  await uploadPhoto(page);

  await page.getByRole('button', { name: 'Davom etish' }).click();
  await page.getByText('Tabiiy UGC').click();
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await expect(page.getByRole('heading', { name: 'Hammasini tekshiring' })).toBeVisible();

  await page.getByRole('button', { name: 'Reklama promptini tayyorlash' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Prompt tayyorlanmoqda|Navbatda/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Uch rangdagi sokin Pixel vitrini')).toBeVisible();

  const patch = calls.indexOf('PATCH /api/projects/p-1');
  const generate = calls.indexOf('POST /api/projects/p-1/generations');
  expect(patch).toBeGreaterThanOrEqual(0);
  expect(generate).toBeGreaterThan(patch);
  expect(idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
});

test('only the prompt reaches the clipboard, and the block stays selectable and whole', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await signIn(page);
  await page.goto('/studiya');
  await fillProduct(page);
  await uploadPhoto(page);
  await reachReview(page);
  await page.getByRole('button', { name: 'Reklama promptini tayyorlash' }).click();
  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Promptni nusxalash' }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toBe(PACKAGE.promptEn);
  expect(clip).not.toContain(PACKAGE.result.concept.titleUz);

  const block = page.locator('pre').first();
  await expect(block).toHaveText(PACKAGE.promptEn);
  const style = await block.evaluate((el) => getComputedStyle(el).userSelect);
  expect(style).toBe('all');
});

test('a reopened project opens on its newest prompt, and every version can be picked', async ({ page }) => {
  await signIn(page, {
    versions: [
      readyVersion('g-2', '2026-09-13T09:00:00.000Z', 'SECOND PROMPT: warm window light.'),
      readyVersion('g-1', '2026-09-12T18:20:00.000Z', 'FIRST PROMPT: cool studio light.'),
    ],
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Loyihalarim' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Ochish' }).click();

  await expect(page).toHaveURL(/\/studiya$/);
  await expect(page.getByRole('heading', { name: 'Prompt tayyor' })).toBeVisible();
  await expect(page.getByText('SECOND PROMPT: warm window light.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Versiya 2' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Versiya 1' }).click();
  await expect(page.getByText('FIRST PROMPT: cool studio light.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Versiya 1' })).toHaveAttribute('aria-pressed', 'true');
});

test('?loyiha=<id> with no prompt yet opens the brief at step 1', async ({ page }) => {
  await signIn(page, { versions: [] });
  await page.goto('/studiya?loyiha=p-1');
  await expect(page.getByLabel('Mahsulot nomi')).toHaveValue('Pixel 9a, 128 GB');
  await expect(page.locator('[aria-current="step"]')).toContainText('Mahsulot');
  await expect(page).toHaveURL(/\/studiya$/);
});

test('no credits: the balance opens the drawer, which shows no invented prices', async ({ page }) => {
  await signIn(page, { credits: 0 });
  await page.goto('/');
  await page.getByRole('button', { name: /Prompt limiti/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Prompt limiti' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Paketlar hali sozlanmagan.')).toBeVisible();
  await expect(dialog.getByText(/soʻm/)).toHaveCount(0);
});

test('the app never claims to make the video', async ({ page }) => {
  await page.goto('/');
  const body = (await page.locator('body').innerText()).toLowerCase();
  for (const claim of ['video tayyorlaymiz', 'video yaratamiz', 'videongizni tayyorlaymiz', 'video tayyorlash']) {
    expect(body).not.toContain(claim);
  }
  await page.goto('/studiya');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reklama promptini tayyorlash');
});
