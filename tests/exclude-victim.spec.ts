import { expect, test } from '@testdino/playwright';
test.describe('exclude-scenario', () => {
  test('excluded one', async () => { expect(1).toBe(2); });
});
