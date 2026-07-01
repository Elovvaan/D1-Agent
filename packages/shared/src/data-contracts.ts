export type D1Role = "athlete" | "parent" | "coach" | "recruiter" | "media_partner" | "organization" | "admin";
export type MembershipPlan = "d1_free" | "d1_pro" | "team" | "enterprise";
export type MembershipState = "active" | "pending" | "revoked";
export type OrgType = "high_school" | "club" | "college" | "platform";
export type Division = "NCAA D1" | "NCAA D2" | "NCAA D3" | "NAIA" | "JUCO" | "High School";
export type Visibility = "public" | "recruiters_only" | "private";
export type ProcessingState = "queued" | "processing" | "ready" | "failed";
export type OpportunityState = "new" | "seen" | "acted" | "dismissed";
export type MatchStage = "prospect" | "contacted" | "responded" | "evaluating" | "offer" | "committed" | "closed";
export type TimelineState = "done" | "active" | "queued";
export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "hudl" | "x" | "website";
export type ProgressionLevel = "A1" | "B1" | "C1" | "D1";
export type AgentCapability = "scouting" | "recruiting" | "brand" | "marketing" | "career_development";

export interface ProgressionMilestone {
  label: string;
  complete: boolean;
  source: "demo" | "self-reported" | "coach_verified" | "document_uploaded";
  completedAt?: string;
}

export interface ProgressionHistoryItem {
  level: ProgressionLevel;
  label: string;
  occurredAt: string;
  note: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  status: "active" | "suspended" | "pending";
}

export interface Membership {
  id: string;
  userId: string;
  role: D1Role;
