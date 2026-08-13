# TestDino split-mode against staging

Manual validation of `@testdino/playwright` **splitted mode** (`--split` /
`--split-id`) against the TestDino **staging** reporter, using a mix of sharded
and unsharded splits.

Workflow: `.github/workflows/testdino-split-staging.yml` (run it from the
Actions tab — `workflow_dispatch` only).

## What "split mode" is

Splitting lets one logical TestDino run be produced by several *independent*
CLI invocations that don't share a Playwright process — different spec sets,
different machines, even different repos. Sharding (`--shard=i/n`) is
Playwright's own mechanism and works *inside* a split.

Two ids carry the contract:

| Flag | Env fallback | Meaning |
| --- | --- | --- |
| `--split <current>/<total>` | — | Which split this leg is, and how many the group has. `current` and `total` are positive integers, `current <= total`. |
| `--split-id <id>` | `TESTDINO_SPLIT_ID` | Group id. **Every** leg of the same logical run passes the *same* value. |
| `--ci-run-id <id>` | `TESTDINO_CI_RUN_ID` | Per-split run id. All shards of one split share it; different splits must differ. |

Rules that fall out of that:

- Same `--split-id` across all legs → one aggregated run in the dashboard.
- `--ci-run-id` **unique per split, shared per shard**. Split 2's two shards use
  the same `--ci-run-id` so they merge into split 2 — and only into split 2.
- `--split` without a split id (flag or `TESTDINO_SPLIT_ID`) is an error; the
  CLI refuses rather than silently reporting an ungrouped run.
- The group is only complete when all `total` splits report. A missing leg
  leaves the run open until the server's idle reaper finalizes it — which is why
  the workflow sets `cancel-in-progress: false`.

## Matrix in this repo

One workflow run == one split group (`SPLIT_ID = gh-<run_id>-<run_attempt>`).

| Leg | `--split` | `--ci-run-id` suffix | `--shard` | Specs |
| --- | --- | --- | --- | --- |
| split 1/3 (unsharded) | `1/3` | `-1` | — | `tests/API/ProductAPI.spec.ts`, `tests/API/product.spec.ts` |
| split 2/3 shard 1/2 | `2/3` | `-2` | `1/2` | `tests/additional-500-suites.spec.ts` |
| split 2/3 shard 2/2 | `2/3` | `-2` | `2/2` | `tests/additional-500-suites.spec.ts` |
| split 3/3 (unsharded) | `3/3` | `-3` | — | `tests/login.spec.ts`, `tests/addToCart.spec.ts` |

`max-parallel: 1` serializes the legs on purpose: the suite drives the public
demo storefront at `storedemo.testdino.com`, and concurrent browser legs make
one leg time out and report 0 tests — which looks like a split bug but isn't.

`fail-fast: false` keeps a failing split from cancelling its siblings, so a real
failure still produces a complete group.

## Setup

### Repository secrets

| Secret | Value |
| --- | --- |
| `TESTDINO_STAGING_URL` | Staging data-handler base URL, e.g. `https://stg-analytics.testdino.com` |
| `TESTDINO_STAGING_TOKEN` | Project API key issued by staging |

The `preflight` job POSTs `/api/v1/reporter/auth` and fails the run before any
browser starts if either secret is missing or rejected. It deliberately does not
echo the response body — that payload carries Kafka SASL credentials.

A non-200 there usually means one of:

- wrong URL or token,
- the token belongs to production rather than staging,
- `stg-data-handler` is advertising a Kafka broker address that isn't reachable
  from GitHub-hosted runners (`KAFKA_CLI_BROKERS` must be the public one).

### Server URL resolution

The reporter resolves `serverUrl` as **CLI > testdino.config > playwright.config
> env**. `playwright.config.ts` hardcodes a `serverUrl`, so it outranks
`TESTDINO_SERVER_URL` — setting the env var alone would *not* redirect the run.
The workflow therefore passes `--server-url "$TESTDINO_SERVER_URL"` on every
leg, which sits at the top of that order. Do the same in any local run;
`utils/.env` points `TESTDINO_SERVER_URL` at production.

### The CLI

`--split` landed in `@testdino/playwright` 2.3.0 and is published on npm, so the
repo takes it straight from the registry:

```json
"@testdino/playwright": "^2.3.1"
```

An earlier revision of this branch vendored a `testdino-playwright-2.3.0.tgz`
tarball as a `file:` dependency, because the flags predated the release. That is
no longer necessary — the tarball is gone and `npm ci` + `npx tdpw` resolve the
published build. Verify with:

```bash
npx tdpw test --help   # must list --split / --split-id
```

## Running it locally

`npm run test:split` runs the same four legs as the workflow, in order, under
one generated split id — the local equivalent of one workflow run:

```bash
npm run test:split              # all four legs
npm run test:split:dry          # print the commands without running them
node scripts/run-split-local.cjs --leg 1 --leg 3   # a subset
```

`scripts/run-split-local.cjs` holds the leg table; keep it in sync with the
workflow matrix. It leaves `serverUrl` to `playwright.config.ts` (staging)
unless `TESTDINO_SERVER_URL` is set, in which case it forwards `--server-url`
exactly as CI does. `TESTDINO_SPLIT_ID` overrides the generated group id when
you want to attach a run to an existing group. Selecting a subset of legs leaves
the group short a split — expect it to stay open until the reaper fires.

The equivalent by hand:

```bash
export TD=https://stg-analytics.testdino.com
export TESTDINO_TOKEN=<staging token>
SPLIT_ID="local-$(date +%s)"

npx tdpw test --server-url "$TD" --split 1/3 --split-id "$SPLIT_ID" --ci-run-id "$SPLIT_ID-1" \
  tests/API/ProductAPI.spec.ts tests/API/product.spec.ts
npx tdpw test --server-url "$TD" --split 2/3 --split-id "$SPLIT_ID" --ci-run-id "$SPLIT_ID-2" \
  --shard=1/2 tests/additional-500-suites.spec.ts
npx tdpw test --server-url "$TD" --split 2/3 --split-id "$SPLIT_ID" --ci-run-id "$SPLIT_ID-2" \
  --shard=2/2 tests/additional-500-suites.spec.ts
npx tdpw test --server-url "$TD" --split 3/3 --split-id "$SPLIT_ID" --ci-run-id "$SPLIT_ID-3" \
  tests/login.spec.ts tests/addToCart.spec.ts
```

## What to check on the dashboard

1. **One** run for the group, not four.
2. Its split count reads 3/3 — not 4 (shards must not inflate the split total).
3. Split 2 holds the union of both shards' tests, with no duplicates.
4. Totals equal the sum of the four legs' local results.
5. Trace/video/screenshot attachments resolve on failures from every leg.
6. Re-running the workflow produces a *separate* group (`run_attempt` differs).

## Known sharp edges

- Keep the container image (`mcr.microsoft.com/playwright:v1.60.0-noble`) in
  sync with `@playwright/test` in `package-lock.json`; a mismatch fails at
  browser launch, not at install.
- `HOME: /root` is required — the Playwright image runs as root and the baked-in
  browsers live under `/root/.cache/ms-playwright`.
- A cancelled leg leaves the group short a split. Don't cancel the run; let it
  finish or wait out the reaper.
