import { test, expect } from '@playwright/test';

test('homepage LCP is under 2.5s', async ({ page }) => {
  await page.goto('https://automationexercise.com');
  const lcp = await page.evaluate(() =>
    new Promise(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    })
  );
  expect(lcp).toBeLessThan(2500);
});
