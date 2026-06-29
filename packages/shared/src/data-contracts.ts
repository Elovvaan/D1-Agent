export type D1Role = "athlete" | "coach" | "recruiter" | "admin";
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
  orgId?: string;
  plan: MembershipPlan;
  status: MembershipState;
}

export interface Org {
  id: string;
  type: OrgType;
  name: string;
  division?: Division;
  city?: string;
  state?: string;
  verified: boolean;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  fullName: string;
  classYear: number;
  sport: string;
  primaryPosition: string;
  secondaryPosition?: string;
  jerseyNumber?: string;
  schoolName: string;
  hometown: string;
  bio: string;
  visibility: Visibility;
  isMinor: boolean;
  parentConsentSigned: boolean;
  completionPct: number;
  varsityStarter: boolean;
  progressionLevel: ProgressionLevel;
  progressionLabel: string;
  progressionStage: string;
  progressionDescription: string;
  progressionPercent: number;
  nextProgressionLevel?: ProgressionLevel;
  progressionMilestones: ProgressionMilestone[];
  progressionHistory: ProgressionHistoryItem[];
}

export interface CoachProfile {
  id: string;
  userId: string;
  orgId: string;
  title: string;
  verified: boolean;
  verificationQueueCount: number;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  orgId: string;
  territory: string[];
  positionGroups: string[];
  verified: boolean;
}

export interface Game {
  id: string;
  athleteId: string;
  opponent: string;
  gameDate: string;
  location: string;
  source: "stream" | "upload" | "external";
  status: "scheduled" | "live" | "processing" | "ready" | "failed";
  highlightCount: number;
}

export interface Film {
  id: string;
  athleteId: string;
  gameId: string;
  title: string;
  type: "full_game" | "clip" | "highlight_reel";
  durationSeconds: number;
  processingState: ProcessingState;
  viewCount: number;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface Highlight {
  id: string;
  athleteId: string;
  gameId: string;
  title: string;
  playType: string;
  score: number;
  verified: boolean;
  published: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface AthleteHeroMedia {
  title: string;
  videoUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  playerCutoutUrl?: string;
  fallbackText: string;
}

export interface StatLine {
  id: string;
  athleteId: string;
  gameId?: string;
  metric: string;
  value: number;
  displayValue: string;
  source: "self" | "ai_extracted" | "coach_verified" | "external" | "public_record" | "multi_source";
  verified: boolean;
}

export interface TrustScore {
  athleteId: string;
  score: number;
  tier: "low" | "fair" | "good" | "excellent";
  factors: Array<{
    label: string;
    factor: string;
    status: "met" | "partial" | "unmet";
    weight: number;
    displayWeight: string;
    detail: string;
  }>;
}

export interface RecruitingOpportunity {
  id: string;
  athleteId: string;
  type:
    | "profile_view"
    | "position_demand"
    | "showcase"
    | "teammate_news"
    | "reel_views_up"
    | "scholarship"
    | "agent_recommendation"
    | "new_match"
    | "coach_open";
  payload: Record<string, unknown>;
  rationale: string;
  actionType: string | null;
  relevance: number;
  state: OpportunityState;
}

export interface CollegeMatch {
  id: string;
  athleteId: string;
  collegeId: string;
  collegeName: string;
  division: Division;
  distanceMiles: number;
  matchPct: number;
  interestLevel: "low" | "medium" | "high";
  stage: MatchStage;
  reasons: string[];
  logoText: string;
}

export interface TimelineEvent {
  id: string;
  athleteId: string;
  title: string;
  detail: string;
  eventType: string;
  state: TimelineState;
  meta: string;
}

export interface MessageThread {
  id: string;
  participantName: string;
  participantRole: D1Role | "ops";
  subject: string;
  latestMessage: string;
  unreadCount: number;
  lastMessageAt: string;
}

export interface CalendarEvent {
  id: string;
  athleteId: string;
  month: string;
  day: string;
  title: string;
  detail: string;
  kind: "live_stream" | "camp" | "event" | "visit" | "deadline";
  startsAt: string;
}

export interface AthleteBrandPost {
  id: string;
  platform: SocialPlatform;
  title: string;
  postedAt: string;
  url: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
}

export interface AthleteBrandProfile {
  athleteId: string;
  handles: Record<SocialPlatform, string>;
  latestPosts: AthleteBrandPost[];
  metrics: {
    followers: number;
    weeklyReach: number;
    engagementRate: number;
    profileClicks: number;
  };
  agentRecommendations: string[];
}

export interface MissionItem {
  label: string;
  meta: string;
  state: TimelineState;
}

export interface AgentIntentSignal {
  capability: AgentCapability;
  confidence: number;
  reasons: string[];
}

export interface AgentIntentContext {
  userQuestion?: string;
  currentPage?: string;
  progressionLevel: ProgressionLevel;
  profileCompleteness: number;
  recentActivity: string[];
  uploadedMediaCount: number;
  recruitingStatus: MatchStage;
  publicStatsCount: number;
  opportunityCount: number;
  trustScore: number;
  brandCompleteness: number;
}

export interface CommandCenterData {
  athlete: AthleteProfile;
  trustScore: TrustScore;
  opportunityScore: {
    score: number;
    inputs: {
      recentProfileViews: number;
      activeMatches: number;
      coachOpens: number;
      recruiterReplies: number;
      daysSinceFilm: number;
    };
  };
  missionStatus: Array<{ label: string; value: string; detail: string }>;
  todayMission: { completionPct: number; items: MissionItem[] };
  dailyBrief: { yesterday: string[]; today: string[]; upcoming: string[] };
  opportunities: RecruitingOpportunity[];
  timeline: TimelineEvent[];
  matches: CollegeMatch[];
  events: CalendarEvent[];
  coachConnection: { name: string; title: string; orgName: string; connected: boolean };
  brandProfile: AthleteBrandProfile;
}
