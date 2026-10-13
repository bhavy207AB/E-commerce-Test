import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const STORE_URL = 'https://trace-demo.testdino.local/store';

const storePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>TestDino Trace Store</title>
    <style>
      body { font-family: system-ui; max-width: 760px; margin: 40px auto; color: #172033; }
      header, .toolbar, .product, form { display: flex; gap: 12px; align-items: center; }
      header { justify-content: space-between; }
      .toolbar { margin: 24px 0; }
      input, button { padding: 10px 12px; }
      .product { justify-content: space-between; border: 1px solid #ccd3df; padding: 16px; margin: 10px 0; }
      #cart, #checkout { margin-top: 28px; padding: 18px; background: #f3f6fa; }
      form { align-items: flex-start; flex-direction: column; }
      [hidden] { display: none !important; }
      .error { color: #b42318; }
      .success { color: #067647; font-weight: 700; }
    </style>
  </head>
  <body>
    <header>
      <h1>TestDino Trace Store</h1>
      <strong>Cart: <span data-testid="cart-count">0</span></strong>
    </header>

    <div class="toolbar">
      <label for="search">Search products</label>
      <input id="search" placeholder="e.g. headphones">
      <button id="search-button">Search</button>
    </div>

    <main id="products">
      <article class="product" data-name="Wireless Headphones">
        <div><h2>Wireless Headphones</h2><span>$79.00</span></div>
        <button class="add">Add to cart</button>
      </article>
      <article class="product" data-name="Mechanical Keyboard">
        <div><h2>Mechanical Keyboard</h2><span>$99.00</span></div>
        <button class="add">Add to cart</button>
      </article>
    </main>

    <p id="search-result" role="status"></p>
    <section id="cart" hidden>
      <h2>Your cart</h2>
      <p><span data-testid="cart-product"></span> — <span data-testid="cart-total"></span></p>
      <button id="checkout-button">Proceed to checkout</button>
    </section>

    <section id="checkout" hidden>
      <h2>Checkout</h2>
      <form id="checkout-form" novalidate>
        <label>Email <input id="email" name="email" type="email"></label>
        <label>Card number <input id="card" name="card" inputmode="numeric"></label>
        <button>Place order</button>
      </form>
      <p id="form-error" class="error" role="alert"></p>
      <p id="confirmation" class="success" role="status"></p>
    </section>

    <script>
      let selectedProduct = '';
      let selectedPrice = '';

      document.querySelector('#search-button').addEventListener('click', () => {
        const query = document.querySelector('#search').value.toLowerCase();
        let matches = 0;
        document.querySelectorAll('.product').forEach(product => {
          const visible = product.dataset.name.toLowerCase().includes(query);
          product.hidden = !visible;
          if (visible) matches += 1;
        });
        document.querySelector('#search-result').textContent = matches + ' product found';
      });

      document.querySelectorAll('.add').forEach(button => button.addEventListener('click', event => {
        const product = event.currentTarget.closest('.product');
        selectedProduct = product.dataset.name;
        selectedPrice = product.querySelector('span').textContent;
        document.querySelector('[data-testid="cart-count"]').textContent = '1';
        document.querySelector('[data-testid="cart-product"]').textContent = selectedProduct;
        document.querySelector('[data-testid="cart-total"]').textContent = selectedPrice;
        document.querySelector('#cart').hidden = false;
      }));

      document.querySelector('#checkout-button').addEventListener('click', () => {
        document.querySelector('#checkout').hidden = false;
        document.querySelector('#email').focus();
      });

      document.querySelector('#checkout-form').addEventListener('submit', event => {
        event.preventDefault();
        const email = document.querySelector('#email').value;
        const card = document.querySelector('#card').value;
        const error = document.querySelector('#form-error');
        if (!email.includes('@') || card.replace(/\\s/g, '').length !== 16) {
          error.textContent = 'Enter a valid email and 16-digit card number';
          return;
        }
        error.textContent = '';
        document.querySelector('#confirmation').textContent = 'Order TD-1042 confirmed for ' + selectedProduct;
      });
    </script>
  </body>
</html>`;

async function openTraceStore(page: Page) {
  await page.route(STORE_URL, route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: storePage,
  }));
  await page.goto(STORE_URL);
}

// Passing tests normally have no artifact with the project-wide
// "retain-on-failure" setting. Keep traces for this showcase file.
test.use({ trace: 'on' });

test.describe('TestDino trace showcase', () => {
  test('search and add a product to cart @trace', async ({ page }, testInfo) => {
    await test.step('Open the demo storefront', async () => {
      await openTraceStore(page);
      await expect(page.getByRole('heading', { name: 'TestDino Trace Store' })).toBeVisible();
    });

    await test.step('Search for wireless headphones', async () => {
      await page.getByLabel('Search products').fill('headphones');
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('status')).toContainText('1 product found');
      await expect(page.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeHidden();
    });

    await test.step('Add the matching product to the cart', async () => {
      const headphones = page.locator('.product').filter({ hasText: 'Wireless Headphones' });
      await headphones.getByRole('button', { name: 'Add to cart' }).click();
      await expect(page.getByTestId('cart-count')).toHaveText('1');
      await expect(page.getByTestId('cart-product')).toHaveText('Wireless Headphones');
      await expect(page.getByTestId('cart-total')).toHaveText('$79.00');
    });

    await testInfo.attach('cart-state.json', {
      body: JSON.stringify({ product: 'Wireless Headphones', quantity: 1, total: 79 }, null, 2),
      contentType: 'application/json',
    });
  });

  test('validate checkout and complete an order @trace', async ({ page }, testInfo) => {
    await test.step('Prepare a cart and open checkout', async () => {
      await openTraceStore(page);
      const keyboard = page.locator('.product').filter({ hasText: 'Mechanical Keyboard' });
      await keyboard.getByRole('button', { name: 'Add to cart' }).click();
      await page.getByRole('button', { name: 'Proceed to checkout' }).click();
      await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    });

    await test.step('Show validation feedback for invalid payment details', async () => {
      await page.getByLabel('Email').fill('invalid-email');
      await page.getByLabel('Card number').fill('1234');
      await page.getByRole('button', { name: 'Place order' }).click();
      await expect(page.getByRole('alert')).toHaveText('Enter a valid email and 16-digit card number');
    });

    await test.step('Correct the details and confirm the order', async () => {
      await page.getByLabel('Email').fill('trace@example.com');
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByRole('button', { name: 'Place order' }).click();
      await expect(page.locator('#confirmation')).toHaveText('Order TD-1042 confirmed for Mechanical Keyboard');
    });

    await testInfo.attach('order-summary.json', {
      body: JSON.stringify({ orderId: 'TD-1042', status: 'confirmed', total: 99 }, null, 2),
      contentType: 'application/json',
    });
  });
});

test.describe('TestDino failed test trace showcase', () => {
  test.describe.configure({ retries: 0 });

  test('failed product search captures a trace @trace @intentional-failure', async ({ page }) => {
    await test.step('Open the demo storefront and search for headphones', async () => {
      await openTraceStore(page);
      await page.getByLabel('Search products').fill('headphones');
      await page.getByRole('button', { name: 'Search' }).click();
    });

    await test.step('Verify an intentionally incorrect search result', async () => {
      await expect(page.getByRole('status')).toHaveText('2 products found');
    });
  });

  test('failed cart total captures a trace @trace @intentional-failure', async ({ page }) => {
    await test.step('Add wireless headphones to the cart', async () => {
      await openTraceStore(page);
      const headphones = page.locator('.product').filter({ hasText: 'Wireless Headphones' });
      await headphones.getByRole('button', { name: 'Add to cart' }).click();
      await expect(page.getByTestId('cart-product')).toHaveText('Wireless Headphones');
    });

    await test.step('Verify an intentionally incorrect cart total', async () => {
      await expect(page.getByTestId('cart-total')).toHaveText('$49.00');
    });
  });

  test('failed order confirmation captures a trace @trace @intentional-failure', async ({ page }) => {
    await test.step('Complete checkout with valid details', async () => {
      await openTraceStore(page);
      const keyboard = page.locator('.product').filter({ hasText: 'Mechanical Keyboard' });
      await keyboard.getByRole('button', { name: 'Add to cart' }).click();
      await page.getByRole('button', { name: 'Proceed to checkout' }).click();
      await page.getByLabel('Email').fill('trace@example.com');
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByRole('button', { name: 'Place order' }).click();
    });

    await test.step('Verify an intentionally incorrect order number', async () => {
      await expect(page.locator('#confirmation')).toHaveText(
        'Order TD-9999 confirmed for Mechanical Keyboard',
      );
    });
  });
});
