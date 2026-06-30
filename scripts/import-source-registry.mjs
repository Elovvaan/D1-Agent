#!/usr/bin/env node
import { parseArgs, readSourceRegistry, runDeepDiscovery, writeDeepImportResult } from "./public-deep-discovery.mjs";

const args = parseArgs(process.argv.slice(2));

function matchesFilter(source) {
  if (source.enabled === false) return false;
  if (args.state && String(source.state ?? "").toLowerCase() !== args.state.toLowerCase()) return false;
  if (args["source-type"] && String(source.source_type ?? "").toLowerCase() !== args["source-type"].toLowerCase()) return false;
  if (args.sport) {
    const sports = Array.isArray(source.sports_supported) ? source.sports_supported.map((sport) => String(sport).toLowerCase()) : [];
    if (sports.length && !sports.includes(args.sport.toLowerCase())) return false;
  }
  return true;
}

try {
  const sources = (await readSourceRegistry()).filter(matchesFilter);
  if (!sources.length) {
    console.log("No enabled public sources matched the registry filters.");
    process.exit(0);
  }

  let discoveredLinks = 0;
  let importedRecords = 0;
  let reviewRecords = 0;
  for (const source of sources) {
    const result = await runDeepDiscovery(source);
    const path = await writeDeepImportResult(result);
    discoveredLinks += result.discoveredLinks.length;
    importedRecords += result.entities.length;
    reviewRecords += result.reviewQueue.length;
    console.log(`${source.source_name}: ${result.entities.length} records, ${result.reviewQueue.length} review, ${result.discoveredLinks.length} links -> ${path}`);
  }
  console.log(`Registry import complete: ${sources.length} source(s)`);
  console.log(`Discovered links: ${discoveredLinks}`);
  console.log(`Records imported: ${importedRecords}`);
  console.log(`Records requiring review: ${reviewRecords}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
