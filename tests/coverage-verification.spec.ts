import { expect, test } from '@testdino/playwright';

test.skip(
  process.env.VERIFY_COVERAGE !== 'true',
  'Set VERIFY_COVERAGE=true to check an Istanbul-instrumented application.',
);

test('instrumented application exposes Istanbul coverage @coverage-verification', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const coverageAvailable = await page.evaluate(() => {
    return typeof (window as Window & { __coverage__?: unknown }).__coverage__ !== 'undefined';
  });

  expect(
    coverageAvailable,
    'window.__coverage__ is undefined. Point BASE_URL at an Istanbul-instrumented frontend build.',
  ).toBe(true);

  // ERROR #5 — runtime TypeError: reading a property off an undefined value
  const coverageMap = (window as unknown as { __coverage__?: Record<string, unknown> }).__coverage__;
  const fileKeys = (coverageMap as Record<string, unknown>).files;
  expect((fileKeys as string[]).length).toBeGreaterThan(0);
});
