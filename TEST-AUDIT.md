# Playwright Test Quality Audit — E2E Testing · main · 2026-09-22

## Executive Summary
The most critical problem is that the suite does not primarily test the product: by test count, >95% of cases are synthetic reporter-demonstration tests that manufacture pass/fail/flaky statuses for TestDino (e.g. `run-tag-filter-verification.spec.ts` = 500, `additional-500-suites.spec.ts` = 500), many of which assert `expect('actual').toBe('expected')` and fail by design. The chronic 16/16 failures TestDino flags in `run-tag-filter-verification.spec.ts` (203 affected tests) are exactly these. Genuine product confidence rests on ~25 hand-written tests — and several of those are shallow, stubbed, or end without validating the write they perform, including the single most important flow (checkout). This is the first recorded audit for `main`, so all findings are new; trend direction is a baseline.

## Category Snapshot
- surface_level_tests — critical (suite dominated by synthetic/no-assertion tests)
- missing_validation — critical (checkout write proves nothing; mock tests assert nothing)
- stability_issues — high (live third-party dependency, `networkidle`, CI retries=0)
- coverage_gaps — high (empty-body stubs; Security/Perf/a11y are single shallow tokens)
- setup_configuration — medium (prod reporter hardcoded, single browser, coverage global)
- hard_to_maintain — medium (hardcoded creds/URLs, no auth fixture)
- organization_ownership — medium (skip/fixme, folders implying absent coverage)
- duplication_overlap — medium (repeated login/nav setup, duplicate identities)

## Test Composition (genuine product tests only)
| Type | Count | Notes |
|---|---|---|
| Full user flows | 3 | Checkout, Add-to-cart, quantity bump — checkout ends with no assertion |
| Interactions | ~12 | api-mocking routes (7), browser-interactions dialogs/tabs/upload (~5) |
| Render checks | 1 | Visual snapshot (`product-card`), local-only |
| Page loads | 1 | Performance LCP observer |
| Accessibility | 1 | Single focus check (no axe scan) |
| Other / API / Security | ~7 | API contract checks, Security XSS + 1 stub |
| **Synthetic reporter specs** | **~1,140** | run-tag-filter (500), additional-500 (500), all-status-types (56), status-mix (50), testdino-filter (13), trace-showcase (5), etc. |

## Audit Coverage
Deep-read: `playwright.config.ts`, all four page objects (`Pages/*.ts`), and every genuine product spec (`login`, `addToCart`, `CheckoutPage`, `browser-interactions`, `api-mocking`, `API/*`, `Security/*`, `Performance/*`, `a11y/*`, `Visual Regression/*`). Sampled the synthetic reporter specs to confirm intent. Repo-wide sweeps: `waitForTimeout` (2, both in `testdino-filter-verification`), `page.$`/`$$`/`.all()` (0), `textContent()` (0), `.first()` (6, incl. page objects), `test.skip`/`fixme` (7), `networkidle` (4), total `expect(` (60 across the whole suite). No shared fixtures or `storageState` auth setup exist; `Pages/` is the only abstraction layer.

## Findings by severity

### Critical
1. **Suite is dominated by synthetic reporter-demo tests, not product tests.** ~1,140 of ~1,165 cases exist only to manufacture TestDino statuses and assert nothing about the application; many fail by design (`run-tag-filter-verification.spec.ts`, `additional-500-suites.spec.ts`, `testdino-filter-verification.spec.ts:4` `expect('actual assertion value').toBe('expected assertion value')`). Per the rubric (>half shallow ⇒ critical), suite-level confidence is invalidated and run health is meaningless (perpetual red).
2. **Checkout write flow ends with no outcome assertion.** `CheckoutPage.spec.ts:7-42` logs in, adds to cart, fills payment and clicks pay — then stops. `Pages/CheckoutPage.ts:41-45` `submitOrder()` only clicks `[data-qa="pay-button"]`. No confirmation URL, "Order Placed!" text, or order-id read-back. The most important e-commerce flow can pass while checkout is broken.

### High
3. **"Mock/network" tests assert nothing about the mocked behavior.** `api-mocking.spec.ts`: "Mock successful API with custom data" (23-46) fulfills a mock then only `waitForLoadState('networkidle')`; "Monitor and log network requests" (48-65), "Simulate slow network" (67-82), and "Verify response headers" (107-121) end in `console.log` with no `expect`. These include the suite's slowest tests (TestDino: ~23s / ~22s) yet prove nothing.
4. **`if (await x.isVisible())` guards let tests pass having done nothing.** `browser-interactions.spec.ts` "Upload profile picture" (117-133) wraps the whole upload in `if (await fileInput.isVisible())` — the input isn't on that page, so it green-passes as a no-op; "Handle alert dialogs" (138-154) is the same. `api-mocking.spec.ts:130` guards JSON assertions behind `if (Array.isArray(json.products))`.
5. **Empty-body stub tests register as passing coverage.** `API/ProductAPI.spec.ts:19-24` "checkout shows error on payment failure" is comments only; `Security/edge-cases.spec.ts:14-16` "session clears after logout" is empty. They report green and fabricate coverage for payment-error and session-security scenarios that are not tested.
6. **Genuine tests are coupled to a live third-party site with hardcoded URLs, ignoring `baseURL`.** `use.baseURL` is `storedemo.testdino.com/products` (`playwright.config.ts:52`) but every product test hardcodes `automationexercise.com` (`Pages/LoginPage.ts:8`, `CheckoutPage.spec.ts:14`, `addToCart.spec.ts:11,32`). Reliability depends on an external site's uptime/markup (reflected in the 51s avg "Add Product To Cart" and frequent failures), and `baseURL` is dead config.

