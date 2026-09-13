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
