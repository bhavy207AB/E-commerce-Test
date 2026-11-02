import { test, expect } from '@playwright/test';

// Source spec for the rerun check: 6 tests, 2 deliberately failing so a
// `--rerun failed --from-run <id>` has something to re-run.
test.describe('Modes Rerun Source', () => {
  test('source - pass 1', async () => { expect(1).toBe(1); });
  test('source - pass 2', async () => { expect(2).toBe(2); });
  test('source - pass 3', async () => { expect(3).toBe(3); });
  test('source - pass 4', async () => { expect(4).toBe(4); });
  test('source - FAIL 1', async () => { expect(1).toBe(2); });
  test('source - FAIL 2', async () => { expect('a').toBe('b'); });
});
