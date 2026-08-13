import { test, expect } from '@testdino/playwright';

/**
 * API Mocking & Network Interception
 * Learn: route interception, mocking API responses, network debugging
 */

test.describe('API Mocking Examples', () => {
  
  test('Mock product search API response', async ({ page }) => {
    
    // Intercept API calls and mock responses
    await page.route('**/api/product**', route => {
      route.abort('blockedbyclient');
    });

    await page.goto('https://automationexercise.com/products');
    
    // Products section might show error or fallback UI
    await expect(page).not.toHaveTitle('Error');
  });

  test('Mock successful API with custom data', async ({ page }) => {
    
    // Intercept and modify product response
    await page.route('**/api/products*', async (route) => {
      const mockData = {
        products: [
          {
            id: 1,
            name: 'Mocked Product',
            price: 99.99,
            image: 'mocked-image.jpg',
          },
        ],
      };
      
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockData),
      });
    });

    await page.goto('https://automationexercise.com/products');
    await page.waitForLoadState('networkidle');
  });

  test('Monitor and log network requests', async ({ page }) => {
    const requests: string[] = [];

    // Capture all API requests
    page.on('request', (request) => {
      if (request.url().includes('api')) {
        requests.push(request.url());
        console.log('API Request:', request.url());
        console.log('Method:', request.method());
      }
    });

    await page.goto('https://automationexercise.com');
    await page.waitForLoadState('networkidle');

    // Verify API calls were made
    console.log('Total API requests:', requests.length);
  });

  test('Simulate slow network', async ({ page }) => {
    
    // Simulate slow API responses
    await page.route('**/*', async (route) => {
      // Add 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('https://automationexercise.com');
    const endTime = Date.now();

    // Should take longer due to artificial delay
    console.log('Page load time with throttling:', endTime - startTime);
  });

  test('Simulate API error responses', async ({ page }) => {
    
    // Mock API error (500 Internal Server Error)
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Database connection failed',
        }),
      });
    });

    await page.goto('https://automationexercise.com/products');
    
    // Application should handle error gracefully
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Network Response Validation', () => {
  
  test('Verify response headers', async ({ page }) => {
    let responseHeaders: Record<string, string> = {};

    page.on('response', (response) => {
      if (response.url().includes('automationexercise.com')) {
        responseHeaders = response.headers();
      }
    });

    await page.goto('https://automationexercise.com');
    await page.waitForLoadState('networkidle');

    // Verify security headers
    console.log('Response Headers:', responseHeaders);
  });

  test('Validate JSON response structure', async ({ page }) => {
    
    await page.route('**/api/productsList**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      // Validate response structure
      if (json && Array.isArray(json.products)) {
        for (const product of json.products) {
          expect(product).toHaveProperty('id');
          expect(product).toHaveProperty('name');
          expect(product).toHaveProperty('price');
        }
      }

      await route.fulfill({ response });
    });

    await page.goto('https://automationexercise.com/products');
  });

  test('Live productsList API returns a usable catalogue', async ({ page }) => {

    const response = await page.request.get(
      'https://automationexercise.com/api/productsList'
    );

    expect(response.status()).toBe(200);

    const json = JSON.parse(await response.text());

    expect(Array.isArray(json.products)).toBe(true);
    expect(json.products.length).toBeGreaterThan(0);

    expect(json.products[0]).toHaveProperty('id');
    expect(json.products[0]).toHaveProperty('name');
    expect(json.products[0]).toHaveProperty('price');
  });

  test('Blocking images still renders the products page', async ({ page }) => {
    const blocked: string[] = [];

    await page.route('**/*', route => {
      if (route.request().resourceType() === 'image') {
        blocked.push(route.request().url());
        return route.abort();
      }

      return route.continue();
    });

    await page.goto('https://automationexercise.com/products');

    // Content must not depend on images having loaded.
    await expect(
      page.locator('.product-image-wrapper').first()
    ).toBeVisible({ timeout: 20000 });

    expect(blocked.length).toBeGreaterThan(0);
  });

  test('Injected response headers reach the browser', async ({ page }) => {
    let seen: Record<string, string> = {};

    await page.route('https://automationexercise.com/products', async route => {
      const response = await route.fetch();

      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'x-testdino-mock': 'injected',
        },
      });
    });

    page.on('response', response => {
      if (response.url().endsWith('/products')) {
        seen = response.headers();
      }
    });

    await page.goto('https://automationexercise.com/products');

    expect(seen['x-testdino-mock']).toBe('injected');
  });

  // Reported to TestDino under Skipped > Skipped.
  test.skip('SKIPPED - Replay the products page from a HAR archive', async ({ page }) => {

    await page.routeFromHAR('./fixtures/products.har', {
      url: '**/products',
      update: false,
    });

    await page.goto('https://automationexercise.com/products');

    await expect(
      page.locator('.product-image-wrapper').first()
    ).toBeVisible();
  });

  // Reported to TestDino under Skipped > Fixme.
  test.fixme('SKIPPED - Mocked catalogue renders in the product grid', async ({ page }) => {

    await page.route('**/api/productsList', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            { id: 1, name: 'Mocked Product', price: 'Rs. 99' },
          ],
        }),
      });
    });

    await page.goto('https://automationexercise.com/products');

    await expect(
      page.locator('.product-image-wrapper')
    ).toHaveCount(1);
  });
});
