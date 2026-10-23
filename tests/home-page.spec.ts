import { test, expect } from '@playwright/test';
import { ciOnly, openHome, SEL } from './support/store-helpers';

/**
 * TestDino Demo Store — Home page (https://storedemo.testdino.com)
 *
 * Real assertions against the live home page. CI-only: these run only inside
 * GitHub Actions (see ciOnly). 4 cases pass, 1 asserts a wrong value -> fails.
 */
ciOnly(test);

test.describe('Home page', () => {

  // PASS
  test('has the correct document title', async ({ page }) => {
    await openHome(page);
    await expect(page).toHaveTitle('TestDino | Demo Store');
  });

  // PASS
  test('hero headline reads "Demo E-commerce Testing Store"', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.heroTitle)).toHaveText('Demo E-commerce Testing Store');
  });

  // PASS
  test('renders an "Audio & Camera" category tile', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.categoryCamera)).toHaveText('Audio & Camera');
  });

  // PASS
  test('subscribe section invites the user to subscribe', async ({ page }) => {
    await openHome(page);
    await expect(page.locator(SEL.subscribeTitle))
      .toHaveText('Subscribe to receive the latest updates on our products!');
  });

  // FAIL — actual title is "TestDino | Demo Store"
  test('title is exactly "TestDino Store"', async ({ page }) => {
    await openHome(page);
    await expect(page).toHaveTitle('TestDino Store');
  });
});