### Medium
7. **Hardcoded credentials and card data in source.** `CheckoutPage.spec.ts:19-20` embeds a real email/password; `Pages/CheckoutPage.ts:22-38` embeds name/card/CVC/expiry. Move to `.env`/fixtures; never commit live creds.
8. **Config weakens signal.** `retries: isCI ? 0 : 2` (`playwright.config.ts:24`) gives CI zero retries so any flake reds the run, while local hides flakes with 2; reporter `serverUrl` hardcodes the prod fallback (34); single `chromium` project only (63-69) — no cross-browser; `coverage.enabled` is global (41-44) so every non-instrumented run logs "no coverage data".
9. **Discouraged synchronization.** `waitForLoadState('networkidle')` ×4 (`api-mocking.spec.ts:45,61,101,117`) is flake-prone on a live site; `waitForTimeout(2000)` (`testdino-filter-verification.spec.ts:19,54`).
10. **Security / Performance / a11y folders imply coverage that doesn't exist.** `Security` = 1 real XSS check + 1 empty stub; `Performance` = 1 brittle `PerformanceObserver` LCP test (`assertions.spec.ts:5-13`); `a11y` = 1 focus check (`Accessibility-auditing.spec.ts`) with **no axe scan** despite `@axe-core/playwright` being installed.
11. **Duplicated auth/nav setup, no shared fixture.** Every flow logs in and navigates from scratch (`login.spec.ts`, `CheckoutPage.spec.ts:14-21`, `addToCart.spec.ts`); TestDino shows two distinct "Login Test" identities. No `storageState` or auth fixture despite `Pages/` existing.

### Low
12. **API contract checks are shallow.** `API/ProductAPI.spec.ts:10-16` asserts only `status===200` and `body` contains the substring `"products"`; `API/product.spec.ts` only `console.log`s the body. No schema/field validation.

## Critical & High Issue Map
| Cluster | Scope | Why it matters | Strongest evidence |
|---|---|---|---|
| Synthetic-test dominance | ~1,140 cases across 8 specs | Run status is permanently red and product-meaningless | `run-tag-filter-verification.spec.ts` (500, 16/16 chronic fail), `testdino-filter-verification.spec.ts:4` |
| No write validation | Checkout + all mock tests | Core purchase + API behavior unproven | `CheckoutPage.spec.ts:41`, `Pages/CheckoutPage.ts:41-45`, `api-mocking.spec.ts:23-46,67-82` |
| No-op / stub greens | browser-interactions, API, Security | False coverage signals | `browser-interactions.spec.ts:117-133,138-154`, `API/ProductAPI.spec.ts:19-24`, `Security/edge-cases.spec.ts:14-16` |
| Live third-party coupling | All product specs / page objects | External-site fragility; `baseURL` ignored | `Pages/LoginPage.ts:8`, `CheckoutPage.spec.ts:14`, `playwright.config.ts:52` |

## Config Issues
- CI retries = 0 while local = 2 (`playwright.config.ts:24`) — inconsistent flake exposure.
- Reporter `serverUrl` hardcodes prod fallback (`:34`); environment selection relies on an untracked `utils/.env`.
- Single `chromium` project (`:63-69`) — no Firefox/WebKit/mobile.
- `coverage.enabled: true` global (`:41-44`) — noise on non-instrumented specs.
- Hardcoded secrets in specs/page objects (see Finding 7).

## Duplication & Overlap
- Login + navigation setup repeated in `login`, `addToCart`, `CheckoutPage` with no shared auth fixture or `storageState`.
- Two "Login Test" identities (`login.spec.ts` and a second historical spec) reported by TestDino.
- Multiple weak "mock API" variants in `api-mocking.spec.ts` overlap and could collapse into one asserted scenario.

## Recommendations
**Quick Wins**
- Add a real outcome assertion to checkout: assert the confirmation URL/`Order Placed!`/order id after `submitOrder()`.
- Delete or `test.fixme`-with-ticket the empty-body stubs (`API/ProductAPI.spec.ts:19`, `Security/edge-cases.spec.ts:14`) so they stop reporting green.
- Replace `if (await x.isVisible())` no-ops with explicit `await expect(...).toBeVisible()` (or remove).
- Move hardcoded creds/card data to `.env`/fixtures.

**Medium Effort**
- Quarantine the synthetic reporter specs behind a dedicated tag/project (e.g. `@reporter-demo`) excluded from the default run so `main` health reflects the product; keep them for TestDino demos only.
- Add assertions to every `page.route` mock test (assert rendered mock data / error UI); drop `networkidle` for explicit element/`waitForResponse` waits.
- Make CI retries consistent (1–2) and add at least one second browser project.

**Deep Refactors**
- Introduce a shared auth fixture + `storageState` so flows start authenticated; route product specs through `baseURL` instead of hardcoded `automationexercise.com`, or stand up the intended `storedemo.testdino.com` target.
- Build out real Security/Performance/a11y coverage (axe scan via the installed `@axe-core/playwright`, stable perf budgets), replacing token placeholders.

_A repo-wide critical sweep was performed; the two critical findings above are the material ones._
