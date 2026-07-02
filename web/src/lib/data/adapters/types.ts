export type RawInputMedium = "html" | "csv" | "json" | "pdf" | "api";
export type Confidence = number;
export type SourceTier = "T0-canonical" | "T1-sanctioning" | "T2-aggregator" | "T3-local";
export type LicenseClass = "public-domain" | "public-web" | "licensed" | "restricted";
export type ProposalKind = "SchoolProposal" | "OrganizationProposal" | "TeamProposal" | "AthleteProposal" | "CoachProposal" | "GameProposal" | "AffiliationProposal" | "RankingObservation";
export type FieldStatus = "extracted" | "unresolved" | "conflicting";

export interface RawInput {
  medium: RawInputMedium;
  uri: string;
  fetchedAt: string;
  body: Buffer | string;
  headers?: Record<string, string>;
}

export interface SourceFingerprint {
  sourceId: string;
  evidence: string[];
}

export interface DetectionResult {
  handled: boolean;
  pageType?: string;
  fingerprint: SourceFingerprint;
  confidence: Confidence;
}

export interface ExtractionContext {
  rawArchiveRef: string;
  extractedAt?: string;
}

export interface FieldValue<T = unknown> {
  value: T | null;
  status: FieldStatus;
  confidence: Confidence;
  evidence?: string;
}

export interface IdentityHint {
  type: "nces-id" | "source-id" | "name-city-state" | "name-state" | "name";
  value: string;
  confidence: Confidence;
}

export interface CanonicalProposal {
  proposalId: string;
  kind: ProposalKind;
  fields: Record<string, FieldValue>;
  identityHints: IdentityHint[];
  confidence: Confidence;
}

export interface ProvenanceEnvelope {
  sourceId: string;
  adapterId: string;
  adapterVersion: string;
  uri: string;
  fetchedAt: string;
  extractedAt: string;
  rawArchiveRef: string;
  pageType: string;
  sourceTier: SourceTier;
  licenseClass: LicenseClass;
}

export interface ExtractionDiagnostic {
  level: "info" | "warning" | "error";
  message: string;
  count?: number;
}

export interface ExtractionResult {
  proposals: CanonicalProposal[];
  envelope: ProvenanceEnvelope;
  diagnostics: ExtractionDiagnostic[];
}

export interface SourceAdapter {
  readonly adapterId: string;
  readonly sourceId: string;
  readonly version: string;
  detect(input: RawInput): DetectionResult;
  extract(input: RawInput, ctx: ExtractionContext): ExtractionResult;
}
