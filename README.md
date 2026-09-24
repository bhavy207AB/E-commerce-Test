[![Test Health](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf) [![Flaky Tests](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg?type=flaky)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf) [![Test Result](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg?type=tests)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf)
# E-commerce-Test

## Running tests

Run the suite with:

```bash
npm test
```

The test entry point accepts Playwright's `--workers` option and also
normalizes the `--max-workers` spelling used by some hosted runners. For
example, both of these commands run with two Playwright workers:

```bash
npm test -- --workers=2
npm test -- --max-workers=2
```

## TestDino MCP

The project installs the latest compatible TestDino MCP release from npm and
configures Codex in `.codex/config.toml`. The project config runs the installed
package while retaining the `TESTDINO_PAT` and `TESTDINO_API_URL` from the
user's global `testdino-stg` Codex config. Credentials are not duplicated in
this repository.

After cloning or updating dependencies, run:

```bash
npm install
```

Restart Codex after installing so it reloads the project MCP configuration.

## Re-running failed tests

TestDino can re-execute only the failed or flaky cases from a finished run,
either on the original commit or on the current branch tip. Requires
`@testdino/playwright` >= 2.7.0 and Playwright >= 1.56 (both satisfied here).

### From the dashboard

The **Re-run** button sits next to *Debug with AI* on any finished run that has
at least one failed or flaky case. It dispatches
`.github/workflows/rerun.yml`, which declares the `testdino_rerun_*` inputs
TestDino fills in. Two things must be configured once in TestDino:

1. Project settings → Integrations → connect GitHub.
2. Grant the TestDino GitHub App permission to start workflows.

The repo also needs a `TESTDINO_TOKEN` secret (already used by the other
workflows). `TESTDINO_SERVER_URL` is an optional secret that points re-runs at
a non-production TestDino instance.

### From the CLI

No GitHub integration needed - copy `utils/.env.example` to `utils/.env`, add
your token, then:

```bash
npx tdpw test --rerun failed --from-run <runId>
```

`--rerun` takes `failed`, `flaky`, or `failed-and-flaky`. Narrow the selection
further with `--test-ids <ids>` (overrides the scope) or `--exclude-ids <ids>`.

### From an AI agent

The TestDino MCP server exposes `get_rerun_selection` to preview what would run
and `rerun_test` to trigger it.

### Caveat

Cases whose title contains the `›` separator, or has leading/trailing
whitespace, cannot be addressed reliably and get flagged for manual execution.
