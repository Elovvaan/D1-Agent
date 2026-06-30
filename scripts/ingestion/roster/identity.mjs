import { tierFor } from "../score.mjs";
import { progressionConsistent } from "./progression.mjs";

export function normalizeName(raw) {
  return String(raw ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\.?$/g, "")
    .replace(/[^a-z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolvePlayerIdentity(obs, existing) {
  const targetName = normalizeName(obs.name_raw);
  const scored = [];
  for (const player of existing) {
    const sameName = normalizeName(player.name_canonical) === targetName || (player.aliases ?? []).some((alias) => normalizeName(alias) === targetName);
    if (!sameName) continue;
    const signals = ["name_exact"];
    let score = 0.45;
    if (player.primary_school_id && (player.primary_school_id === obs.school_id || obs.team_lineage_school_ids.includes(player.primary_school_id))) {
      score += 0.3;
      signals.push("school_lineage");
    }
    const consistency = progressionConsistent({ gradYearA: player.graduation_year ?? null, gradYearB: obs.graduation_year, level: obs.level });
    if (obs.level === "hs") {
      if (consistency === 0 && player.graduation_year != null && obs.graduation_year != null) {
        scored.push({ player, score: 0, signals: [...signals, "grad_year_conflict"] });
        continue;
      }
      if (consistency === 1) {
        score += 0.2;
        signals.push("grad_year_match");
      }
    } else {
      signals.push("college_nominal_grad_year");
    }
    scored.push({ player, score: Math.min(1, score), signals });
  }
  scored.sort((a, b) => b.score - a.score);
  if (scored.some((candidate) => candidate.signals.includes("grad_year_conflict"))) {
    return { kind: "review", confidence: scored[0]?.score ?? 0, tier: "HARD", reason: "name_match_grad_year_conflict", candidates: scored };
  }
  const best = scored[0];
  if (!best || best.score < 0.45) return { kind: "new", confidence: 1, tier: "AUTO", reason: "no_existing_match", candidates: scored };
  const tier = tierFor(best.score, false);
  if (tier === "AUTO") return { kind: "match", player_id: best.player.id, confidence: best.score, tier, reason: "confident_match", candidates: scored };
  return { kind: "review", confidence: best.score, tier, reason: "ambiguous_player_match", candidates: scored };
}
