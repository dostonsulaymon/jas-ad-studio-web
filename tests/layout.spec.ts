import { expect, test } from '@playwright/test';

/**
 * The floors from source 01 §39 and §40, as assertions. These are the things that
 * cannot be checked by looking at a screenshot.
 */

test('the page never scrolls sideways', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth);
});

test('the tray scrolls inside its own container, not the page', async ({ page }) => {
  await page.goto('/');
  // The tray is deliberately wider than the viewport: that is the bleed. What matters
  // is that the overflow is owned by the tray and never reaches the document.
  const tray = page.locator('[data-tray]');
  const box = await tray.evaluate((el) => ({
    scrolls: el.scrollWidth > el.clientWidth,
    overflowX: getComputedStyle(el).overflowX,
  }));
  expect(box.scrolls).toBe(true);
  expect(box.overflowX).toBe('auto');
});

test('every interactive element is at least 44px on its short side', async ({ page }) => {
  await page.goto('/');
  const small = await page.evaluate(() => {
    const bad: Array<{ tag: string; text: string; w: number; h: number }> = [];
    const nodes = document.querySelectorAll('a,button,input:not([type=file]),summary,select,textarea');
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (Math.min(r.width, r.height) < 44) {
        bad.push({
          tag: el.tagName,
          text: (el.textContent ?? '').trim().slice(0, 30),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return bad;
  });
  expect(small, JSON.stringify(small, null, 2)).toEqual([]);
});

test('no form control is under 16px, or the phone zooms on focus', async ({ page }) => {
  await page.goto('/');
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('input,textarea,select')]
      .map((el) => ({ tag: el.tagName, size: parseFloat(getComputedStyle(el).fontSize) }))
      .filter((x) => x.size < 16),
  );
  expect(small, JSON.stringify(small)).toEqual([]);
});

test('the skip link is the first focusable element and becomes visible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveClass(/skip-link/);
  await expect(focused).toBeInViewport();
});

test('the headline renders U+02BB, the character Manrope could not (W-001)', async ({ page }) => {
  await page.goto('/');
  const h1 = await page.locator('h1').innerText();
  expect(h1).toContain('gʻoyasi');
  expect(h1).not.toContain('g‘oyasi');
});
