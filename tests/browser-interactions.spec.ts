import { test, expect } from '@testdino/playwright';

/**
 * Advanced Browser Interactions
 * Learn: mouse/keyboard events, drag-drop, file uploads, dialogs, multi-tab
 */

// test.describe('Mouse & Keyboard Interactions', () => {
  
//   test('Hover over product and verify tooltip', async ({ page }) => {
//     await page.goto('https://automationexercise.com/products');
    
//     // Find first product
//     const firstProduct = page.locator('.product-image-wrapper').first();
    
//     // Hover to reveal tooltip/hidden elements
//     await firstProduct.hover();
    
//     // Verify add to cart button appears on hover
//     const addToCartBtn = firstProduct.locator('.add-to-cart-btn');
//     await expect(addToCartBtn).toBeVisible();
//   });

//   test('Right-click context menu', async ({ page }) => {
//     await page.goto('https://automationexercise.com/products');
    
//     const product = page.locator('.product-image-wrapper').first();
    
//     // Perform right-click
//     await product.click({ button: 'right' });
    
//     // Context menu might appear (browser-dependent)
//     console.log('Right-click performed');
//   });

//   test('Double-click interaction', async ({ page }) => {
//     await page.goto('https://automationexercise.com');
    
//     const element = page.locator('button').first();
    
//     // Perform double-click
//     await element.dblClick();
    
//     console.log('Double-click performed');
//   });

//   test('Keyboard shortcuts - type text with modifiers', async ({ page }) => {
//     await page.goto('https://automationexercise.com/products');
    
//     const searchInput = page.locator('#search_product');
//     await searchInput.focus();
    
//     // Type with keyboard events
//     await page.keyboard.type('Men Tshirt');
    
//     // Keyboard shortcut - Ctrl+A to select all
//     await page.keyboard.press('Control+A');
    
//     // Delete selected text
//     await page.keyboard.press('Delete');
    
//     // Verify text is cleared
//     await expect(searchInput).toHaveValue('en Tshirt');
//   });

//   test('Tab navigation through form fields', async ({ page }) => {
//     await page.goto('https://automationexercise.com/contact_us');
    
//     const nameInput = page.locator('input[name="name"]');
    
//     // Focus on first field
//     await nameInput.focus();
    
//     // Tab to next field
//     await page.keyboard.press('Tab');
    
//     // Verify focus moved
//     const emailInput = page.locator('input[name="email"]');
//     await expect(emailInput).toBeFocused();
//   });
// });

// test.describe('Drag and Drop', () => {
  
//   test('Drag product to cart (if available)', async ({ page }) => {
//     await page.goto('https://automationexercise.com/products');
    
//     const product = page.locator('.product-image-wrapper').first();
//     const cartIcon = page.locator('.cart-icon');
    
//     // Drag product to cart
//     await product.dragTo(cartIcon);
    
//     console.log('Drag and drop performed');
//   });

//   test('Reorder items using drag and drop', async ({ page }) => {
//     await page.goto('https://automationexercise.com/cart');
    
//     const cartItems = page.locator('.cart-item');
//     const itemCount = await cartItems.count();
    
//     if (itemCount >= 2) {
//       const firstItem = cartItems.nth(0);
//       const secondItem = cartItems.nth(1);
      
//       // Drag first item to second position
//       await firstItem.dragTo(secondItem);
      
//       console.log('Items reordered');
//     }
//   });
// });

test.describe('File Upload', () => {
  
  test('Upload profile picture', async ({ page }) => {
    await page.goto('https://automationexercise.com');
    
    // Find file input (if exists in contact form)
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Create a test file
      const filePath = '/tmp/test-image.png';
      
      // Upload file
      await fileInput.setInputFiles(filePath);
      
      // Verify file was uploaded
      console.log('File uploaded successfully');
    }
  });
});

test.describe('Modal & Dialog Handling', () => {
  
  test('Handle alert dialogs', async ({ page }) => {
    // Listen for dialog events
    page.once('dialog', dialog => {
      console.log('Dialog type:', dialog.type());
      console.log('Dialog message:', dialog.message());
      
      // Dismiss alert
      dialog.dismiss();
    });

    // Find element that triggers alert
    const alertBtn = page.locator('[onclick*="alert"]').first();
    
    if (await alertBtn.isVisible()) {
      await alertBtn.click();
    }
  });

  test('Handle confirmation dialogs', async ({ page }) => {
    // Accept confirmation
    page.once('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.accept();
    });

    // Trigger dialog
    await page.evaluate(() => {
      if (confirm('Do you want to continue?')) {
        console.log('User confirmed');
      }
    });
  });

  test('Handle prompt dialogs', async ({ page }) => {
    page.once('dialog', dialog => {
      expect(dialog.type()).toBe('prompt');
      dialog.accept('User Input Text');
    });

    await page.evaluate(() => {
      const userInput = prompt('Enter your name:');
      console.log('User entered:', userInput);
    });
  });
});

