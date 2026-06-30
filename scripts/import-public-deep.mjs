#!/usr/bin/env node
import { parseArgs, runDeepDiscovery, writeDeepImportResult } from "./public-deep-discovery.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.url) {
  console.error("Provide a public school or athletics URL to import real data.");
  process.exit(1);
}

try {
  const result = await runDeepDiscovery(args.url);
  const path = await writeDeepImportResult(result);
  console.log(`Deep import complete: ${result.runId}`);
  console.log(`Source URL: ${result.sourceUrl}`);
  console.log(`Discovered links: ${result.discoveredLinks.length}`);
  console.log(`Records imported: ${result.entities.length}`);
  console.log(`Records requiring review: ${result.reviewQueue.length}`);
  console.log(`Artifact: ${path}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
