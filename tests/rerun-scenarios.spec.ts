import { expect, test } from '@testdino/playwright';
test.describe('rerun-scenarios', () => {
  test('keep me', async () => { expect(1).toBe(2); });
  test('rename me', async () => { expect(1).toBe(2); });
  test('move me', async () => { expect(1).toBe(2); });
  test('delete me', async () => { expect(1).toBe(2); });
  test('exclude me', async () => { expect(1).toBe(2); });
});
