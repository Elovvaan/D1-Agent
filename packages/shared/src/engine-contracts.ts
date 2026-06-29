import { z } from "zod";
import { gameContextSchema, opportunitySchema, timelineEventSchema } from "./schemas";

export type GameContext = z.infer<typeof gameContextSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;

export type TrustTier = "low" | "fair" | "good" | "excellent";

export interface TrustFactorInput {
  factor:
    | "coach_verified"
    | "stats_matched"
    | "gpa_verified"
    | "film_uploaded"
    | "recommendations"
    | "identity_verified"
    | "public_record_matched"
    | "multi_source_verified";
  status: "met" | "partial" | "unmet";
  weight: number;
}

export interface TrustScoreResult {
  score: number;
  tier: TrustTier;
  factors: TrustFactorInput[];
}

export interface MatchCandidate {
  collegeId: string;
  division: string;
  region: string;
  positionalNeeds: string[];
  academicMinGpa?: number;
  recentInterestSignals: number;
}

export interface MatchResult {
  collegeId: string;
  matchPct: number;
  interestLevel: "low" | "medium" | "high";
  reasons: string[];
}

export interface PipelineJobResult {
  jobId: string;
  state: "queued" | "processing" | "ready" | "failed";
  reason?: string;
  outputs: Record<string, unknown>;
}

