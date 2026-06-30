import { ulid } from "../types.mjs";
import { normalizePlayerClass } from "./class_year.mjs";
import { parseHeightInches, parseWeightLb } from "./parse.mjs";

export function createRosterSnapshot({ parsed, teamSeason, session, source }) {
  const parsed_status = parsed.ok ? (parsed.warnings.length ? "partial" : "parsed") : "failed";
  return {
    id: ulid("RS_"),
    team_season_id: teamSeason.id,
    import_session_id: session.id,
    source_id: source.id,
    source_url: session.source_url,
    fetched_at: session.fetched_at,
    parser_version: session.parser_version,
    row_count: parsed.rows.length,
    parsed_status,
    rows_raw: parsed.rows,
    confidence: parsed.ok ? (parsed.warnings.length ? 0.7 : 0.9) : 0.2
  };
}

export function linkPlayerToTeamSeason({ player, teamSeason, snapshot, row, status, confidence }) {
  const cls = normalizePlayerClass(row.class_year_raw, player.level);
  return {
    id: ulid("PTS_"),
    player_id: player.id,
    team_season_id: teamSeason.id,
    roster_snapshot_id: snapshot.id,
    jersey: row.jersey_raw?.replace(/[^0-9]/g, "") || undefined,
    position: row.position_raw || undefined,
    class_year_raw: row.class_year_raw,
    class_year_normalized: cls.normalized,
    class_ordinal: cls.ordinal,
    redshirt: cls.redshirt,
    height_in: parseHeightInches(row.height_raw),
    weight_lb: parseWeightLb(row.weight_raw),
    hometown: row.hometown_raw,
    status,
    source_url: snapshot.source_url,
    confidence
  };
}
