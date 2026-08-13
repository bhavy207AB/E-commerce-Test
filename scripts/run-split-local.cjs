#!/usr/bin/env node

// Runs the same split group as .github/workflows/testdino-split-staging.yml,
// locally and in one command. Keep the legs below in sync with that matrix.
//
//   node scripts/run-split-local.cjs              # all four legs
//   node scripts/run-split-local.cjs --dry-run    # print the commands only
//   node scripts/run-split-local.cjs --leg 1 --leg 3
//
// The legs share one --split-id so they aggregate into a single logical run,
// and each split carries its own --ci-run-id so the two shards of split 2 merge
// into split 2 and nowhere else.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const LEGS = [
  {
    name: 'split 1/3 (unsharded)',
    split: '1/3',
    ci: '1',
    shard: null,
    specs: ['tests/API/ProductAPI.spec.ts', 'tests/API/product.spec.ts'],
  },
  {
    name: 'split 2/3 shard 1/2',
    split: '2/3',
    ci: '2',
    shard: '1/2',
    specs: ['tests/additional-500-suites.spec.ts'],
  },
  {
    name: 'split 2/3 shard 2/2',
    split: '2/3',
    ci: '2',
    shard: '2/2',
    specs: ['tests/additional-500-suites.spec.ts'],
  },
  {
    name: 'split 3/3 (unsharded)',
    split: '3/3',
    ci: '3',
    shard: null,
    specs: ['tests/login.spec.ts', 'tests/addToCart.spec.ts'],
  },
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const selected = [];

for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--leg' && index + 1 < args.length) {
    selected.push(Number(args[index + 1]));
    index += 1;
  }
}

const legs = selected.length
  ? selected.map(number => LEGS[number - 1]).filter(Boolean)
  : LEGS;

if (!legs.length) {
  console.error(`No legs selected. Valid --leg values are 1..${LEGS.length}.`);
  process.exit(1);
}

// Every leg of one invocation shares this. Overridable so a re-run can be
// attached to an existing group on purpose.
const splitId = process.env.TESTDINO_SPLIT_ID || `local-${Date.now()}`;

// The reporter resolves serverUrl as CLI > testdino.config > playwright.config
// > env, and playwright.config.ts hardcodes staging. Passing --server-url only
// when TESTDINO_SERVER_URL is set keeps the default local run on staging while
// still allowing an override, exactly as the workflow does.
const serverUrl = process.env.TESTDINO_SERVER_URL;

const cli = path.join('node_modules', '@testdino', 'playwright', 'bin', 'tdpw.js');

console.log(`Split group: ${splitId}`);
if (selected.length) {
  console.log(
    `Running ${legs.length} of ${LEGS.length} legs — the group stays open until every split reports.`
  );
}

let failures = 0;

for (const leg of legs) {
  const cliArgs = [cli, 'test', '--split', leg.split, '--split-id', splitId, '--ci-run-id', `${splitId}-${leg.ci}`];

  if (serverUrl) {
    cliArgs.push('--server-url', serverUrl);
  }

  if (leg.shard) {
    cliArgs.push(`--shard=${leg.shard}`);
  }

  cliArgs.push(...leg.specs);

  console.log(`\n=== ${leg.name} ===`);

  if (dryRun) {
    console.log(['node', ...cliArgs].join(' '));
    continue;
  }

  const result = spawnSync(process.execPath, cliArgs, {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Unable to start the CLI: ${result.error.message}`);
    process.exit(1);
  }

  // Don't stop on a failing leg: a missing split leaves the group open, which
  // is the same reason the workflow sets fail-fast: false.
  if (result.status !== 0) {
    failures += 1;
    console.error(`${leg.name} exited with code ${result.status}.`);
  }
}

if (failures) {
  console.error(`\n${failures} of ${legs.length} legs failed.`);
  process.exit(1);
}
