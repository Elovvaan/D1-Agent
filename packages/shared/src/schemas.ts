import { z } from "zod";

export const roleSchema = z.enum(["athlete", "parent", "coach", "recruiter", "media_partner", "scout", "admin"]);
export const visibilitySchema = z.enum(["public", "recruiters_only", "private"]);
export const trustSourceSchema = z.enum(["self", "ai_extracted", "external", "public_record", "coach_verified", "multi_source"]);
export const processingStateSchema = z.enum(["queued", "processing", "ready", "failed"]);
export const opportunityStateSchema = z.enum(["new", "seen", "acted", "dismissed"]);
export const matchStageSchema = z.enum(["prospect", "contacted", "responded", "evaluating", "offer", "committed", "closed"]);

export const athleteProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  isMinor: z.boolean(),
  parentConsentSigned: z.boolean().default(false),
  classYear: z.number().int(),
  sport: z.string().default("football"),
  primaryPosition: z.string(),
  secondaryPosition: z.string().optional(),
  hometown: z.string(),
  schoolName: z.string(),
  bio: z.string(),
  visibility: visibilitySchema
});

export const measurableSchema = z.object({
  athleteId: z.string().uuid(),
  heightIn: z.number().optional(),
  weightLb: z.number().optional(),
  fortyYd: z.number().optional(),
  verticalIn: z.number().optional(),
  benchLb: z.number().optional(),
  wingspanIn: z.number().optional(),
  verified: z.boolean().default(false)
});

export const academicSchema = z.object({
  athleteId: z.string().uuid(),
  gpa: z.number().min(0).max(5).optional(),
  testType: z.enum(["sat", "act", "none"]).default("none"),
  testScore: z.number().int().optional(),
  verified: z.boolean().default(false)
});

export const gameContextSchema = z.object({
  gameId: z.string().uuid(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  rosters: z.array(z.object({
    athleteId: z.string().uuid().optional(),
    externalPlayerId: z.string().uuid().optional(),
    fullName: z.string(),
    jerseyNumber: z.string().optional(),
    position: z.string().optional(),
    team: z.enum(["home", "away"])
  })),
  coaches: z.array(z.object({ fullName: z.string(), role: z.string(), team: z.enum(["home", "away"]) })),
  history: z.record(z.unknown()).default({}),
  knownStarters: z.array(z.string()).default([])
});

export const opportunitySchema = z.object({
  id: z.string().uuid(),
  athleteId: z.string().uuid(),
  type: z.enum([
    "profile_view",
    "position_demand",
    "showcase",
    "teammate_news",
    "reel_views_up",
    "scholarship",
    "agent_recommendation",
    "new_match",
    "coach_open"
  ]),
  payload: z.record(z.unknown()),
  rationale: z.string(),
  actionType: z.string().nullable(),
  relevance: z.number(),
  state: opportunityStateSchema
});

export const timelineEventSchema = z.object({
  athleteId: z.string().uuid(),
  eventType: z.enum([
    "game_uploaded",
    "ai_processing",
    "highlights_generated",
    "stats_extracted",
    "verification_requested",
    "coach_verified",
    "trust_increased",
    "recruiter_viewed",
    "match_updated",
    "outreach_drafted",
    "recruiter_responded",
    "offer_received"
  ]),
  refType: z.string().nullable(),
  refId: z.string().uuid().nullable(),
  payload: z.record(z.unknown()).default({})
});

export const agentActionSchema = z.object({
  athleteId: z.string().uuid(),
  actionType: z.enum([
    "assess_profile",
    "request_verification",
    "generate_reel",
    "rank_matches",
    "draft_outreach",
    "send_outreach",
    "schedule_event",
    "summarize_responses",
    "explain"
  ]),
  status: z.enum(["queued", "completed", "failed", "blocked"]),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).default({}),
  requiresApproval: z.boolean()
});
