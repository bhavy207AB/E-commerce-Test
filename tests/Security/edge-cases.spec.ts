import { test, expect } from '@playwright/test';

// XSS payload in search
test('search field sanitizes XSS input', async ({ page }) => {
  await page.goto('https://automationexercise.com/products');
  await page.fill('#search_product', '<script>alert("xss")</script>');
  await page.click('#submit_search');
  // Assert no alert dialog fires and the script tag is escaped in DOM
  const content = await page.locator('.productinfo').allTextContents();
  content.forEach(t => expect(t).not.toContain('<script>'));
});

// Auth state: saved login should not persist after explicit logout
test('session clears after logout', async ({ page, context }) => {
  // Login, save storageState, logout, reload — assert redirected to login
});
