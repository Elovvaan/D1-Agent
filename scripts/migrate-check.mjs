import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../db/migrations/001_init.sql", import.meta.url), "utf8");
const requiredTables = [
  "users",
  "memberships",
  "athletes",
  "games",
  "streams",
  "highlights",
  "verification_requests",
  "trust_scores",
  "matches",
  "opportunities",
  "timeline_events",
  "data_sources",
  "entity_matches"
];

const missing = requiredTables.filter((table) => !migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`));
if (missing.length) {
  console.error(`Missing migration tables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Migration contract check passed.");

