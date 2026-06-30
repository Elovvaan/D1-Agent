export const THRESHOLDS = {
  AUTO: 0.85,
  SOFT_REVIEW: 0.6
};

const hardReasons = new Set([
  "rank_missing",
  "team_name_missing",
  "gender_unresolved",
  "sport_unresolved",
  "record_unparseable"
]);

const weights = {
  rank: 0.2,
  teamName: 0.2,
  teamUrl: 0.15,
  state: 0.15,
  record: 0.15,
  classification: 0.15
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function scoreRankingRecord(input) {
  const review = [];
  const confidence = {
    rank: input.rankValid ? 1 : 0,
    teamName: input.teamName?.trim() ? 1 : 0,
    teamUrl: input.teamUrl ? 1 : 0,
    state: input.state ? 1 : 0,
    record: input.recordParsed ? 1 : input.recordRawPresent ? 0 : 0.5,
    classification: clamp(input.classificationConfidence ?? 0, 0, 1)
  };

  let score =
    confidence.rank * weights.rank +
    confidence.teamName * weights.teamName +
    confidence.teamUrl * weights.teamUrl +
    confidence.state * weights.state +
    confidence.record * weights.record +
    confidence.classification * weights.classification;

  if (!input.rankValid) review.push({ reason: "rank_missing", field: "rank" });
  if (!input.teamName?.trim()) review.push({ reason: "team_name_missing", field: "team_name" });
  if (input.gender === "unknown") {
    review.push({ reason: "gender_unresolved", field: "gender" });
    score = Math.min(score, 0.5);
  }
  if (input.sport === "unknown") {
    review.push({ reason: "sport_unresolved", field: "sport" });
    score = Math.min(score, 0.55);
  }
  if (input.recordRawPresent && !input.recordParsed) {
    review.push({ reason: "record_unparseable", field: "overall_record" });
    score = Math.min(score, 0.55);
  }
  if (!input.teamUrl) review.push({ reason: "team_url_missing", field: "team_url" });
  if (!input.state) review.push({ reason: "state_missing", field: "state" });

  score = clamp(score, 0, 1);
  const hasHard = review.some((item) => hardReasons.has(item.reason));
  const tier = hasHard || score < THRESHOLDS.SOFT_REVIEW ? "HARD_REVIEW" : score < THRESHOLDS.AUTO ? "SOFT_REVIEW" : "AUTO";

  return { score, tier, review: tier === "AUTO" ? [] : review };
}
