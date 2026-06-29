import type {
  AthleteClaimRequest,
  CoachImportedVerificationRequest,
  GameContext,
  PublicEntityMatch,
  PublicImportedEntity,
  PublicReviewQueueItem
} from "@d1/shared";

export interface EntityMatchDecision {
  confidence: number;
  decision: "auto_merged" | "pending_review" | "rejected" | "manual_merged";
  evidence: Record<string, unknown>;
}

export class PublicSportsDataEngine {
  resolveEntity(confidence: number, evidence: Record<string, unknown>): EntityMatchDecision {
    return {
      confidence,
      evidence,
      decision: confidence >= 0.92 ? "auto_merged" : confidence >= 0.55 ? "pending_review" : "rejected"
    };
  }

  buildGameContext(context: GameContext): GameContext {
    return context;
  }

  matchImportedEntity(input: {
    importedEntity: PublicImportedEntity;
    existingEntityId?: string;
    confidence: number;
    evidence: Record<string, unknown>;
  }): PublicEntityMatch {
    const decision = this.resolveEntity(input.confidence, input.evidence);

    return {
      id: `match-${input.importedEntity.id}`,
      importedEntityId: input.importedEntity.id,
      entityType: input.importedEntity.type,
      existingEntityId: input.existingEntityId,
      confidence: decision.confidence,
      decision: decision.decision,
      evidence: decision.evidence
    };
  }

  buildReviewQueue(matches: PublicEntityMatch[]): PublicReviewQueueItem[] {
    return matches
      .filter((match) => match.decision === "pending_review" || match.decision === "rejected")
      .map((match) => ({
        id: `review-${match.id}`,
        importedEntityId: match.importedEntityId,
        decision: match.decision,
        reason:
          match.decision === "pending_review"
            ? "Imported public record needs admin review before merge."
            : "Imported public record did not confidently match an existing D1 entity.",
        priority: match.confidence >= 0.55 ? "medium" : "high",
        evidence: match.evidence
      }));
  }

  createAthleteClaimRequest(input: {
    importedPlayerId: string;
    athleteUserId: string;
    evidence: Record<string, unknown>;
    submittedAt: string;
  }): AthleteClaimRequest {
    return {
      id: `claim-${input.importedPlayerId}-${input.athleteUserId}`,
      importedPlayerId: input.importedPlayerId,
      athleteUserId: input.athleteUserId,
      status: "pending",
      submittedAt: input.submittedAt,
      evidence: input.evidence
    };
  }

  createCoachVerificationRequest(input: {
    importedPlayerId: string;
    coachUserId: string;
    submittedAt: string;
    note?: string;
  }): CoachImportedVerificationRequest {
    return {
      id: `coach-verify-${input.importedPlayerId}-${input.coachUserId}`,
      importedPlayerId: input.importedPlayerId,
      coachUserId: input.coachUserId,
      status: "pending",
      submittedAt: input.submittedAt,
      correctedFields: [],
      note: input.note
    };
  }
}

export const publicSportsDataEngine = new PublicSportsDataEngine();
