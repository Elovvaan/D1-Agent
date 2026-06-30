import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rosterDir = resolve(process.cwd(), "..", "data", "rosters");

function readJson<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(rosterDir, fileName);
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getRosterBackfillDashboard() {
  const players = readJson<Array<{ id: string; name_canonical: string; graduation_year?: number; roster_status: string; review_status: string; source_urls?: string[] }>>("players.json", []);
  const snapshots = readJson<Array<{ id: string; source_url: string; fetched_at: string; row_count: number; parsed_status: string }>>("roster-snapshots.json", []);
  const teamSeasons = readJson<Array<{ id: string; season_id: string; sport: string; gender: string; level: string }>>("team-seasons.json", []);
  const edges = readJson<Array<{ id: string; player_id: string; team_season_id: string; class_year_normalized: string; source_url: string }>>("player-team-seasons.json", []);
  const reviews = readJson<Array<{ id: string; ref_type?: string; ref_id?: string; reason?: string }>>("review-queue-items.json", []);
  return { players, snapshots, teamSeasons, edges, reviews };
}
