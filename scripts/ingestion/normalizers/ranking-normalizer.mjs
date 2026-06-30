import { scoreRankingRecord } from "../scorers/confidence-scorer.mjs";

export function parseOverallRecord(raw) {
  if (!raw) return null;
  const match = raw.trim().match(/^(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?$/);
  if (!match) return null;
  return {
    w: Number(match[1]),
    l: Number(match[2]),
    t: match[3] ? Number(match[3]) : 0,
    raw: raw.trim()
  };
}

export function parseMovement(raw = "") {
  const text = raw.trim();
  if (!text || /^[-–—]+$/.test(text)) return { dir: "same", delta: 0, raw: text };
  if (/new/i.test(text)) return { dir: "new", delta: 0, raw: text };
  const up = /[▲↑]/.test(text) || /^\+/.test(text);
  const down = /[▼↓]/.test(text) || /^-(?!-)/.test(text);
  const delta = Number(text.match(/(\d+)/)?.[1] ?? 0);
  if (up) return { dir: "up", delta, raw: text };
  if (down) return { dir: "down", delta, raw: text };
  return { dir: "same", delta: 0, raw: text };
}

export function normalizeState(raw) {
  if (!raw) return undefined;
  const text = raw.trim();
  if (!text) return undefined;
  if (/^prep/i.test(text)) return "PREP";
  if (/^(d\.?c\.?|washington,?\s*dc)$/i.test(text)) return "DC";
  const upper = text.toUpperCase();
  if (/^[A-Z]{2,3}$/.test(upper)) return upper;
  return undefined;
}

export function normalizeRankingRecord(raw, options) {
  const rank = raw.rank ? Number.parseInt(raw.rank.replace(/[^\d]/g, ""), 10) : Number.NaN;
  const overallRecord = parseOverallRecord(raw.record);
  const recordRawPresent = !!(raw.record && raw.record.trim() && !/^[-–—]+$/.test(raw.record.trim()));
  const state = normalizeState(raw.state);
  const classification = options.classification;
  const gender = classification.facets.gender ?? "unknown";
  const sport = classification.facets.sport ?? "unknown";
  const season = classification.facets.season ?? "unknown";
  const scored = scoreRankingRecord({
    rankValid: Number.isFinite(rank) && rank > 0,
    teamName: raw.team_name,
    teamUrl: raw.team_href,
    state,
    recordParsed: !!overallRecord,
    recordRawPresent,
    gender,
    sport,
    season,
    classificationConfidence: classification.confidence
  });

  return {
    rank: Number.isFinite(rank) ? rank : 0,
    team_name_raw: raw.team_name?.trim() ?? "",
    team_url: raw.team_href,
    state,
    overall_record: overallRecord ?? undefined,
    ranking_movement: parseMovement(raw.movement),
    season,
    sport,
    gender,
    category: classification.facets.scope,
    source_url: options.source_url,
    source_as_of: options.methodology?.source_as_of,
    imported_timestamp: options.imported_timestamp,
    confidence_score: scored.score,
    review: scored.review,
    tier: scored.tier
  };
}
