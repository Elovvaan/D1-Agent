export type PublicImportEntityType = "school" | "team" | "player" | "coach" | "game" | "stream" | "stat";
export type PublicImportFieldName =
  | "name"
  | "athleteName"
  | "schoolName"
  | "teamName"
  | "sport"
  | "season"
  | "jerseyNumber"
  | "position"
  | "classYear"
  | "height"
  | "weight"
  | "hometown"
  | "profileUrl"
  | "gameDate"
  | "opponent"
  | "location"
  | "streamUrl"
  | "statMetric"
  | "statValue"
  | "statContext";
export type PublicImportDecision = "auto_merged" | "pending_review" | "rejected" | "manual_merged";
export type PublicClaimStatus = "pending" | "approved" | "rejected";
export type CoachImportedVerificationStatus = "pending" | "approved" | "corrected" | "rejected";

export interface PublicSourceAttribution {
  sourceUrl: string;
  fetchedAt: string;
  parser: string;
  selector?: string;
  rawSnippet?: string;
}

export interface PublicImportedField {
  name: PublicImportFieldName;
  value: string;
  attribution: PublicSourceAttribution;
}

export interface PublicImportedEntity {
  id: string;
  type: PublicImportEntityType;
  sourceUrl: string;
  sourceRef: string;
  fields: PublicImportedField[];
  raw: Record<string, unknown>;
}

export interface PublicEntityMatch {
  id: string;
  importedEntityId: string;
  entityType: PublicImportEntityType;
  existingEntityId?: string;
  confidence: number;
  decision: PublicImportDecision;
  evidence: Record<string, unknown>;
}

export interface PublicReviewQueueItem {
  id: string;
  importedEntityId: string;
  reason: string;
  priority: "low" | "medium" | "high";
  decision: PublicImportDecision;
  evidence: Record<string, unknown>;
}

export interface AthleteClaimRequest {
  id: string;
  importedPlayerId: string;
  athleteUserId: string;
  status: PublicClaimStatus;
  submittedAt: string;
  evidence: Record<string, unknown>;
}

export interface CoachImportedVerificationRequest {
  id: string;
  importedPlayerId: string;
  coachUserId: string;
  status: CoachImportedVerificationStatus;
  submittedAt: string;
  correctedFields: PublicImportedField[];
  note?: string;
}

export interface PublicImportResult {
  runId: string;
  sourceUrl: string;
  fetchedAt: string;
  sourceTitle?: string;
  entities: PublicImportedEntity[];
  matches: PublicEntityMatch[];
  reviewQueue: PublicReviewQueueItem[];
  claimRequests: AthleteClaimRequest[];
  coachVerificationRequests: CoachImportedVerificationRequest[];
}
