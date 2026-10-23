import { expect } from '@playwright/test';
import type { Page, TestType } from '@playwright/test';

/**
 * Shared helpers + selectors for the TestDino demo store specs
 * (https://storedemo.testdino.com). This file is intentionally NOT a *.spec.ts
 * so Playwright does not try to run it as a test.
 */

export const BASE = 'https://storedemo.testdino.com';

export const SEL = {
  searchInput: '[data-testid="all-products-search-input"]',
  resultsCount: '[data-testid="all-products-results-count"]',
  productHeader: '[data-testid="all-products-header"]',
  productPrice: '[data-testid="all-products-price"]',
  cartButton: '[data-testid="all-products-cart-button"]',
  wishlistButton: '[data-testid="all-products-wishlist-button"]',
  cartDrawer: '[data-testid="cart-drawer"]',
  heroTitle: '[data-testid="hero-title"]',
  subscribeTitle: '[data-testid="subscribe-title"]',
  footerCopyright: '[data-testid="footer-copyright"]',
  categoryCamera: '[data-testid="category-title-camera"]',
};

/**
 * Guard that makes a spec run ONLY inside GitHub Actions (CI=true). Call it
 * once at the top of each spec file. Locally every test is skipped; in CI they
 * execute normally.
 */
export function ciOnly(test: TestType<any, any>) {
  test.beforeEach(() => {
    test.skip(!process.env.CI, 'Store specs run only in GitHub CI (set CI=true to run locally).');
  });
}

/** Open the products listing and wait until it has rendered. */
export async function openProducts(page: Page) {
  await page.goto(`${BASE}/products`, { waitUntil: 'load' });
  await expect(page.locator(SEL.searchInput)).toBeVisible();
  // Cards hydrate client-side; wait for the first one before asserting.
  await expect(page.locator(SEL.productHeader).first()).toBeVisible();
}

/** Open the home page and wait until the hero has rendered. */
export async function openHome(page: Page) {
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await expect(page.locator(SEL.heroTitle)).toBeVisible();
}

/** Read the persisted cart (the store keeps it in localStorage.cartItems). */
export async function readCart(page: Page): Promise<any[]> {
  const raw = await page.evaluate(() => localStorage.getItem('cartItems') || '[]');
  return JSON.parse(raw);
}

/** Read the persisted wishlist. */
export async function readWishlist(page: Page): Promise<any[]> {
  const raw = await page.evaluate(() => localStorage.getItem('wishlistItems') || '[]');
  return JSON.parse(raw);
}

/**
 * Add the Nth product card to the cart. The cart lives in localStorage, so we
 * confirm the add by polling that store rather than inspecting the drawer
 * (whose close button renders off-viewport in headless). `force` lets a second
 * add click through the drawer overlay opened by the first one.
 */
export async function addProductToCart(page: Page, index: number): Promise<string> {
  const name = (await page.locator(SEL.productHeader).nth(index).innerText()).trim();
  await page.locator(SEL.cartButton).nth(index).click({ force: true });
  await expect
    .poll(async () => (await readCart(page)).some(c => c.header === name))
    .toBe(true);
  return name;
}
