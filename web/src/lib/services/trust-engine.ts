import type { TrustFactorInput, TrustScoreResult, TrustTier } from "@d1/shared";

const statusMultiplier = {
  met: 1,
  partial: 0.5,
  unmet: 0
} satisfies Record<TrustFactorInput["status"], number>;

export class TrustEngine {
  compute(factors: TrustFactorInput[]): TrustScoreResult {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weighted = factors.reduce(
      (sum, factor) => sum + factor.weight * statusMultiplier[factor.status],
      0
    );
    const score = totalWeight === 0 ? 0 : Math.round((weighted / totalWeight) * 100);

    return {
      score,
      tier: this.tierForScore(score),
      factors
    };
  }

  private tierForScore(score: number): TrustTier {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 45) return "fair";
    return "low";
  }
}

export const trustEngine = new TrustEngine();

