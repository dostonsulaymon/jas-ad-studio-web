import { expect, test } from '@playwright/test';
import { auditLayout, signIn } from './fixtures';

/**
 * v1's header overflowed by 139 px at 360 only when signed in, because every layout test ran signed
 * out. So each page is audited signed out and signed in, at every width in the config.
 */

const cases: Array<{ name: string; path: string; role?: 'seller' | 'owner' }> = [
  { name: 'landing, signed out', path: '/' },
  { name: 'studio, signed out', path: '/studiya' },
  { name: 'privacy, signed out', path: '/maxfiylik' },
  { name: 'landing, seller', path: '/', role: 'seller' },
  { name: 'studio, seller', path: '/studiya', role: 'seller' },
  { name: 'landing, owner', path: '/', role: 'owner' },
  { name: 'admin, owner', path: '/admin', role: 'owner' },
  { name: 'admin gallery tab, owner', path: '/admin#gallery', role: 'owner' },
];

for (const c of cases) {
  test(`${c.name}: no overflow, 44 px targets, 16 px inputs`, async ({ page }) => {
    if (c.role) await signIn(page, { role: c.role });
    await page.goto(c.path);
    await page.waitForLoadState('networkidle');
    if (c.role) await expect(page.getByRole('button', { name: /Prompt limiti/ })).toBeVisible();
    const audit = await auditLayout(page);
    expect(audit.overflow, 'horizontal overflow in px').toBe(0);
    expect(audit.small, 'controls smaller than 44 px').toEqual([]);
    expect(audit.smallInputs, 'form controls under 16 px').toEqual([]);
  });
}

test('focus is visible on the white primary buttons', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Videolarni koʻrish' });
  await cta.focus();
  const outline = await cta.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
});
