import { expect, test } from '@playwright/test';

test.describe('TestDino filter verification @testdino-filter', () => {
  test('FAILED - Assertion filter @testdino-filter', async () => {
    expect('actual assertion value').toBe('expected assertion value');
  });

  test('FAILED - Element Not Found filter @testdino-filter', async ({ page }) => {
    await page.setContent('<main><h1>Filter verification page</h1></main>');

    await expect(page.getByRole('button', { name: 'Never Rendered Button' })).toBeVisible({
      timeout: 1_000,
    });
  });

  test('FAILED - Timeout filter @testdino-filter', async ({ page }) => {
    test.setTimeout(1_000);

    await page.waitForTimeout(2_000);
  });

  test('FAILED - Network filter @testdino-filter', async ({ page }) => {
    await page.route('**/*', route => route.abort('failed'));

    await page.goto('https://example.com/testdino-network-filter-check', {
      waitUntil: 'domcontentloaded',
      timeout: 5_000,
    });
  });

  test('FAILED - Other filter @testdino-filter', async () => {
    throw new Error('Synthetic uncategorized failure for the TestDino Other filter');
  });

  test('FLAKY - Assertion filter @testdino-filter', async ({}, testInfo) => {
    if (testInfo.retry === 0) {
      expect('first attempt').toBe('retry attempt');
    }
  });

  test('FLAKY - Element filter @testdino-filter', async ({ page }, testInfo) => {
    await page.setContent('<main><h1>Retry page</h1></main>');

    if (testInfo.retry === 0) {
      await expect(page.getByText('Only visible on retry')).toBeVisible({
        timeout: 1_000,
      });
    }
  });

  test('FLAKY - Timeout filter @testdino-filter', async ({ page }, testInfo) => {
    if (testInfo.retry === 0) {
      test.setTimeout(1_000);
      await page.waitForTimeout(2_000);
    }
  });

  test('FLAKY - Network filter @testdino-filter', async ({ page }, testInfo) => {
    if (testInfo.retry === 0) {
      await page.route('**/*', route => route.abort('failed'));
      await page.goto('https://example.com/testdino-flaky-network-filter-check', {
        waitUntil: 'domcontentloaded',
        timeout: 5_000,
      });
    }
  });

  test('FLAKY - Other filter @testdino-filter', async ({}, testInfo) => {
    if (testInfo.retry === 0) {
      throw new Error('Synthetic uncategorized flaky failure for the TestDino Other filter');
    }
  });

  test.skip('SKIPPED - Skipped filter @testdino-filter', async () => {
    expect(true).toBe(false);
  });

  test.fixme('SKIPPED - Fixme filter @testdino-filter', async () => {
    expect(true).toBe(false);
  });

  test('SKIPPED - Filtered filter @testdino-filter @filtered-out', async () => {
    expect(true).toBe(true);
  });
});
