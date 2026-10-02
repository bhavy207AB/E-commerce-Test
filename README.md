[![Test Health](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf) [![Flaky Tests](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg?type=flaky)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf) [![Test Result](https://stg-user.testdino.com/api/v1/badge/project_961d2dd71e1c21b844676ddf.svg?type=tests)](https://stg-frontend.testdino.com/org_63bfc5f9ad53d2487b4f8a47/projects/project_961d2dd71e1c21b844676ddf)
# E-commerce-Test

## Running tests

Run the suite with:

```bash
npm test
```

Tests run in CI via the Playwright Tests workflow on every push to `main` and
`STAGGING`. On staging the product suite runs through the TestDino CLI across
two shards, each using two Playwright workers, grouped into a single logical
run.

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
