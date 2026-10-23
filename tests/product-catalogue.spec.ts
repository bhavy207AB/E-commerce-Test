import { test, expect } from '@playwright/test';
import { ciOnly, openProducts, SEL } from './support/store-helpers';

/**
 * TestDino Demo Store — Product catalogue items (names & prices). CI-only.
 * 3 cases pass, 2 assert wrong values -> fail.
 */
ciOnly(test);

/** The product card <a> that wraps a header with the given name. */
function card(page: import('@playwright/test').Page, name: string) {
  return page
    .locator('a', { has: page.locator(SEL.productHeader, { hasText: name }) })
    .first();
}

test.describe('Product catalogue', () => {

  // PASS
  test('GoPro HERO10 Black is listed at $600', async ({ page }) => {
    await openProducts(page);
    await expect(card(page, 'GoPro HERO10 Black')).toContainText('$600');
  });

  // PASS
  test('Dell XPS 13 (2021) Laptop is listed at $1,560', async ({ page }) => {
    await openProducts(page);
    await expect(card(page, 'Dell XPS 13 (2021) Laptop')).toContainText('$1,560');
  });

  // PASS
  test('expected hero products are present in the catalogue', async ({ page }) => {
    await openProducts(page);
    for (const name of [
      'JBL Charge 4 Bluetooth Speaker',
      'Apple Watch Series 7',
      'Samsung 32-inch UHD 4K Smart TV',
    ]) {
      await expect(page.locator(SEL.productHeader, { hasText: name })).toBeVisible();
    }
  });

  // FAIL — GoPro is $600, not $550
  test('GoPro HERO10 Black is listed at $550', async ({ page }) => {
    await openProducts(page);
    await expect(card(page, 'GoPro HERO10 Black')).toContainText('$550');
  });

  // FAIL — no such product exists in this store
  test('catalogue contains an "iPhone 15 Pro" product', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.productHeader, { hasText: 'iPhone 15 Pro' }))
      .toBeVisible({ timeout: 5000 });
  });
});
