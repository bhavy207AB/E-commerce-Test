import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * TestDino Demo Store — 25 real test cases (https://storedemo.testdino.com)
 *
 * These are genuine end-to-end assertions against the live demo store, not
 * dummy expect(true).toBe(true) checks. They drive the real UI (search, cart,
 * wishlist, navigation) and verify real DOM / localStorage state.
 *
 * By design the suite is a MIX of outcomes so a run has both green and red:
 *   - 18 cases assert the store's ACTUAL behaviour      -> expected to PASS
 *   -  7 cases assert a WRONG expected value (marked)   -> expected to FAIL
 *
 * The failing cases are legitimate assertions whose expected value does not
 * match reality (e.g. expecting 20 products when the store ships 14), the way
 * a QA deviation / regression would surface — never fabricated.
 *
 *   npx playwright test tests/storedemo-25-cases.spec.ts --project=chromium
 */

const BASE = 'https://storedemo.testdino.com';

const SEL = {
  searchInput: '[data-testid="all-products-search-input"]',
  resultsCount: '[data-testid="all-products-results-count"]',
  productHeader: '[data-testid="all-products-header"]',
  productPrice: '[data-testid="all-products-price"]',
  cartButton: '[data-testid="all-products-cart-button"]',
  wishlistButton: '[data-testid="all-products-wishlist-button"]',
  cartDrawer: '[data-testid="cart-drawer"]',
  closeCart: '[data-testid="close-cart"]',
  heroTitle: '[data-testid="hero-title"]',
  subscribeTitle: '[data-testid="subscribe-title"]',
  footerCopyright: '[data-testid="footer-copyright"]',
  menuAbout: '[data-testid="header-menu-about-us"]',
  menuContact: '[data-testid="header-menu-contact-us"]',
  menuProducts: '[data-testid="header-menu-all-products"]',
  categoryCamera: '[data-testid="category-title-camera"]',
};

/** Open the products listing and wait until it has rendered. */
async function openProducts(page: Page) {
  await page.goto(`${BASE}/products`, { waitUntil: 'load' });
  await expect(page.locator(SEL.searchInput)).toBeVisible();
  // Cards hydrate client-side; wait for the first one before asserting.
  await expect(page.locator(SEL.productHeader).first()).toBeVisible();
}

/** Open the home page and wait until the hero has rendered. */
async function openHome(page: Page) {
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await expect(page.locator(SEL.heroTitle)).toBeVisible();
}

/** Read the persisted cart (the store stores it in localStorage.cartItems). */
async function readCart(page: Page): Promise<any[]> {
  const raw = await page.evaluate(() => localStorage.getItem('cartItems') || '[]');
  return JSON.parse(raw);
}

/** Read the persisted wishlist. */
async function readWishlist(page: Page): Promise<any[]> {
  const raw = await page.evaluate(() => localStorage.getItem('wishlistItems') || '[]');
  return JSON.parse(raw);
}

/**
 * Add the Nth product card to the cart. The cart lives in localStorage, so we
 * confirm the add by polling that store rather than inspecting the drawer
 * (whose close button renders off-viewport in headless). `force` lets a second
 * add click through the drawer overlay opened by the first one.
 */
async function addProductToCart(page: Page, index: number): Promise<string> {
  const name = (await page.locator(SEL.productHeader).nth(index).innerText()).trim();
  await page.locator(SEL.cartButton).nth(index).click({ force: true });
  await expect
    .poll(async () => (await readCart(page)).some(c => c.header === name))
    .toBe(true);
  return name;
}

// ---------------------------------------------------------------------------
// Page load & static content
// ---------------------------------------------------------------------------
test.describe('Store · page load & content', () => {

  // Case 1 — PASS
  test('home page has the correct document title', async ({ page }) => {
    await openHome(page);
    await expect(page).toHaveTitle('TestDino | Demo Store');
  });

  // Case 2 — PASS
  test('home hero headline reads "Demo E-commerce Testing Store"', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.heroTitle)).toHaveText('Demo E-commerce Testing Store');
  });

  // Case 3 — PASS
  test('products page has the correct document title', async ({ page }) => {
    await openProducts(page);
    await expect(page).toHaveTitle('TestDino | Products');
  });

  // Case 4 — PASS
  test('products page shows the "All Products" heading', async ({ page }) => {
    await openProducts(page);
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });

  // Case 5 — PASS
  test('home page renders a "Audio & Camera" category tile', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.categoryCamera)).toHaveText('Audio & Camera');
  });

  // Case 6 — PASS
  test('footer copyright shows the current store year', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.footerCopyright)).toHaveText('© 2026 TestDino');
  });

  // Case 7 — FAIL (store copyright is 2026, not 2025)
  test('footer copyright shows © 2025 TestDino', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.footerCopyright)).toHaveText('© 2025 TestDino');
  });

  // Case 8 — FAIL (actual title is "TestDino | Demo Store")
  test('home title is exactly "TestDino Store"', async ({ page }) => {
    await openHome(page);
    await expect(page).toHaveTitle('TestDino Store');
  });

  // Case 9 — PASS
  test('subscribe section invites the user to subscribe', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.subscribeTitle))
      .toHaveText('Subscribe to receive the latest updates on our products!');
  });
});

