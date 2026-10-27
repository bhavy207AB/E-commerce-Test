# Swarm mode test scenario

These specs exist to exercise and verify **TestDino Swarm Mode**
(https://docs.testdino.com/guides/playwright-swarm-mode).

## Why six files of uneven weight?

Swarm distributes work **per spec file** — a machine takes the next whole spec
as it frees up. To actually observe dynamic distribution you need:

1. **More spec files than machines** (6 files, 4 machines) so some machines
   pick up a second file after finishing their first.
2. **Uneven per-file duration** so fast machines visibly do more work and the
   TestDino "imbalance badge" has something to report.

Each file carries a `WEIGHT_MS` delay that simulates a heavier/lighter suite:

| File             | Weight  | Role                          |
|------------------|---------|-------------------------------|
| swarm-01.spec.ts | ~1s     | fast                          |
| swarm-02.spec.ts | ~4s     | medium                        |
| swarm-03.spec.ts | ~8s     | slow (should land on a free machine) |
| swarm-04.spec.ts | ~1s     | fast                          |
| swarm-05.spec.ts | ~4s     | medium                        |
| swarm-06.spec.ts | ~8s     | slow                          |

Every test title is tagged `@swarm`, which is how the workflow's
`--grep "@swarm"` bounds the swarm to just these files (the repo also contains
5000-case suites we do not want pulled in).

## Run it

- **CI:** trigger the `TestDino Swarm Mode` workflow (`.github/workflows/testdino-swarm.yml`).
- **Local sanity check (no swarm, just that the specs pass):**
  `npx playwright test tests/Swarm --grep "@swarm" --project=chromium`