test.describe('Multiple Tabs/Windows', () => {
  
//   test('Open link in new tab and verify', async ({ page, context }) => {
//     await page.goto('https://automationexercise.com');
    
//     // Get link that opens in new tab
//     const newTabPromise = context.waitForEvent('page');
    
//     // Click link with target="_blank"
//     await page.click('a[target="_blank"]');
    
//     // Wait for new page
//     const newPage = await newTabPromise;
    
//     // Verify new page
//     expect(newPage.url()).not.toBe(page.url());
    
//     // Interact with new page
//     await newPage.waitForLoadState('load');
//     console.log('New tab URL:', newPage.url());
    
//     // Close new tab
//     await newPage.close();
//   });

  test('Switch between multiple tabs', async ({ page, context }) => {
    await page.goto('https://automationexercise.com');
    
    // Open multiple tabs
    const page2 = await context.newPage();
    const page3 = await context.newPage();
    
    await page2.goto('https://automationexercise.com/products');
    await page3.goto('https://automationexercise.com/contact_us');
    
    // Switch between pages
    expect(page.url()).toContain('automationexercise.com');
    expect(page2.url()).toContain('/products');
    expect(page3.url()).toContain('/contact_us');
    
    // Close additional pages
    await page2.close();
    await page3.close();
  });
});

test.describe('Keyboard, Hover & Scrolling', () => {

  test('Search typed on the keyboard returns matching results', async ({ page }) => {
    await page.goto('https://automationexercise.com/products');

    const searchInput = page.locator('#search_product');

    await searchInput.click();

    await page.keyboard.type('Tshirt');

    // The search box is not wired to submit on Enter, so the button is the
    // only way to run the query.
    await page.locator('#submit_search').click();

    await expect(
      page.getByRole('heading', { name: 'Searched Products' })
    ).toBeVisible({ timeout: 20000 });

    await expect(
      page.locator('.product-image-wrapper').first()
    ).toBeVisible();
  });

  test('Clearing the search box with Ctrl+A then Delete', async ({ page }) => {
    await page.goto('https://automationexercise.com/products');

    const searchInput = page.locator('#search_product');

    await searchInput.click();

    await page.keyboard.type('Men Tshirt');

    await expect(searchInput).toHaveValue('Men Tshirt');

    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Delete');

    await expect(searchInput).toHaveValue('');
  });

  test('Hovering a product exposes a working overlay add-to-cart', async ({ page }) => {
    await page.goto('https://automationexercise.com/products');

    const firstProduct = page.locator('.product-image-wrapper').first();

    await expect(firstProduct).toBeVisible({ timeout: 20000 });

    const overlayButton = firstProduct.locator(
      '.overlay-content .add-to-cart'
    );

    // The overlay sits behind the product tile until the tile is hovered, so
    // the click only lands once the hover has raised it.
    await firstProduct.hover();

    await overlayButton.click();

    await expect(
      page.locator('#cartModal')
    ).toBeVisible({ timeout: 20000 });

    await expect(
      page.locator('#cartModal')
    ).toContainText('Added!');
  });

  // Reported to TestDino under Skipped > Skipped.
  test.skip('SKIPPED - Upload a profile picture', async ({ page }) => {

    await page.goto('https://automationexercise.com/contact_us');

    await page.locator('input[type="file"]')
      .setInputFiles('./fixtures/test-image.png');

    await expect(
      page.locator('input[type="file"]')
    ).not.toHaveValue('');
  });

  // Reported to TestDino under Skipped > Fixme.
  test.fixme('SKIPPED - Drag a product onto the cart icon', async ({ page }) => {

    await page.goto('https://automationexercise.com/products');

    await page.locator('.product-image-wrapper').first()
      .dragTo(page.locator('a[href="/view_cart"]').first());

    await expect(
      page.locator('#cartModal')
    ).toBeVisible();
  });
});
