import { test, expect } from '@playwright/test';

// One spec, five deterministic test cases. These are self-contained (no network
// or app dependency) so they register reliably in TestDino and can be linked
// 1:1 to manual test cases for the "Run automated tests from TCM" feature.
test.describe('TCM Smoke', () => {
  test('TCM Smoke - case 1', async () => {
    expect(1 + 1).toBe(2);
  });

  test('TCM Smoke - case 2', async () => {
    expect('testdino'.toUpperCase()).toBe('TESTDINO');
  });

  test('TCM Smoke - case 3', async () => {
    expect([3, 1, 2].sort()).toEqual([1, 2, 3]);
  });

  test('TCM Smoke - case 4', async () => {
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });
  });

  test('TCM Smoke - case 5', async () => {
    expect('abcde').toHaveLength(5);
  });
});
