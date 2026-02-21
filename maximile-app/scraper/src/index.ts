// =============================================================================
// MaxiMile Scraper — Entry Point
// =============================================================================
// Main entry point for the detection pipeline. Called by `npm start` (via tsx).
//
// This script:
//   1. Logs the start time
//   2. Runs the pipeline (fetch → hash → compare → store)
//   3. Logs completion
//   4. Exits with code 1 on failure (so GitHub Actions marks the job as failed)
// =============================================================================

import { runPipeline } from './pipeline.js';

async function main(): Promise<void> {
  console.log(
    `[MaxiMile Scraper] Starting pipeline at ${new Date().toISOString()}`
  );
  console.log(
    `[MaxiMile Scraper] Node ${process.version}, Platform: ${process.platform}`
  );

  await runPipeline();

  console.log(`[MaxiMile Scraper] Pipeline complete`);
}

main().catch((error) => {
  console.error('[MaxiMile Scraper] Pipeline failed:', error);
  process.exit(1);
});