// ---------------------------------------------------------------------------
// Product catalogue
// ---------------------------------------------------------------------------
test.describe('Store · catalogue', () => {

  // Case 10 — PASS
  test('catalogue lists 14 products', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 14 products');
    await expect(page.locator(SEL.productHeader)).toHaveCount(14);
  });

  // Case 11 — PASS
  test('GoPro HERO10 Black is listed at $600', async ({ page }) => {
    await openProducts(page);
    const card = page
      .locator('a', { has: page.locator(SEL.productHeader, { hasText: 'GoPro HERO10 Black' }) })
      .first();
    await expect(card).toContainText('$600');
  });

  // Case 12 — PASS
  test('Dell XPS 13 (2021) Laptop is the priciest listed item at $1,560', async ({ page }) => {
    await openProducts(page);
    const card = page
      .locator('a', { has: page.locator(SEL.productHeader, { hasText: 'Dell XPS 13 (2021) Laptop' }) })
      .first();
    await expect(card).toContainText('$1,560');
  });

  // Case 13 — PASS
  test('clicking the wishlist button saves the product to the wishlist', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.wishlistButton).first().click();
    await expect.poll(async () => (await readWishlist(page)).length).toBeGreaterThan(0);
  });

  // Case 14 — PASS
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

  // Case 15 — FAIL (the store ships 14 products, not 20)
  test('catalogue lists 20 products', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.productHeader)).toHaveCount(20);
  });

  // Case 16 — FAIL (GoPro is $600, not $550)
  test('GoPro HERO10 Black is listed at $550', async ({ page }) => {
    await openProducts(page);
    const card = page
      .locator('a', { has: page.locator(SEL.productHeader, { hasText: 'GoPro HERO10 Black' }) })
      .first();
    await expect(card).toContainText('$550');
  });

  // Case 17 — FAIL (no such product exists in this store)
  test('catalogue contains an "iPhone 15 Pro" product', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.productHeader, { hasText: 'iPhone 15 Pro' }))
      .toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
test.describe('Store · search', () => {

  // Case 18 — PASS
  test('searching "GoPro" narrows the list to a single product', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('GoPro');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 1 products');
    await expect(page.locator(SEL.productHeader)).toHaveText('GoPro HERO10 Black');
  });

  // Case 19 — PASS
  test('searching "SanDisk" returns the two SanDisk products', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('SanDisk');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 2 products');
  });

  // Case 20 — PASS
  test('a nonsense query shows the empty-state message', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('zzqwx-not-a-real-product');
    await expect(page.locator(SEL.resultsCount)).toHaveText('No products found');
    await expect(page.locator(SEL.productHeader)).toHaveCount(0);
  });

  // Case 21 — FAIL (a "GoPro" search returns 1 product, not 3)
  test('searching "GoPro" returns 3 products', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('GoPro');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 3 products');
  });
});

// ---------------------------------------------------------------------------
// Cart & wishlist (persisted in localStorage)
// ---------------------------------------------------------------------------
test.describe('Store · cart & wishlist', () => {

  // Case 22 — PASS
  test('adding one product puts a single line in the cart', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  // Case 23 — PASS
  test('adding two different products yields two cart lines', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    await addProductToCart(page, 1);
    const cart = await readCart(page);
    expect(cart).toHaveLength(2);
    const names = cart.map(c => c.header);
    expect(new Set(names).size).toBe(2);
  });

  // Case 24 — PASS
  test('re-adding the same product does not create a duplicate line', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(1);
  });

  // Case 25 — FAIL (one add produces a single line, not two)
  test('adding one product should leave two lines in the cart', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(2);
  });
});
