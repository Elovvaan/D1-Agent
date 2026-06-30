export type MyD1SourceLabel =
  | "Public Record"
  | "Athlete Uploaded"
  | "Coach Verified"
  | "MyD1 Field Media"
  | "Media Partner Upload"
  | "Athlete Approved"
  | "Guardian Approved"
  | "Review Pending"
  | "License Required"
  | "Field Reported / Pending Review"
  | "Admin Approved";

export type SchoolDiscoveryType = "school" | "team" | "roster" | "schedule" | "stats" | "coaches" | "events" | "camps" | "livestream" | "unknown";

export type MyD1PortalRole = "athlete" | "coach" | "school_admin" | "media_partner" | "guardian" | "recruiter" | "platform_admin";

export type MyD1Permission =
  | "profile:own:update"
  | "profile:athlete:verify"
  | "profile:athlete:evaluate"
  | "profile:athlete:read-gated"
  | "media:school:upload"
  | "media:game:upload"
  | "media:athlete:tag"
  | "media:athlete:submit"
  | "schedule:school:update"
  | "guardian:permissions:update"
  | "trust:review"
  | "public-records:school:review"
  | "platform:moderate";

export const rolePermissionMatrix: Record<MyD1PortalRole, MyD1Permission[]> = {
  athlete: ["profile:own:update", "media:athlete:submit", "media:athlete:tag"],
  coach: ["profile:athlete:verify", "profile:athlete:evaluate", "media:game:upload", "schedule:school:update"],
  school_admin: ["media:school:upload", "media:game:upload", "schedule:school:update", "public-records:school:review"],
  media_partner: ["media:athlete:submit", "media:athlete:tag", "media:game:upload"],
  guardian: ["guardian:permissions:update", "profile:athlete:read-gated"],
  recruiter: ["profile:athlete:read-gated"],
  platform_admin: ["platform:moderate", "trust:review", "public-records:school:review"]
};

export function roleCan(role: MyD1PortalRole, permission: MyD1Permission) {
  return rolePermissionMatrix[role]?.includes(permission) ?? false;
}

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

export type MediaPartnerContentVisibility = "private" | "review_pending" | "athlete_approval_required" | "published";
export type MediaPartnerLicenseState = "free" | "preview_only" | "paid_license_required";
export type MediaPartnerApprovalStatus = "draft" | "review_pending" | "admin_reviewed" | "athlete_approval_required" | "athlete_approved" | "guardian_approved" | "declined" | "saved_private" | "removal_requested" | "published";

export interface MediaPartnerProfile {
  id: string;
  userId: string;
  organizationName: string;
  displayName: string;
  partnerType: "photographer" | "videographer" | "livestream_crew" | "newspaper" | "independent_creator";
  approved: boolean;
  createdAt: string;
}

export interface MediaPartnerSubmission {
  id: string;
  uploaderRole: "media_partner";
  uploaderName: string;
  uploaderOrganizationName: string;
  mediaType: "photo" | "video" | "clip" | "highlight";
  title: string;
  fileName?: string;
  fileUrl?: string;
  sourceLabel: "Media Partner Upload" | "Review Pending" | "Athlete Approved" | "Guardian Approved" | "License Required";
  uploadedAt: string;
  attachedGameId?: string;
  attachedGameName?: string;
  attachedTeamId?: string;
  attachedTeamName?: string;
  attachedSchoolId?: string;
  attachedSchoolName?: string;
  attachedAthleteIds: string[];
  taggedAthletes: string[];
  sport?: string;
  licensingNotes: string;
  licenseState: MediaPartnerLicenseState;
  visibility: MediaPartnerContentVisibility;
  approvalStatus: MediaPartnerApprovalStatus;
  requiresGuardianApproval: boolean;
  auditHistory: Array<{ action: string; actor: string; occurredAt: string; note?: string }>;
}
