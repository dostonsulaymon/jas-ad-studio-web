import { expect, test } from '@playwright/test';

/**
 * The gallery runs against the real API through the dev server's /api rewrite: it is the one flow
 * with no session to forge, and it must work signed out (D-007). Skips if nothing is published.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const count = await page.locator('#galereya li h3').count();
  test.skip(count === 0, 'no published gallery examples on this API');
});

test('the gallery renders published examples with provenance, videos never preloaded', async ({ page }) => {
  const cards = page.locator('#galereya ul > li');
  await expect(cards.first()).toBeVisible();
  const video = cards.first().locator('video');
  await expect(video).toHaveAttribute('preload', 'none');
  expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
  await expect(cards.first().getByText(/namuna/i)).toBeVisible();
});

test('search filters the gallery client-side, and an empty result offers a way back', async ({ page }) => {
  const cards = page.locator('#galereya ul > li');
  const total = await cards.count();
  const firstTitle = (await cards.first().locator('h3').innerText()).split(' ')[0];

  await page.getByLabel('Misollar orasidan qidirish').fill(firstTitle);
  await expect(cards.first().locator('h3')).toContainText(firstTitle);
  expect(await cards.count()).toBeLessThanOrEqual(total);

  await page.getByLabel('Misollar orasidan qidirish').fill('zzzz-yoq-narsa');
  await expect(page.getByText('Bunday misol topilmadi')).toBeVisible();
  await page.getByRole('button', { name: 'Filtrlarni tozalash' }).click();
  await expect(cards).toHaveCount(total);
});

test('category chips list only categories that exist, and filter', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Toifa' });
  const chips = group.getByRole('button');
  expect(await chips.count()).toBeGreaterThan(1);
  const second = chips.nth(1);
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  const label = await second.innerText();
  for (const meta of await page.locator('#galereya ul > li p.truncate').allInnerTexts()) {
    expect(meta.startsWith(label)).toBe(true);
  }
});

test('Copy puts only the example prompt on the clipboard, signed out and free', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const slugResponse = page.waitForResponse((r) => /\/api\/gallery\/[^/]+$/.test(new URL(r.url()).pathname) && r.request().method() === 'GET');
  await page.locator('#galereya').getByRole('button', { name: 'Prompt', exact: true }).first().click();
  const example = await (await slugResponse).json();

  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('pre')).toHaveText(example.promptEn);
  await dialog.getByRole('button', { name: 'Promptni nusxalash' }).click();
  await expect(dialog.getByRole('button', { name: 'Nusxalandi' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(example.promptEn);

  const direct = await request.get(`/api/gallery/${example.slug}`);
  expect(direct.ok()).toBe(true);
});

test('the sheet closes on Escape and returns focus to its trigger', async ({ page }) => {
  const trigger = page.locator('#galereya').getByRole('button', { name: 'Prompt', exact: true }).first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('"Shu uslubdan foydalanish" carries only the example id into the studio', async ({ page }) => {
  const title = await page.locator('#galereya ul > li h3').first().innerText();
  await page.locator('#galereya').getByRole('button', { name: 'Prompt', exact: true }).first().click();
  await page.getByRole('button', { name: 'Shu uslubdan foydalanish' }).click();
  await expect(page).toHaveURL(/\/studiya$/);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('jas.v2.draft') ?? '{}'));
  expect(Object.keys(stored.inspiration).sort()).toEqual(['id', 'titleUz']);
  expect(stored.inspiration.titleUz).toBe(title);
  expect(JSON.stringify(stored)).not.toContain('source of truth');
});
