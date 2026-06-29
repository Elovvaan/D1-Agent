export type MyD1SourceLabel =
  | "Public Record"
  | "Athlete Uploaded"
  | "Coach Verified"
  | "MyD1 Field Media"
  | "Field Reported / Pending Review"
  | "Admin Approved";

export type SchoolDiscoveryType = "school" | "team" | "roster" | "schedule" | "stats" | "coaches" | "events" | "camps" | "livestream" | "unknown";

export interface DiscoveredSource {
  id: string;
  sourceUrl: string;
  fetchedAt: string;
  schoolName?: string;
  athleticsHomepage?: string;
  robotsAllowed: boolean;
  status: "discovered" | "blocked" | "failed";
  message?: string;
}

export interface DiscoveredLink {
  id: string;
  sourceId: string;
  url: string;
  title: string;
  type: SchoolDiscoveryType;
  confidence: number;
  evidence: string[];
  fetchedAt: string;
}

export interface SchoolImportSession {
  id: string;
  sourceUrl: string;
  fetchedAt: string;
  selectedLinkIds: string[];
  importedRecords: number;
  reviewRecords: number;
  status: "discovered" | "imported" | "reviewed";
}

export interface OperatorMediaUpload {
  id: string;
  title: string;
  mediaType: "field_photo" | "short_clip" | "highlight_video";
  fileName?: string;
  fileUrl?: string;
  attachedToType: "athlete" | "team" | "game" | "school";
  attachedToName: string;
  visibility: "public" | "private" | "recruiters_only";
  sourceLabel: "MyD1 Field Media";
  reviewStatus: "pending_review" | "approved" | "rejected" | "edit_requested";
  submittedAt: string;
  tags: string[];
}

export interface OperatorFieldNote {
  id: string;
  subject: string;
  note: string;
  relatedEntity: string;
  sourceLabel: "MyD1 Field Media";
  reviewStatus: "pending_review" | "approved" | "rejected" | "edit_requested";
  submittedAt: string;
}

export interface OperatorStatReport {
  id: string;
  playerName: string;
  gameName: string;
  metric: string;
  value: string;
  note?: string;
  sourceLabel: "Field Reported / Pending Review";
  reviewStatus: "pending_review" | "approved" | "rejected" | "edit_requested";
  submittedAt: string;
}

export interface MediaReviewQueueItem {
  id: string;
  itemType: "media" | "field_note" | "stat_report";
  itemId: string;
  title: string;
  sourceLabel: MyD1SourceLabel;
  reviewStatus: "pending_review" | "approved" | "rejected" | "edit_requested";
  submittedAt: string;
}

export interface ContentPublicationRecord {
  id: string;
  itemId: string;
  itemType: "media" | "field_note" | "stat_report";
  publishedTo: "athlete_public_profile" | "team" | "game" | "timeline";
  status: "queued" | "published" | "rejected";
  actionLog: Array<{ action: string; actor: string; occurredAt: string; note?: string }>;
}
