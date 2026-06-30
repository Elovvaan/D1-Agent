export const THRESHOLDS = { AUTO: 0.85, SOFT_REVIEW: 0.6 };

export function tierFor(score, hard = false) {
  if (hard || score < THRESHOLDS.SOFT_REVIEW) return "HARD";
  if (score < THRESHOLDS.AUTO) return "SOFT";
  return "AUTO";
}
