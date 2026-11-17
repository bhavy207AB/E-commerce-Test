// @ts-check
import { devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Dedicated Playwright config for the TDV2-1084 "Run selected tests" dispatch
 * workflow only (.github/workflows/tdv2-1084-run-selected.yml). It extends the
 * base config with Firefox and WebKit projects so a TestDino selection whose
 * "Run in" picks those browsers can actually run them.
 *
 * It is intentionally separate from playwright.config.ts: the base config is
 * shared by other workflows that run `tdpw test` without --project, and adding
 * browser projects there would make them run 3x. This config is used only via
 * `tdpw test --config playwright.tdv2-1084.config.ts`.
 */
export default {
  ...base,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};
