import { expect, test } from '@playwright/test';

const tagVariations = [
  ['@smoke'],
  ['@smoke', '@regression'],
  ['@smoke', '@regression', '@sanity'],
  ['@smoke', '@regression', '@sanity', '@E2E'],
  ['@smoke', '@regression', '@sanity', '@E2E', '@visual'],
];

const suiteDefinitions = [
  { name: 'Authentication suite', start: 501 },
  { name: 'Product catalog suite', start: 601 },
  { name: 'Cart and checkout suite', start: 701 },
  { name: 'Order management suite', start: 801 },
  { name: 'Commerce API suite', start: 901 },
];

const tagsFor = (testNumber: number) => tagVariations[(testNumber - 1) % tagVariations.length];

for (const suiteDefinition of suiteDefinitions) {
  test.describe(suiteDefinition.name, () => {
    test.describe('Passed cases', () => {
      for (let offset = 0; offset < 60; offset += 1) {
        const testNumber = suiteDefinition.start + offset;

        test(
          `PASSED - test case ${testNumber}`,
          { tag: tagsFor(testNumber) },
          async () => {
            expect(testNumber).toBeGreaterThan(500);
          },
        );
      }
    });

    test.describe('Failed cases', () => {
      for (let offset = 60; offset < 80; offset += 1) {
        const testNumber = suiteDefinition.start + offset;

        test(
          `FAILED - test case ${testNumber}`,
          { tag: tagsFor(testNumber) },
          async () => {
            expect(`actual-${testNumber}`).toBe(`expected-${testNumber}`);
          },
        );
      }
    });

    test.describe('Known bug cases', () => {
      for (let offset = 80; offset < 90; offset += 1) {
        const testNumber = suiteDefinition.start + offset;

        test(
          `BUG - test case ${testNumber}`,
          {
            tag: tagsFor(testNumber),
            annotation: {
              type: 'bug',
              description: `Known product defect BUG-${testNumber}`,
            },
          },
          async () => {
            throw new Error(`Known product defect BUG-${testNumber} reproduced`);
          },
        );
      }
    });

    test.describe('Flaky cases', () => {
      test.describe.configure({ retries: 1 });

      for (let offset = 90; offset < 95; offset += 1) {
        const testNumber = suiteDefinition.start + offset;

        test(
          `FLAKY - test case ${testNumber}`,
          { tag: tagsFor(testNumber) },
          async ({}, testInfo) => {
            if (testInfo.retry === 0) {
              expect('first attempt').toBe('retry attempt');
            }
          },
        );
      }
    });

    test.describe('Skipped cases', () => {
      for (let offset = 95; offset < 100; offset += 1) {
        const testNumber = suiteDefinition.start + offset;

        test.skip(
          `SKIPPED - test case ${testNumber}`,
          { tag: tagsFor(testNumber) },
          async () => {
            expect(true).toBe(false);
          },
        );
      }
    });
  });
}
