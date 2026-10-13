import { expect, test } from '@playwright/test';

const tagVariations = [
  ['@smoke'],
  ['@smoke', '@regression'],
  ['@smoke', '@regression', '@sanity'],
  ['@smoke', '@regression', '@sanity', '@E2E'],
  ['@smoke', '@regression', '@sanity', '@E2E', '@visual'],
];

const tagsFor = (testNumber: number) => tagVariations[(testNumber - 1) % tagVariations.length];

test.describe('500-case mixed TestDino verification', () => {
  test.describe('Passed cases', () => {
    for (let testNumber = 1; testNumber <= 300; testNumber += 1) {
      test(
        `PASSED - test case ${testNumber}`,
        { tag: tagsFor(testNumber) },
        async () => {
          expect(testNumber).toBeGreaterThan(0);
        },
      );
    }
  });

  test.describe('Failed cases', () => {
    for (let testNumber = 301; testNumber <= 400; testNumber += 1) {
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
    for (let testNumber = 401; testNumber <= 450; testNumber += 1) {
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

    for (let testNumber = 451; testNumber <= 475; testNumber += 1) {
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
    for (let testNumber = 476; testNumber <= 500; testNumber += 1) {
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
