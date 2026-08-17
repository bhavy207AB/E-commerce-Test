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
});

// Intentional deep-equality AssertionError: object shape mismatch.
test('coverage summary reports the expected metrics @coverage-verification', async () => {
  const actualSummary = { statements: 82, branches: 74, functions: 90 };
  const expectedSummary = { statements: 95, branches: 90, functions: 100 };

  expect(actualSummary).toEqual(expectedSummary);
});
