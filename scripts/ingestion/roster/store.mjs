import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ulid } from "../types.mjs";
import { normalizeName } from "./identity.mjs";

const repoRoot = resolve(new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const rosterDir = resolve(repoRoot, "data", "rosters");

const files = {
  players: "players.json",
  snapshots: "roster-snapshots.json",
  teamSeasons: "team-seasons.json",
  edges: "player-team-seasons.json",
  reviews: "review-queue-items.json"
};

async function readJson(name, fallback) {
  const filePath = resolve(rosterDir, name);
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(name, value) {
  await mkdir(rosterDir, { recursive: true });
  await writeFile(resolve(rosterDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export class FileRosterStore {
  async playersByNameBlock(normalizedName) {
    const players = await readJson(files.players, []);
    return players.filter((player) => normalizeName(player.name_canonical) === normalizedName || (player.aliases ?? []).some((alias) => normalizeName(alias) === normalizedName));
  }

  async upsertPlayer(player) {
    const players = await readJson(files.players, []);
    const index = players.findIndex((item) => item.id === player.id);
    if (index >= 0) players[index] = player;
    else players.push(player);
    await writeJson(files.players, players);
    return player;
  }

  async insertSnapshot(snapshot) {
    const snapshots = await readJson(files.snapshots, []);
    snapshots.push(snapshot);
    await writeJson(files.snapshots, snapshots);
  }

  async insertEdge(edge) {
    const edges = await readJson(files.edges, []);
    const exists = edges.some((item) => item.player_id === edge.player_id && item.team_season_id === edge.team_season_id && item.roster_snapshot_id === edge.roster_snapshot_id);
    if (!exists) edges.push(edge);
    await writeJson(files.edges, edges);
  }

  async enqueueReview(item) {
    const reviews = await readJson(files.reviews, []);
    reviews.push(item);
    await writeJson(files.reviews, reviews);
  }

  async resolveTeamSeason(args) {
    const seasons = await readJson(files.teamSeasons, []);
    const id = `TS_${args.team_id}_${args.season.id}`.replace(/[^A-Za-z0-9_-]/g, "_");
    const existing = seasons.find((item) => item.id === id);
    if (existing) return existing;
    const teamSeason = {
      id,
      team_id: args.team_id,
      school_id: args.school_id,
      season_id: args.season.id,
      sport: args.sport,
      gender: args.gender,
      level: args.level,
      source_url: args.source_url,
      confidence: 0.85
    };
    seasons.push(teamSeason);
    await writeJson(files.teamSeasons, seasons);
    return teamSeason;
  }
}

export async function getRosterBackfillState() {
  return {
    players: await readJson(files.players, []),
    snapshots: await readJson(files.snapshots, []),
    teamSeasons: await readJson(files.teamSeasons, []),
    edges: await readJson(files.edges, []),
    reviews: await readJson(files.reviews, [])
  };
}

export function makePlayerId(nameRaw, schoolId, gradYear) {
  return `PL_${normalizeName(nameRaw).replace(/[^a-z0-9]+/g, "_")}_${schoolId}_${gradYear ?? "unknown"}`.slice(0, 120);
}

export function makeImportSession(source, url) {
  return {
    id: ulid("IS_"),
    source_id: source.id,
    source_url: url,
    fetched_at: new Date().toISOString(),
    parser_version: "roster-0.1.0"
  };
}
