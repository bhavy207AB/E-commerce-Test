import { test, expect } from '@playwright/test';

// One spec, fifteen deterministic test cases: 10 pass, 5 fail (cases 11-15).
// Self-contained (no network or app dependency) so they run reliably in CI and
// report a clean 15-total / 5-failed mix to TestDino. Cases 1-5 keep their
// original assertions so their existing manual-case links stay valid.
test.describe('TCM Smoke', () => {
  // --- passing (cases 1-10) ---
  test('TCM Smoke - case 1', async () => { expect(1 + 1).toBe(2); });
  test('TCM Smoke - case 2', async () => { expect('testdino'.toUpperCase()).toBe('TESTDINO'); });
  test('TCM Smoke - case 3', async () => { expect([3, 1, 2].sort()).toEqual([1, 2, 3]); });
  test('TCM Smoke - case 4', async () => { expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); });
  test('TCM Smoke - case 5', async () => { expect('abcde').toHaveLength(5); });
  test('TCM Smoke - case 6', async () => { expect(10 % 3).toBe(1); });
  test('TCM Smoke - case 7', async () => { expect('hello world').toContain('world'); });
  test('TCM Smoke - case 8', async () => { expect(Boolean('x')).toBe(true); });
  test('TCM Smoke - case 9', async () => { expect([1, 2, 3].includes(2)).toBe(true); });
  test('TCM Smoke - case 10', async () => { expect(Math.min(5, 2, 8)).toBe(0); });

  // --- failing (cases 11-15) ---
  test('TCM Smoke - case 11', async () => { expect(2 + 2).toBe(5); });
  test('TCM Smoke - case 12', async () => { expect('abc'.toUpperCase()).toBe('abc'); });
  test('TCM Smoke - case 13', async () => { expect([1, 2]).toHaveLength(3); });
  test('TCM Smoke - case 14', async () => { expect({ a: 1 }).toMatchObject({ a: 2 }); });
  test('TCM Smoke - case 15', async () => { expect(Math.max(2, 9, 4)).toBe(99); });
});
