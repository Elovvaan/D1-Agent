import type { MatchCandidate, MatchResult } from "@d1/shared";

interface AthleteMatchProfile {
  primaryPosition: string;
  gpa?: number;
  preferredRegions: string[];
  targetDivision?: string;
}

export class MatchEngine {
  rank(profile: AthleteMatchProfile, candidates: MatchCandidate[]): MatchResult[] {
    return candidates
      .map((candidate) => this.score(profile, candidate))
      .sort((a, b) => b.matchPct - a.matchPct);
  }

  private score(profile: AthleteMatchProfile, candidate: MatchCandidate): MatchResult {
    const reasons: string[] = [];
    let score = 30;

    if (candidate.positionalNeeds.includes(profile.primaryPosition)) {
      score += 30;
      reasons.push(`${profile.primaryPosition} need in this class`);
    }

    if (!candidate.academicMinGpa || (profile.gpa ?? 0) >= candidate.academicMinGpa) {
      score += 15;
      reasons.push("Academic fit clears the program profile");
    }

    if (profile.preferredRegions.includes(candidate.region)) {
      score += 10;
      reasons.push("Regional fit matches athlete preference");
    }

    if (profile.targetDivision && profile.targetDivision === candidate.division) {
      score += 8;
      reasons.push("Division fit matches recruiting goal");
    }

    score += Math.min(7, candidate.recentInterestSignals);
    if (candidate.recentInterestSignals > 0) {
      reasons.push("Recent recruiter interest signal detected");
    }

    const matchPct = Math.min(100, score);
    return {
      collegeId: candidate.collegeId,
      matchPct,
      interestLevel: matchPct >= 85 ? "high" : matchPct >= 65 ? "medium" : "low",
      reasons
    };
  }
}

export const matchEngine = new MatchEngine();

