import { test, expect } from '@playwright/test';

// TDV2-1110 repro, file A. Mixes untitled, named and nested describes.
// Expectation after the fix: every test below is filed under THIS spec file
// (tdv2-1110-a.spec.ts), never in a nameless top-level group.

// 1) Untitled describe — the bug trigger. Playwright drops its title from the
//    test's title path, so ingestion used to detach these into a nameless group.
test.describe(() => {
  test('A untitled - case 1', async () => { expect(1 + 1).toBe(2); });
  test('A untitled - case 2', async () => { expect('a').toHaveLength(1); });
});

// 2) Named describe — control; always grouped correctly.
test.describe('A Named Group', () => {
  test('A named - case 1', async () => { expect([1, 2]).toHaveLength(2); });
  test('A named - case 2', async () => { expect(Math.max(1, 5)).toBe(5); });
});

// 3) Named describe nested inside an untitled describe.
test.describe(() => {
  test.describe('A Nested Named', () => {
    test('A nested-named - case 1', async () => { expect(true).toBe(true); });
  });
});

// 4) Untitled describe nested inside a named describe.
test.describe('A Outer Named', () => {
  test.describe(() => {
    test('A untitled-nested - case 1', async () => { expect('x').toContain('x'); });
  });
});
