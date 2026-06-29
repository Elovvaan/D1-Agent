export interface OpportunityInputs {
  recentProfileViews: number;
  activeMatches: number;
  coachOpens: number;
  recruiterReplies: number;
  daysSinceFilm: number;
}

export class OpportunityEngine {
  computeScore(inputs: OpportunityInputs) {
    const freshness = Math.max(0, 20 - inputs.daysSinceFilm * 2);
    const score = Math.min(
      100,
      inputs.recentProfileViews * 3 +
        inputs.activeMatches * 8 +
        inputs.coachOpens * 6 +
        inputs.recruiterReplies * 12 +
        freshness
    );

    return {
      score,
      inputs
    };
  }

  rankFeed<T extends { relevance: number }>(opportunities: T[]) {
    return [...opportunities].sort((a, b) => b.relevance - a.relevance);
  }
}

export const opportunityEngine = new OpportunityEngine();
