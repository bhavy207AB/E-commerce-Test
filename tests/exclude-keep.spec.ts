import { expect, test } from '@testdino/playwright';
test.describe('exclude-scenario', () => {
  test('stays A', async () => { expect(1).toBe(2); });
  test('stays B', async () => { expect(1).toBe(2); });
  test('stays C', async () => { expect(1).toBe(2); });
  test('stays D', async () => { expect(1).toBe(2); });
});
