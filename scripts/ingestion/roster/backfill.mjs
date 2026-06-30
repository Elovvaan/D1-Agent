import { currentAcademicSeason, ulid } from "../types.mjs";
import { enumerateBackfillSeasons, candidateRosterUrls } from "./discover.mjs";
import { normalizePlayerClass, inferGraduationYear } from "./class_year.mjs";
import { createRosterSnapshot, linkPlayerToTeamSeason } from "./snapshot.mjs";
import { resolvePlayerIdentity, normalizeName } from "./identity.mjs";
import { classMatchesHistory, markGraduatedOrReturning } from "./progression.mjs";
import { makeImportSession, makePlayerId } from "./store.mjs";

function minIso(a, b) {
  return a < b ? a : b;
}

function maxIso(a, b) {
  return a > b ? a : b;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function makePlayer(nameRaw, level, schoolId, grad, fetchedAt, url) {
  return {
    id: makePlayerId(nameRaw, schoolId, grad.graduation_year),
    name_canonical: nameRaw.replace(/\s+/g, " ").trim(),
    name_raw: nameRaw,
    aliases: [],
    level,
    primary_school_id: schoolId,
    graduation_year: grad.graduation_year ?? undefined,
    graduation_year_confidence: grad.confidence,
    first_seen: fetchedAt,
    last_seen: fetchedAt,
    roster_status: "active",
    confidence: 0.9,
    review_status: "auto",
    source_urls: [url]
  };
}

function pickGradYear(existing, grad, level) {
  if (existing.graduation_year != null && existing.graduation_year_confidence >= 0.6) return existing.graduation_year;
  if (level === "hs" && grad.graduation_year != null) return grad.graduation_year;
  return existing.graduation_year ?? grad.graduation_year ?? undefined;
}

export class RosterBackfillEngine {
  constructor(fetchPort, store, adapter, parserVersion = "roster-0.1.0") {
    this.fetchPort = fetchPort;
    this.store = store;
    this.adapter = adapter;
    this.parserVersion = parserVersion;
  }

  async run(input) {
    const depth = input.depth ?? 3;
    const seasons = enumerateBackfillSeasons(input.currentSeason ?? currentAcademicSeason(), depth);
    const result = { seasons_attempted: 0, snapshots: 0, players_matched: 0, players_new: 0, edges: 0, review_items: 0, warnings: [] };
    const seenInCurrentPlayers = new Set();
    const seenInPriorPlayers = new Set();
    const touchedPlayers = new Map();
    for (const { season_id, url } of candidateRosterUrls(input.rosterUrlTemplate, seasons)) {
      const season = seasons.find((item) => item.id === season_id);
      result.seasons_attempted++;
      const fetched = await this.fetchPort(url);
      if (!fetched.ok) {
        result.warnings.push(`fetch_failed:${season_id}:${fetched.status}`);
        continue;
      }
      const parsed = this.adapter.parse(fetched.html, url);
      const session = makeImportSession(input.source, url);
      const teamSeason = await this.store.resolveTeamSeason({
        team_id: input.team_id,
        school_id: input.school_id,
        season,
        sport: parsed.sport ?? input.sport,
        gender: parsed.gender && parsed.gender !== "unknown" ? parsed.gender : input.gender,
        level: parsed.level === "unknown" ? "hs" : parsed.level,
        source_url: url
      });
      const snapshot = createRosterSnapshot({ parsed, teamSeason, session, source: input.source });
      await this.store.insertSnapshot(snapshot);
      result.snapshots++;
      if (parsed.level === "unknown" || !parsed.ok) {
        await this.store.enqueueReview({ id: ulid("RV_"), import_session_id: session.id, ref_type: "RosterSnapshot", ref_id: snapshot.id, reason: !parsed.ok ? "roster_parse_failed" : "roster_facets_unresolved", candidates: { warnings: parsed.warnings } });
        result.review_items++;
        continue;
      }
      await this.processRows({ parsed, teamSeason, snapshot, session, input, season, seenInCurrentPlayers, seenInPriorPlayers, touchedPlayers, result });
    }
    for (const player of touchedPlayers.values()) {
      const observedThisSeason = seenInCurrentPlayers.has(player.id);
      const hasPriorHistory = seenInPriorPlayers.has(player.id);
      const rollup = markGraduatedOrReturning({ player: { graduation_year: player.graduation_year, last_seen: player.last_seen, level: player.level }, currentSeason: input.currentSeason ?? currentAcademicSeason(), observedThisSeason });
      player.roster_status = rollup.status === "returning" && !hasPriorHistory ? "active" : rollup.status;
      await this.store.upsertPlayer(player);
      if (rollup.needsReview) {
        await this.store.enqueueReview({ id: ulid("RV_"), import_session_id: "", ref_type: "Player", ref_id: player.id, reason: rollup.reason ?? "eligible_but_absent_current_season" });
        result.review_items++;
      }
    }
    return result;
  }

  async processRows(ctx) {
    const { parsed, teamSeason, snapshot, session, input, season, seenInCurrentPlayers, seenInPriorPlayers, touchedPlayers, result } = ctx;
    const level = teamSeason.level;
    const isCurrent = season.is_current;
    for (const row of parsed.rows) {
      const cls = normalizePlayerClass(row.class_year_raw, level);
      const grad = inferGraduationYear({ resolution: cls, season, level });
      const obs = { name_raw: row.name_raw, level, school_id: input.school_id, team_lineage_school_ids: [input.school_id], graduation_year: grad.graduation_year, season, source_url: snapshot.source_url };
      const block = await this.store.playersByNameBlock(normalizeName(row.name_raw));
      const decision = resolvePlayerIdentity(obs, block);
      let player;
      if (decision.kind === "match" && decision.player_id) {
        const existing = block.find((item) => item.id === decision.player_id);
        player = { ...existing, last_seen: maxIso(existing.last_seen, session.fetched_at), first_seen: minIso(existing.first_seen, session.fetched_at), graduation_year: pickGradYear(existing, grad, level), source_urls: dedupe([...existing.source_urls, snapshot.source_url]) };
        result.players_matched++;
      } else if (decision.kind === "new") {
        player = makePlayer(row.name_raw, level, input.school_id, grad, session.fetched_at, snapshot.source_url);
        result.players_new++;
      } else {
        player = { ...makePlayer(row.name_raw, level, input.school_id, grad, session.fetched_at, snapshot.source_url), review_status: "pending", confidence: decision.confidence };
        await this.store.enqueueReview({ id: ulid("RV_"), import_session_id: session.id, ref_type: "Player", ref_id: player.id, reason: decision.reason, candidates: decision.candidates.map((candidate) => ({ player_id: candidate.player.id, score: candidate.score, signals: candidate.signals })) });
        result.review_items++;
      }
      if (isCurrent) seenInCurrentPlayers.add(player.id);
      else seenInPriorPlayers.add(player.id);
      player = await this.store.upsertPlayer(player);
      touchedPlayers.set(player.id, player);
      const drift = classMatchesHistory({ graduationYear: player.graduation_year ?? null, season, observed: cls, level });
      if (!drift.match) {
        await this.store.enqueueReview({ id: ulid("RV_"), import_session_id: session.id, ref_type: "PlayerTeamSeason", ref_id: player.id, reason: drift.reason ?? "class_drift" });
        result.review_items++;
      }
      const edge = linkPlayerToTeamSeason({ player, teamSeason, snapshot, row, status: "active", confidence: Math.min(player.confidence, grad.confidence || 0.5, snapshot.confidence) });
      await this.store.insertEdge(edge);
      result.edges++;
    }
  }
}
