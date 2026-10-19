import { expect, test } from '@testdino/playwright';

/**
 * Dashboard filter coverage.
 *
 * This spec exists to populate the TestDino dashboard filters shown in the
 * project screenshots:
 *   - Platform filter : Chromium (the Playwright project this spec runs on)
 *   - "All tags" filter: @E2E, @account, @api, @auth, @cart, @catalog,
 *                        @checkout, @chromium, @content
 *
 * Every test carries the two cross-cutting tags (@E2E + @chromium) plus the
 * one domain tag for its group, so each option in the dashboard's tag filter
 * has real runs behind it. A small, deliberate mix of pass / fail / skip keeps
 * the dashboard status charts populated the same way the other data-gen specs
 * in this repo do.
 */

const CROSS_CUTTING = ['@E2E', '@chromium'];
const tagsFor = (domain: string) => [...CROSS_CUTTING, domain];

test.describe('Account @account', () => {
  test(
    'user can view their account profile',
    { tag: tagsFor('@account') },
    async () => {
      const profile = { name: 'Ada Lovelace', email: 'ada@example.com' };
      expect(profile.email).toContain('@');
    },
  );

  test(
    'user can update account details',
    { tag: tagsFor('@account') },
    async () => {
      const updated = { ...{ name: 'Ada' }, name: 'Ada L.' };
      expect(updated.name).toBe('Ada L.');
    },
  );
});

test.describe('Authentication @auth', () => {
  test(
    'valid credentials are accepted',
    { tag: tagsFor('@auth') },
    async () => {
      const token = Buffer.from('user:correct-password').toString('base64');
      expect(token.length).toBeGreaterThan(0);
    },
  );

  test(
    'invalid credentials are rejected',
    { tag: tagsFor('@auth') },
    async () => {
      const login = (pw: string) => pw === 'correct-password';
      expect(login('wrong-password')).toBe(false);
    },
  );
});

test.describe('Catalog @catalog', () => {
  const products = ['Hoodie', 'T-Shirt', 'Sneakers', 'Cap'];

  test(
    'product catalog lists available products',
    { tag: tagsFor('@catalog') },
    async () => {
      expect(products.length).toBeGreaterThan(0);
    },
  );

  test(
    'catalog can be filtered by keyword',
    { tag: tagsFor('@catalog') },
    async () => {
      const matches = products.filter((p) => p.toLowerCase().includes('s'));
      expect(matches).toContain('Sneakers');
    },
  );
});

test.describe('Cart @cart', () => {
  test(
    'item can be added to the cart',
    { tag: tagsFor('@cart') },
    async () => {
      const cart: string[] = [];
      cart.push('Hoodie');
      expect(cart).toHaveLength(1);
    },
  );

  test(
    'cart total reflects quantities',
    { tag: tagsFor('@cart') },
    async () => {
      const items = [{ price: 25, qty: 2 }, { price: 10, qty: 1 }];
      const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      expect(total).toBe(60);
    },
  );

  test(
    'item can be removed from the cart',
    { tag: tagsFor('@cart') },
    async () => {
      let cart = ['Hoodie', 'Cap'];
      cart = cart.filter((i) => i !== 'Cap');
      expect(cart).not.toContain('Cap');
    },
  );
});

test.describe('Checkout @checkout', () => {
  test(
    'checkout succeeds with a valid cart',
    { tag: tagsFor('@checkout') },
    async () => {
      const order = { items: 2, paid: true };
      expect(order.paid).toBe(true);
    },
  );

  test(
    'checkout is blocked for an empty cart',
    { tag: tagsFor('@checkout') },
    async () => {
      const canCheckout = (itemCount: number) => itemCount > 0;
      expect(canCheckout(0)).toBe(false);
    },
  );
});

test.describe('API @api', () => {
  test(
    'products endpoint returns a list',
    { tag: tagsFor('@api') },
    async () => {
      const response = { status: 200, body: [{ id: 1 }, { id: 2 }] };
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    },
  );

  test(
    'unknown product returns 404',
    { tag: tagsFor('@api') },
    async () => {
      const response = { status: 404 };
      expect(response.status).toBe(404);
    },
  );
});

test.describe('Content @content', () => {
  test(
    'home page renders the hero banner',
    { tag: tagsFor('@content') },
    async () => {
      const page = { hero: 'Welcome to the Store' };
      expect(page.hero).toMatch(/Store/);
    },
  );

  test(
    'footer exposes the support link',
    { tag: tagsFor('@content') },
    async () => {
      const links = ['home', 'products', 'support'];
      expect(links).toContain('support');
    },
  );
});
