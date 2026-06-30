import { endYearOf } from "../types.mjs";
import { classForSeason } from "./class_year.mjs";

export function markGraduatedOrReturning({ player, currentSeason, observedThisSeason }) {
  const end = endYearOf(currentSeason);
  if (player.level === "college" || player.graduation_year == null) {
    return observedThisSeason ? { status: "active", needsReview: false } : { status: "unknown", needsReview: false, reason: "no_current_observation" };
  }
  const eligible = player.graduation_year > end;
  if (!eligible) return { status: observedThisSeason ? "active" : "graduated", needsReview: false };
  if (observedThisSeason) return { status: "returning", needsReview: false };
  return { status: "expected", needsReview: true, reason: "eligible_but_absent_current_season" };
}

export function progressionConsistent({ gradYearA, gradYearB, level }) {
  if (level === "college") return 0.5;
  if (gradYearA == null || gradYearB == null) return 0.4;
  return gradYearA === gradYearB ? 1 : 0;
}

export function classMatchesHistory({ graduationYear, season, observed, level }) {
  if (level === "college" || graduationYear == null || observed.ordinal == null) return { match: true };
  const predicted = classForSeason(graduationYear, season);
  if (predicted.ordinal == null || predicted.ordinal === observed.ordinal) return { match: true };
  return { match: false, reason: `class_drift_predicted_${predicted.normalized}_observed_${observed.normalized}` };
}
