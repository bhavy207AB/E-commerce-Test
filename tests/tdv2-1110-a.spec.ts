import { test, expect } from '@playwright/test';

// TDV2-1110 repro, file A. Mixes untitled, named and nested describes.
// After the fix every test below must be filed under THIS spec file
// (tdv2-1110-a.spec.ts), never in a nameless top-level group.

// 1) Untitled describe — the bug trigger. Playwright drops its title from the
//    test's path, so ingestion used to detach these into a nameless group.
test.describe(() => {
  test('Untitled describe > test files under its spec file (case 1)', async () => {
    expect(1 + 1).toBe(2);
  });
  test('Untitled describe > test files under its spec file (case 2)', async () => {
    expect('a').toHaveLength(1);
  });
});

// 2) Named describe — control; always grouped correctly.
test.describe('Named describe group', () => {
  test('Named describe > test groups normally (case 1)', async () => {
    expect([1, 2]).toHaveLength(2);
  });
  test('Named describe > test groups normally (case 2)', async () => {
    expect(Math.max(1, 5)).toBe(5);
  });
});

// 3) Named describe nested inside an untitled describe.
test.describe(() => {
  test.describe('Named inside untitled describe', () => {
    test('Named describe nested in an untitled describe stays under the file', async () => {
      expect(true).toBe(true);
    });
  });
});

// 4) Untitled describe nested inside a named describe.
test.describe('Named describe wrapping an untitled describe', () => {
  test.describe(() => {
    test('Untitled describe nested in a named describe stays under the file', async () => {
      expect('x').toContain('x');
    });
  });
});
