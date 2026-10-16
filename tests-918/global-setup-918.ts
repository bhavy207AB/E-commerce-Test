// Fails before Playwright starts when FAIL_GLOBAL_SETUP=1 — mimics the ticket's
// job whose globalSetup login exhausted retries, so it never emits run:begin.
async function globalSetup() {
  if (process.env.FAIL_GLOBAL_SETUP === '1') {
    throw new Error('globalSetup: login failed after 3 retries (TDV2-918 repro)');
  }
}
export default globalSetup;
