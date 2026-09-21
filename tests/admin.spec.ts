import { expect, test } from '@playwright/test';
import { signIn } from './fixtures';

test('a seller sees the owner-only notice, not the panel', async ({ page }) => {
  await signIn(page, { role: 'seller' });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Bu sahifa faqat egasi uchun' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buyurtmalar' })).toHaveCount(0);
});

test('the open tab lives in the URL and survives a refresh', async ({ page }) => {
  await signIn(page, { role: 'owner' });
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Galereya' }).click();
  await expect(page).toHaveURL(/#gallery$/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Galereya' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Galereya', level: 2 })).toBeVisible();
});

test('confirming an order takes a second, explicit step that names the seller', async ({ page }) => {
  await signIn(page, { role: 'owner' });
  let confirmed = false;
  await page.route('**/api/owner/orders/o-1/confirm', (r) => {
    confirmed = true;
    return r.fulfill({ json: {} });
  });
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Tasdiqlash' }).click();
  expect(confirmed).toBe(false);
  await expect(page.getByText('dilnoza@example.uz hisobiga 10 ta prompt qoʻshiladi. Bu amal qaytarilmaydi.')).toBeVisible();
  await page.getByRole('button', { name: 'Tasdiqlash' }).click();
  await expect.poll(() => confirmed).toBe(true);
});

/**
 * R-015. The owner could not tell which field a refusal was about: the API sends the list, the panel
 * dropped it. This drives the real sheet against a refusal shaped exactly like the API's.
 */
test('a new example names itself, and a refused publish points at the fields', async ({ page }) => {
  await signIn(page, { role: 'owner' });
  await page.route('**/api/owner/gallery', (route) => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: { examples: [] } });
    return route.fulfill({
      status: 400,
      json: {
        code: 'VALIDATION_FAILED',
        messageKey: 'errors.validation_failed',
        requestId: 'e0e61589-6119-44b4-97fc-2e7341e7cdeb',
        details: {
          fields: [
            { path: 'videoPath', message: 'a published example needs its video' },
            { path: 'creativePreset.mood', message: 'a published example needs all five creative attributes (§13)' },
            { path: 'flowModel', message: 'a published example must record flowModel and flowMode (D-011)' },
          ],
        },
      },
    });
  });

  await page.goto('/admin#gallery');
  await page.getByRole('button', { name: 'Yangi namuna' }).click();

  const sheet = page.getByRole('dialog');
  await sheet.getByLabel('Sarlavha').fill('Har kuni qoʻl yetadigan tozalik');
  await expect(sheet.getByLabel('Manzil nomi (slug)')).toHaveValue('har-kuni-qol-yetadigan-tozalik');

  await sheet.locator('input[type="checkbox"]').check();
  await sheet.getByRole('button', { name: 'Saqlash' }).click();

  const notice = sheet.getByRole('alert');
  await expect(notice).toContainText('Video fayl');
  await expect(notice).toContainText('Kayfiyat');
  await expect(notice).toContainText('Flow modeli');
  await expect(sheet.getByLabel('Flow modeli')).toHaveAttribute('aria-invalid', 'true');
});
