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

  score(input: { matches?: unknown[]; opportunities?: Array<{ type?: string }>; films?: unknown[] }) {
    const opportunities = input.opportunities ?? [];
    return this.computeScore({
      recentProfileViews: 0,
      activeMatches: input.matches?.length ?? 0,
      coachOpens: opportunities.filter((item) => item.type === "coach_open").length,
      recruiterReplies: opportunities.filter((item) => item.type === "new_match").length,
      daysSinceFilm: input.films?.length ? 1 : 30
    });
  }

  rankFeed<T extends { relevance: number }>(opportunities: T[]) {
    return [...opportunities].sort((a, b) => b.relevance - a.relevance);
  }
}

export const opportunityEngine = new OpportunityEngine();
