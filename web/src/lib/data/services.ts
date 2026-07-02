import type { AgentIntentContext, AthleteBrandProfile, AthleteHeroMedia, AthleteProfile, CalendarEvent, CommandCenterData, D1Role, Film, Game, Highlight, MatchStage, MissionItem, ProgressionLevel, ProgressionMilestone, RecruitingOpportunity, SocialPlatform, StatLine, TimelineEvent, TimelineState, TrustScore } from "@d1/shared";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { agentService } from "@/lib/services/agent-service";
import { opportunityEngine } from "@/lib/services/opportunity-engine";
import { getDirectoryGraph, getDirectoryGraphNode, type DirectoryGraphNode } from "@/lib/data/directory-graph";
import {
  seedAthletes,
  seedBrandProfiles,
  seedCalendarEvents,
  seedCoachProfiles,
  seedFilms,
  seedGames,
  seedHighlights,
  seedMatches,
  seedMemberships,
  seedMessages,
  seedOpportunities,
  seedOrgs,
  seedRecruiterProfiles,
  seedStats,
  seedTimelineEvents,
  seedTrustScores,
  seedUsers
} from "./seed-data";

export const defaultAthleteId = "athlete-jayden-lewis";

const emptyBrandHandles: Record<SocialPlatform, string> = {
  instagram: "",
  tiktok: "",
  youtube: "",
  hudl: "",
  x: "",
  website: ""
};

// NOTE: this file is intentionally preserved whole-file because this repo is being edited through the GitHub contents API.
// The public-directory graph mapping at the bottom must include player -> Athletes so imported roster/player graph nodes are searchable.

