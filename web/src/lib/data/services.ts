import type { AgentIntentContext, AthleteHeroMedia, AthleteProfile, CommandCenterData, D1Role, MatchStage, MissionItem, ProgressionLevel, ProgressionMilestone, SocialPlatform, StatLine, TimelineState, TrustScore } from "@d1/shared";
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

type SavedHeroMedia = {
  playerCutoutUrl?: string;
  backgroundVideoUrl?: string;
  backgroundVideoTitle?: string;
  updatedAt?: string;
};

type UploadedHighlight = {
  title?: string;
  url?: string;
  uploadedAt?: string;
};

type ProgressionDefinition = {
  level: ProgressionLevel;
  label: string;
  stage: string;
  description: string;
  next?: ProgressionLevel;
  milestones: string[];
};

const progressionDefinitions: Record<ProgressionLevel, ProgressionDefinition> = {
  A1: {
    level: "A1",
    label: "A1 Foundation",
    stage: "Foundation development",
    description: "Build your foundation. Your focus is training, consistency, and first verified film.",
    next: "B1",
    milestones: ["complete athlete profile", "upload first film", "connect coach", "complete training goals", "receive first coach feedback"]
  },
  B1: {
    level: "B1",
    label: "B1 Recruit",
    stage: "Recruiting profile",
    description: "Your recruiting journey is active. Your next move is coach verification and updated film.",
    next: "C1",
    milestones: ["complete recruiting profile", "upload highlight reel", "verify stats", "connect coach", "create college target list", "send first outreach"]
  },
  C1: {
    level: "C1",
    label: "C1 College",
    stage: "Collegiate profile",
    description: "You are managing a collegiate profile. Keep performance, awards, and transfer-ready materials current.",
    next: "D1",
    milestones: ["complete college profile", "upload college season film", "track awards", "connect college staff", "maintain eligibility documents"]
  },
  D1: {
    level: "D1",
    label: "D1 Elite",
    stage: "Elite career management",
    description: "You are operating at the elite level. Keep your brand, performance history, and opportunities organized.",
    milestones: ["complete elite profile", "connect representation", "track sponsorships", "publish pro reel", "maintain career stats"]
  }
};

type SourceLabel = "Self-reported" | "Document uploaded" | "Public record" | "Coach verified" | "Multi-source verified";

type PublicProfileIntake = {
  measurables?: Record<string, string>;
  academics?: Record<string, string>;
  athletics?: Record<string, string>;
  sources?: Record<string, SourceLabel>;
  updatedAt?: string;
};

type SavedDocument = {
  name: string;
  url: string;
  kind?: string;
  uploadedAt: string;
};

type ImportedStatRun = {
  runId: string;
  sourceUrl: string;
  fetchedAt: string;
  sourceTitle?: string;
  sourceRegistry?: PublicSourceRegistryEntry | null;
  publisherOrganization?: {
    org_type?: string;
    name?: string;
    short_name?: string;
    state?: string | null;
    source_url?: string;
    review_status?: string;
  };
  entities: Array<{
    id: string;
    type: string;
    sourceUrl: string;
    sourceRef?: string;
    fields: Array<{
      name: string;
      value: string;
      attribution?: { sourceUrl: string; fetchedAt: string; parser: string; selector?: string };
    }>;
    raw?: Record<string, unknown>;
  }>;
  reviewQueue?: Array<{ id: string; importedEntityId?: string }>;
  discoveredLinks?: Array<{ url?: string; href?: string; title?: string; anchor_text?: string; sourceType?: string; link_class?: string; confidence?: number }>;
};

export type PublicStatRecord = StatLine & {
  sourceUrl: string;
  fetchedAt: string;
  confidence: number;
  reviewState: "auto_matched" | "needs_review";
};

type PublicSourceRegistryEntry = {
  source_name: string;
  source_url: string;
  state: string;
  country: string;
  source_level: string;
  source_type: string;
  sports_supported: string[];
  notes?: string;
  enabled: boolean;
};

export type PublicDirectoryGroupName = "Schools" | "Teams" | "Athletes" | "Rankings" | "Games" | "Organizations" | "Sources" | "Coaches";

export type PublicDirectoryResult = {
  id: string;
  title: string;
  detail: string;
  href: string;
  group: PublicDirectoryGroupName;
  typeLabel: string;
  sourceLabel: "Public Record" | "Public Profile" | "Source Registry";
  sourceUrl?: string;
  importedAt?: string;
  confidence?: number;
};

export type PublicDirectorySection = {
  title: string;
  caption: string;
  results: PublicDirectoryResult[];
};

export type PublicDirectoryCounters = {
  schools: number;
  teams: number;
  athletes: number;
  coaches: number;
  games: number;
  sources: number;
  recordsImported: number;
  pendingReview: number;
};

function readUserState<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName);
    if (!existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function hasUserStateFile(fileName: string) {
  return existsSync(resolve(process.cwd(), "..", "data", "user-state", fileName));
}

function readLatestPublicImportRun(): ImportedStatRun | null {
  return readAllPublicImportRuns()[0] ?? null;
}

function readAllPublicImportRuns(): ImportedStatRun[] {
  try {
    const dir = resolve(process.cwd(), "..", "data", "imports");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
    const runs = files
      .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as ImportedStatRun)
      .sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt));
    return runs;
  } catch {
    return [];
  }
}

function readPublicSourceRegistry(): PublicSourceRegistryEntry[] {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "sources", "public-sources.json");
    if (!existsSync(filePath)) return [];
    return JSON.parse(readFileSync(filePath, "utf8")) as PublicSourceRegistryEntry[];
  } catch {
    return [];
  }
}

function requireSeed<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing seed data for ${label}`);
  }

  return value;
}

function hasRealAthleteProfile() {
  return hasUserStateFile("profile.json");
}

function readCurrentDevSession() {
  try {
    const sessionPath = resolve(process.cwd(), "..", "data", "session", "current-user.json");
    if (!existsSync(sessionPath)) return null;
    return JSON.parse(readFileSync(sessionPath, "utf8")) as { fullName?: string; role?: D1Role };
  } catch {
    return null;
  }
}

function emptyAthleteProfile(athleteId = defaultAthleteId): AthleteProfile {
  return {
    id: athleteId,
    userId: "current-user",
    fullName: "New Athlete",
    classYear: new Date().getFullYear(),
    sport: "",
    primaryPosition: "",
    jerseyNumber: "",
    schoolName: "",
    hometown: "",
    bio: "",
    visibility: "private",
    isMinor: true,
    parentConsentSigned: false,
    completionPct: 0,
    varsityStarter: false,
    ...buildProgressionFields("B1", [], "Progression pending profile setup.")
  };
}

export function getProgressionDefinition(level: ProgressionLevel) {
  return progressionDefinitions[level];
}

export function determineProgressionLevelFromEducation(value: string): ProgressionLevel {
  const normalized = value.trim().toLowerCase();
  const grade = Number(normalized.replace(/[^0-9]/g, ""));
  if (normalized.includes("elite") || normalized.includes("professional") || normalized.includes("pro") || normalized.includes("olympic")) return "D1";
  if (normalized.includes("college") || normalized.includes("university")) return "C1";
  if (Number.isFinite(grade) && grade >= 6 && grade <= 8) return "A1";
  if (Number.isFinite(grade) && grade >= 9 && grade <= 12) return "B1";
  return "B1";
}

export function buildProgressionFields(level: ProgressionLevel, completed: string[] = [], historyNote = "Progression initialized.") {
  const definition = getProgressionDefinition(level);
  const completedSet = new Set(completed.map((item) => item.toLowerCase()));
  const milestones: ProgressionMilestone[] = definition.milestones.map((label) => ({
    label,
    complete: completedSet.has(label.toLowerCase()),
    source: "self-reported"
  }));
  const completedCount = milestones.filter((milestone) => milestone.complete).length;

  return {
    progressionLevel: level,
    progressionLabel: definition.label,
    progressionStage: definition.stage,
    progressionDescription: definition.description,
    progressionPercent: milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0,
    nextProgressionLevel: definition.next,
    progressionMilestones: milestones,
    progressionHistory: [
      {
        level,
        label: definition.label,
        occurredAt: new Date().toISOString(),
        note: historyNote
      }
    ]
  };
}

export function getCurrentRole(): D1Role {
  return "athlete";
}

export function getRoleHome(role: D1Role) {
  const homes: Record<D1Role, string> = {
    athlete: "/command-center",
    coach: "/coach",
    recruiter: "/recruiter",
    media_partner: "/media",
    admin: "/admin"
  };

  return homes[role];
}

export function canAccessRoute(role: D1Role, pathname: string) {
  if (role === "admin") return true;
  const athleteOwnedPaths = ["/profile", "/film", "/highlights", "/recruiting", "/outreach", "/opportunities", "/calendar", "/trust", "/performance", "/settings"];
  if (role === "media_partner" && athleteOwnedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/coach")) return role === "coach";
  if (pathname.startsWith("/recruiter")) return role === "recruiter";
  if (pathname.startsWith("/media")) return role === "media_partner";
  return role === "athlete" || role === "coach" || role === "recruiter" || role === "media_partner";
}

export function getSessionContext(role: D1Role = getCurrentRole()) {
  const membership = requireSeed(seedMemberships.find((item) => item.role === role), `${role} membership`);
  const user = requireSeed(seedUsers.find((item) => item.id === membership.userId), `${role} user`);
  const org = membership.orgId ? seedOrgs.find((item) => item.id === membership.orgId) : undefined;

  return { role, user, membership, org };
}

export function getAthleteProfile(athleteId = defaultAthleteId) {
  const athlete = seedAthletes.find((item) => item.id === athleteId) ?? emptyAthleteProfile(athleteId);
  const saved = readUserState<Partial<AthleteProfile>>("profile.json", {});
  if (!hasUserStateFile("profile.json")) {
    return emptyAthleteProfile(athleteId);
  }

  const savedLevel = saved.progressionLevel ?? determineProgressionLevelFromEducation(String(saved.classYear ?? athlete.classYear));
  const progressionFields = buildProgressionFields(savedLevel, [], "Progression assigned from profile data.");
  return { ...athlete, ...progressionFields, ...saved, id: athlete.id, userId: athlete.userId };
}

export function getTrustScore(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) {
    return { athleteId, score: 0, tier: "low", factors: [] } satisfies TrustScore;
  }

  const trust = requireSeed(seedTrustScores.find((item) => item.athleteId === athleteId), `trust score ${athleteId}`);
  const documents = getSupportingDocuments();
  if (!documents.length) {
    return trust;
  }

  return {
    ...trust,
    score: Math.min(100, trust.score + 2),
    factors: trust.factors.map((factor) =>
      factor.factor === "film_uploaded"
        ? { ...factor, label: "Documents Uploaded", detail: `${documents.length} supporting document${documents.length === 1 ? "" : "s"} uploaded and pending review.` }
        : factor
    )
  } satisfies TrustScore;
}

export function getOpportunityScore(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) {
    return opportunityEngine.computeScore({ recentProfileViews: 0, activeMatches: 0, coachOpens: 0, recruiterReplies: 0, daysSinceFilm: 30 });
  }

  const recentProfileViews = getBrandProfile(athleteId).metrics.profileClicks;
  const activeMatches = getCollegeMatches(athleteId).length;
  const coachOpens = 2;
  const recruiterReplies = seedMessages.filter((message) => message.participantRole === "recruiter").length;
  const daysSinceFilm = 3;

  return opportunityEngine.computeScore({ recentProfileViews, activeMatches, coachOpens, recruiterReplies, daysSinceFilm });
}

export function getCollegeMatches(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedMatches.filter((match) => match.athleteId === athleteId).sort((a, b) => b.matchPct - a.matchPct);
}

export function getOpportunities(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return opportunityEngine.rankFeed(seedOpportunities.filter((item) => item.athleteId === athleteId));
}

export function getTimelineEvents(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedTimelineEvents.filter((event) => event.athleteId === athleteId);
}

export function getCalendarEvents(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedCalendarEvents.filter((event) => event.athleteId === athleteId);
}

export function getGames(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedGames.filter((game) => game.athleteId === athleteId);
}

export function getFilms(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedFilms.filter((film) => film.athleteId === athleteId);
}

export function getHighlights(athleteId = defaultAthleteId) {
  if (!hasRealAthleteProfile()) return [];
  return seedHighlights.filter((highlight) => highlight.athleteId === athleteId).sort((a, b) => b.score - a.score);
}

export function getAthleteHeroMedia(athleteId = defaultAthleteId): AthleteHeroMedia {
  const films = getFilms(athleteId);
  const highlights = getHighlights(athleteId);
  const savedHero = readUserState<SavedHeroMedia>("hero-media.json", {});
  const uploads = readUserState<{ highlights?: UploadedHighlight[] }>("uploads.json", { highlights: [] });
  const uploadedHighlight = Array.isArray(uploads.highlights) ? uploads.highlights.find((highlight) => highlight.url) : undefined;
  const latestReel = films.find((film) => film.type === "highlight_reel" && film.processingState === "ready" && film.videoUrl);
  const latestClipVideo = highlights.find((highlight) => highlight.published && highlight.videoUrl);
  const latestThumbnail = highlights.find((highlight) => highlight.thumbnailUrl) ?? films.find((film) => film.thumbnailUrl);
  const videoUrl = savedHero.backgroundVideoUrl ?? uploadedHighlight?.url ?? latestReel?.videoUrl ?? latestClipVideo?.videoUrl;
  const title = savedHero.backgroundVideoTitle ?? uploadedHighlight?.title ?? latestReel?.title ?? latestClipVideo?.title ?? latestThumbnail?.title ?? "Highlight media";

  return {
    title,
    videoUrl,
    posterUrl: latestReel?.thumbnailUrl ?? latestClipVideo?.thumbnailUrl ?? latestThumbnail?.thumbnailUrl,
    thumbnailUrl: latestThumbnail?.thumbnailUrl,
    playerCutoutUrl: savedHero.playerCutoutUrl,
    fallbackText: "Highlight media not uploaded yet."
  };
}

export function getStats(athleteId = defaultAthleteId) {
  const intake = getPublicProfileIntake();
  const hasSavedIntake = hasUserStateFile("profile-intake.json");
  const publicStats = getPublicStats(athleteId);
  const selfSource = "self" as const;
  const savedStats: StatLine[] = [
    { id: "saved-height-weight", athleteId, metric: "Height / Weight", value: 0, displayValue: [intake.measurables?.height, intake.measurables?.weight].filter(Boolean).join(" / ") || "", source: selfSource, verified: false },
    { id: "saved-wingspan", athleteId, metric: "Wingspan", value: 0, displayValue: intake.measurables?.wingspan ?? "", source: selfSource, verified: false },
    { id: "saved-forty", athleteId, metric: "Forty Yard", value: 0, displayValue: intake.measurables?.fortyYardDash ?? "", source: selfSource, verified: false },
    { id: "saved-vertical", athleteId, metric: "Vertical Jump", value: 0, displayValue: intake.measurables?.verticalJump ?? "", source: selfSource, verified: false },
    { id: "saved-bench", athleteId, metric: "Bench Press", value: 0, displayValue: intake.measurables?.benchPress ?? "", source: selfSource, verified: false },
    { id: "saved-sport-metrics", athleteId, metric: "Sport-specific Metrics", value: 0, displayValue: intake.measurables?.sportSpecificMetrics ?? "", source: selfSource, verified: false },
    { id: "saved-gpa", athleteId, metric: "GPA", value: 0, displayValue: intake.academics?.gpa ?? "", source: selfSource, verified: false },
    { id: "saved-sat", athleteId, metric: "SAT", value: 0, displayValue: intake.academics?.satScore ?? "", source: selfSource, verified: false },
    { id: "saved-act", athleteId, metric: "ACT", value: 0, displayValue: intake.academics?.actScore ?? "", source: selfSource, verified: false },
    { id: "saved-academic-notes", athleteId, metric: "Academic Eligibility Notes", value: 0, displayValue: intake.academics?.academicEligibilityNotes ?? "", source: selfSource, verified: false },
    { id: "saved-season-stats", athleteId, metric: "Season Stats", value: 0, displayValue: intake.athletics?.seasonStats ?? "", source: selfSource, verified: false },
    { id: "saved-game-stats", athleteId, metric: "Game Stats", value: 0, displayValue: intake.athletics?.gameStats ?? "", source: selfSource, verified: false },
    { id: "saved-position-stats", athleteId, metric: "Position-specific Stats", value: 0, displayValue: intake.athletics?.positionSpecificStats ?? "", source: selfSource, verified: false },
    { id: "saved-awards", athleteId, metric: "Awards / Honors", value: 0, displayValue: intake.athletics?.awardsHonors ?? "", source: selfSource, verified: false }
  ].filter((stat) => stat.displayValue);

  if (hasSavedIntake) {
    return [...publicStats, ...savedStats];
  }

  return publicStats;
}

function importedField(entity: ImportedStatRun["entities"][number], name: string) {
  return entity.fields.find((field) => field.name === name)?.value ?? "";
}

function statNumber(value: string) {
  const parsed = Number(value.replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMatchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function publicStatConfidence(athlete: AthleteProfile, entity: ImportedStatRun["entities"][number]) {
  const athleteName = importedField(entity, "athleteName");
  const jerseyNumber = importedField(entity, "jerseyNumber");
  const position = importedField(entity, "position");
  let score = 0;
  const importedName = normalizeMatchText(athleteName);
  const profileName = normalizeMatchText(athlete.fullName);

  if (importedName && importedName === profileName) score += 0.72;
  else if (importedName && (profileName.includes(importedName) || importedName.includes(profileName))) score += 0.46;
  if (jerseyNumber && athlete.jerseyNumber && jerseyNumber.replace("#", "") === athlete.jerseyNumber.replace("#", "")) score += 0.15;
  if (position && athlete.primaryPosition && position.toLowerCase() === athlete.primaryPosition.toLowerCase()) score += 0.12;
  if (entity.sourceUrl) score += 0.04;

  return Math.min(0.99, score);
}

export function getPublicStats(athleteId = defaultAthleteId): PublicStatRecord[] {
  const athlete = getAthleteProfile(athleteId);
  const run = readLatestPublicImportRun();
  if (!run) return [];

  return run.entities
    .filter((entity) => entity.type === "stat")
    .map((entity) => {
      const metric = importedField(entity, "statMetric");
      const displayValue = importedField(entity, "statValue");
      const confidence = publicStatConfidence(athlete, entity);
      const attribution = entity.fields.find((field) => field.name === "statValue")?.attribution;
      return {
        id: `public-${entity.id}`,
        athleteId,
        metric,
        value: statNumber(displayValue),
        displayValue,
        source: "public_record" as const,
        verified: true,
        sourceUrl: attribution?.sourceUrl ?? entity.sourceUrl,
        fetchedAt: attribution?.fetchedAt ?? run.fetchedAt,
        confidence,
        reviewState: confidence >= 0.92 ? "auto_matched" as const : "needs_review" as const
      };
    })
    .filter((stat) => stat.metric && stat.displayValue && stat.confidence >= 0.92);
}

export function getPublicStatsReviewQueue(athleteId = defaultAthleteId): PublicStatRecord[] {
  const athlete = getAthleteProfile(athleteId);
  const run = readLatestPublicImportRun();
  if (!run) return [];

  return run.entities
    .filter((entity) => entity.type === "stat")
    .map((entity) => {
      const metric = importedField(entity, "statMetric");
      const displayValue = importedField(entity, "statValue");
      const confidence = publicStatConfidence(athlete, entity);
      const attribution = entity.fields.find((field) => field.name === "statValue")?.attribution;
      return {
        id: `public-review-${entity.id}`,
        athleteId,
        metric,
        value: statNumber(displayValue),
        displayValue,
        source: "public_record" as const,
        verified: false,
        sourceUrl: attribution?.sourceUrl ?? entity.sourceUrl,
        fetchedAt: attribution?.fetchedAt ?? run.fetchedAt,
        confidence,
        reviewState: "needs_review" as const
      };
    })
    .filter((stat) => stat.metric && stat.displayValue && stat.confidence > 0 && stat.confidence < 0.92);
}

export function getPublicProfileIntake() {
  return readUserState<PublicProfileIntake>("profile-intake.json", { measurables: {}, academics: {}, athletics: {}, sources: {} });
}

export function getSupportingDocuments() {
  const documents = readUserState<{ transcript?: SavedDocument; supportingDocuments?: SavedDocument[] }>("documents.json", {});
  return [documents.transcript, ...(documents.supportingDocuments ?? [])].filter(Boolean) as SavedDocument[];
}

export function getMessages() {
  if (!hasRealAthleteProfile()) return [];
  return seedMessages;
}

export function getBrandProfile(athleteId = defaultAthleteId) {
  const seedBrand = requireSeed(seedBrandProfiles.find((brand) => brand.athleteId === athleteId), `brand profile ${athleteId}`);

  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "brand-links.json");
    if (!existsSync(filePath)) {
      if (!hasRealAthleteProfile()) {
        return {
          athleteId,
          handles: { ...emptyBrandHandles },
          latestPosts: [],
          metrics: {
            followers: 0,
            weeklyReach: 0,
            engagementRate: 0,
            profileClicks: 0
          },
          agentRecommendations: ["Connect your real athlete brand links after profile setup."]
        };
      }
      return seedBrand;
    }
    const saved = readUserState<Partial<Record<SocialPlatform, string>>>("brand-links.json", {});
    const savedHandles: Record<SocialPlatform, string> = { ...emptyBrandHandles };
    (Object.keys(emptyBrandHandles) as SocialPlatform[]).forEach((platform) => {
      const link = saved[platform];
      savedHandles[platform] = typeof link === "string" ? link : "";
    });

    return {
      ...seedBrand,
      handles: savedHandles,
      latestPosts: [],
      metrics: {
        followers: 0,
        weeklyReach: 0,
        engagementRate: 0,
        profileClicks: seedBrand.metrics.profileClicks
      },
      agentRecommendations: [
        "Add your strongest verified film and recruiting profile link to each connected platform bio.",
        "Connect Hudl and YouTube first if coaches need long-form film."
      ]
    };
  } catch {
    return seedBrand;
  }
}

export function getCoachConnection() {
  if (!hasRealAthleteProfile()) {
    return { name: "Coach not connected", title: "Coach", orgName: "No school connected", connected: false };
  }

  const coach = requireSeed(seedCoachProfiles[0], "coach profile");
  const user = requireSeed(seedUsers.find((item) => item.id === coach.userId), "coach user");
  const org = requireSeed(seedOrgs.find((item) => item.id === coach.orgId), "coach org");

  return { name: user.fullName, title: coach.title, orgName: org.name, connected: coach.verified };
}

export function getCoachDashboard() {
  const session = readCurrentDevSession();
  if (session?.role === "coach") {
    return {
      coach: {
        id: "coach-profile-current",
        userId: "current-user",
        orgId: "",
        title: "Coach",
        verified: false,
        verificationQueueCount: 0
      },
      priorities: [
        { title: "Verify coaching affiliation", detail: "Find your school and submit affiliation before managing athlete verification.", tone: "yellow" as const },
        { title: "Connect team roster", detail: "No team roster is connected yet.", tone: "silver" as const }
      ],
      missionCards: [
        { title: "Verification Queue", detail: "No imported roster/player records pending yet.", badge: "0", tone: "silver" as const },
        { title: "Team Trust Overview", detail: "Connect a team to view trust distribution.", badge: "Setup", tone: "yellow" as const }
      ]
    };
  }

  const coach = requireSeed(seedCoachProfiles[0], "coach dashboard");
  return {
    coach,
    priorities: [
      { title: "3 athletes need stat verification", detail: "Start with Jayden because his outreach is ready.", tone: "yellow" as const },
      { title: "4 highlight reels waiting for review", detail: "Two are ready for recruiter sharing.", tone: "blue" as const },
      { title: "One athlete reached a 95 Trust Score", detail: "Agent recommends notifying the roster.", tone: "green" as const },
      { title: "Two athletes have incomplete profiles", detail: "Academics and measurables are missing.", tone: "silver" as const }
    ],
    missionCards: [
      { title: "Verification Queue", detail: "Pending stats, roster, and game data.", badge: String(coach.verificationQueueCount), tone: "yellow" as const },
      { title: "Team Trust Overview", detail: "Roster score distribution and movers.", badge: "Live", tone: "green" as const },
      { title: "Recruiter Activity", detail: "Views and interest across your roster.", badge: "8", tone: "blue" as const },
      { title: "Upcoming Games", detail: "Streams, schedule, and context status.", badge: "Ready", tone: "blue" as const }
    ]
  };
}

export function getRecruiterDashboard() {
  const session = readCurrentDevSession();
  if (session?.role === "recruiter") {
    return {
      recruiter: {
        id: "recruiter-profile-current",
        userId: "current-user",
        orgId: "",
        territory: [],
        positionGroups: [],
        verified: false
      },
      prospects: [],
      filters: ["Position", "Grad Year", "GPA", "Trust Score", "Opportunity Score", "State", "School", "Sport", "Distance", "Height", "Weight"]
    };
  }

  return {
    recruiter: requireSeed(seedRecruiterProfiles[0], "recruiter dashboard"),
    prospects: [
      { title: "Jayden Lewis", detail: "QB - Trust 82 - Opportunity 95", value: "95%" },
      { title: "Malik Johnson", detail: "CB - Trust 88 - New reel posted", value: "89%" },
      { title: "Aiden Torres", detail: "QB - Coach recommendation added", value: "84%" }
    ],
    filters: ["Position", "Grad Year", "GPA", "Trust Score", "Opportunity Score", "State", "School", "Sport", "Distance", "Height", "Weight"]
  };
}

export function getAdminDashboard() {
  return {
    queue: [
      { title: "Public data conflict", detail: "Public roster conflicts with coach-verified jersey.", badge: "Review", tone: "yellow" as const },
      { title: "Coach identity check", detail: "Manual school affiliation approval required.", badge: "Pending", tone: "blue" as const },
      { title: "Stream health", detail: "Friday game input created and healthy.", badge: "Ready", tone: "green" as const }
    ]
  };
}

function getMissionItems(): MissionItem[] {
  if (!hasRealAthleteProfile()) {
    return [
      { label: "Create Athlete Profile", meta: "Not started", state: "queued" },
      { label: "Choose School / Team / Sport", meta: "Not started", state: "queued" },
      { label: "Claim Public Roster Profile", meta: "Optional when available", state: "queued" },
      { label: "Upload First Highlight", meta: "Not started", state: "queued" },
      { label: "Invite Coach Verification", meta: "Not started", state: "queued" }
    ];
  }

  return [
    { label: "Create Athlete Profile", meta: "Completed", state: "done" },
    { label: "Add Academic Information", meta: "Completed", state: "done" },
    { label: "Upload Highlight Reel", meta: "Completed", state: "done" },
    { label: "Coach Verification", meta: "2 actions pending", state: "active" },
    { label: "Send Outreach", meta: "2 emails drafted", state: "active" },
    { label: "Visit Colleges", meta: "3 visits planned", state: "queued" }
  ];
}

function getMissionStatus(athleteId: string) {
  const athlete = getAthleteProfile(athleteId);
  const trust = getTrustScore(athleteId);
  const score = getOpportunityScore(athleteId);
  const furthestStage = getCollegeMatches(athleteId).find((match) => match.stage !== "prospect")?.stage ?? "prospect";

  if (!hasRealAthleteProfile()) {
    return [
      { label: "Profile Completion", value: "0%", detail: "Create your athlete profile to start." },
      { label: "Trust Score", value: "0", detail: "Verification begins after real profile data is saved." },
      { label: "Opportunity Score", value: "0", detail: "Opportunities appear after profile, film, and verified signals exist." },
      { label: "Recruiting Progress", value: "Not Started", detail: "No active recruiting pipeline yet." }
    ];
  }

  return [
    { label: "Profile Completion", value: `${athlete.completionPct}%`, detail: "Transcript and second coach link remain." },
    { label: "Trust Score", value: `${trust.score}`, detail: "Good tier - verification is moving." },
    { label: "Opportunity Score", value: `${score.score}`, detail: "Views, replies, and film freshness." },
    { label: "Recruiting Progress", value: toTitle(furthestStage), detail: "Furthest stage across active matches." }
  ];
}

export function getAgentIntentContext(athleteId = defaultAthleteId, input: { currentPage?: string; userQuestion?: string } = {}): AgentIntentContext {
  const athlete = getAthleteProfile(athleteId);
  const matches = getCollegeMatches(athleteId);
  const brand = getBrandProfile(athleteId);
  const brandValues = Object.values(brand.handles);
  const brandCompleteness = Math.round((brandValues.filter(Boolean).length / Math.max(1, brandValues.length)) * 100);
  const timeline = getTimelineEvents(athleteId);
  const furthestStage = matches.find((match) => match.stage !== "prospect")?.stage ?? "prospect";

  return {
    userQuestion: input.userQuestion,
    currentPage: input.currentPage ?? "command_center",
    progressionLevel: athlete.progressionLevel,
    profileCompleteness: athlete.completionPct,
    recentActivity: timeline.slice(0, 3).map((event) => event.detail || event.title),
    uploadedMediaCount: getFilms(athleteId).filter((film) => film.videoUrl || film.thumbnailUrl).length + getHighlights(athleteId).filter((highlight) => highlight.videoUrl || highlight.thumbnailUrl).length,
    recruitingStatus: furthestStage as MatchStage,
    publicStatsCount: getPublicStats(athleteId).length,
    opportunityCount: getOpportunities(athleteId).length,
    trustScore: getTrustScore(athleteId).score,
    brandCompleteness
  };
}

export function getDailyBrief(athleteId = defaultAthleteId) {
  const matches = getCollegeMatches(athleteId);
  return agentService.dailyBrief({
    trust: getTrustScore(athleteId),
    matches: matches.map((match) => ({
      collegeId: match.collegeName,
      matchPct: match.matchPct,
      interestLevel: match.interestLevel,
      reasons: match.reasons
    })),
    opportunities: getOpportunities(athleteId),
    nextGame: "Friday against Pine Creek",
    intentContext: getAgentIntentContext(athleteId)
  });
}

export function getAgentResponse(input: { question: string; currentPage?: string; athleteId?: string }) {
  const athleteId = input.athleteId ?? defaultAthleteId;
  return agentService.respond({
    question: input.question,
    context: getAgentIntentContext(athleteId, { currentPage: input.currentPage, userQuestion: input.question })
  });
}

export function getCommandCenterData(athleteId = defaultAthleteId): CommandCenterData {
  const athlete = getAthleteProfile(athleteId);
  const timeline = getTimelineEvents(athleteId).map((item, index) => ({
    ...item,
    state: (index === 0 ? "active" : item.state) as TimelineState
  }));

  return {
    athlete,
    trustScore: getTrustScore(athleteId),
    opportunityScore: getOpportunityScore(athleteId),
    missionStatus: getMissionStatus(athleteId),
    todayMission: { completionPct: 73, items: getMissionItems() },
    dailyBrief: getDailyBrief(athleteId),
    opportunities: getOpportunities(athleteId),
    timeline,
    matches: getCollegeMatches(athleteId),
    events: getCalendarEvents(athleteId),
    coachConnection: getCoachConnection(),
    brandProfile: getBrandProfile(athleteId)
  };
}

export function getPublicAthleteHomepage(athleteId = defaultAthleteId) {
  const athlete = getAthleteProfile(athleteId);
  return {
    athlete,
    heroMedia: getAthleteHeroMedia(athleteId),
    trustScore: getTrustScore(athleteId),
    opportunityScore: getOpportunityScore(athleteId),
    stats: getStats(athleteId),
    highlights: getHighlights(athleteId),
    matches: getCollegeMatches(athleteId),
    brandProfile: getBrandProfile(athleteId)
  };
}

const publicDirectoryGroupOrder: PublicDirectoryGroupName[] = ["Schools", "Teams", "Athletes", "Rankings", "Games", "Organizations", "Sources", "Coaches"];

function matchesPublicDirectoryQuery(result: PublicDirectoryResult, normalizedQuery: string) {
  return [result.title, result.detail, result.group, result.typeLabel, result.sourceLabel, result.sourceUrl ?? ""].join(" ").toLowerCase().includes(normalizedQuery);
}

function importedTitle(entity: ImportedStatRun["entities"][number]) {
  const titleFieldNames = ["name", "athleteName", "playerName", "schoolName", "teamName", "coachName", "eventName", "tournamentName", "gameName", "statMetric", "opponent", "profileUrl"];
  return titleFieldNames.map((name) => importedField(entity, name)).find(Boolean) ?? toTitle(entity.type);
}

function importedDetail(entity: ImportedStatRun["entities"][number], run?: ImportedStatRun | null) {
  const details = [
    importedField(entity, "sport"),
    importedField(entity, "position"),
    importedField(entity, "jerseyNumber"),
    importedField(entity, "classYear"),
    importedField(entity, "season"),
    importedField(entity, "gameDate"),
    importedField(entity, "statValue"),
    importedField(entity, "sourceType"),
    importedField(entity, "confidenceScore") ? `Confidence ${Math.round(Number(importedField(entity, "confidenceScore")) * 100)}%` : ""
  ].filter(Boolean);

  const source = run?.sourceTitle ?? importedField(entity, "sourceName") ?? entity.sourceUrl;
  return [...details, source ? `Source: ${source}` : ""].filter(Boolean).join(" - ");
}

function importedDirectoryMapping(entity: ImportedStatRun["entities"][number]): { group: PublicDirectoryGroupName; typeLabel: string; pathType: string } | null {
  if (entity.type === "player" || entity.type === "athlete" || entity.type === "roster") {
    return { group: "Athletes", typeLabel: entity.type === "roster" ? "Roster" : "Roster Athlete", pathType: "athletes" };
  }
  if (entity.type === "school") {
    return { group: "Schools", typeLabel: "School", pathType: "schools" };
  }
  if (entity.type === "district" || entity.type === "conference" || entity.type === "league" || entity.type === "organization") {
    return { group: "Organizations", typeLabel: toTitle(entity.type), pathType: "organizations" };
  }
  if (entity.type === "team") {
    return { group: "Teams", typeLabel: "Team", pathType: "teams" };
  }
  if (entity.type === "game") {
    return { group: "Games", typeLabel: "Game", pathType: "games" };
  }
  if (entity.type === "event" || entity.type === "tournament") {
    return { group: "Games", typeLabel: toTitle(entity.type), pathType: "events" };
  }
  if (entity.type === "coach" || entity.type === "recruiter") {
    return { group: "Coaches", typeLabel: toTitle(entity.type), pathType: "coaches" };
  }
  if (entity.type === "stat") {
    const sourceRef = String(entity.sourceRef ?? entity.raw?.sourceType ?? "");
    const isRanking = /ranking/i.test(sourceRef) || importedField(entity, "statMetric") === "national_rank";
    return { group: "Rankings", typeLabel: isRanking ? "Ranking" : "Public Stat", pathType: "rankings" };
  }

  return null;
}

function sourceRegistryResult(source: PublicSourceRegistryEntry): PublicDirectoryResult {
  const id = `source-${source.source_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "public-source"}`;
  const sports = source.sports_supported.length ? source.sports_supported.join(", ") : "sports discovered from public pages";
  return {
    id,
    title: source.source_name,
    detail: `${source.source_level} - ${source.source_type.replaceAll("_", " ")} - ${source.state}, ${source.country} - ${sports}`,
    href: `/directory/sources/${id}`,
    group: "Sources",
    typeLabel: "Source",
    sourceLabel: "Source Registry",
    sourceUrl: source.source_url
  };
}

function publisherOrganizationResult(run: ImportedStatRun): PublicDirectoryResult | null {
  const org = run.publisherOrganization;
  if (!org?.name) return null;
  const id = `org-${org.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || run.runId}`;
  return {
    id,
    title: org.name,
    detail: `${toTitle(org.org_type ?? "publisher")} - ${org.state ?? "National"} - Source: ${run.sourceTitle ?? run.sourceUrl}`,
    href: `/directory/organizations/${id}`,
    group: "Organizations",
    typeLabel: toTitle(org.org_type ?? "Publisher"),
    sourceLabel: "Public Record",
    sourceUrl: org.source_url ?? run.sourceUrl,
    importedAt: run.fetchedAt
  };
}

function graphNodeToDirectoryResult(node: DirectoryGraphNode): PublicDirectoryResult | null {
  if (node.type === "import_session" || node.type === "review_queue_item") return null;
  const groupByType: Record<string, PublicDirectoryGroupName> = {
    school: "Schools",
    team: "Teams",
    ranking: "Rankings",
    organization: "Organizations",
    source: "Sources"
  };
  const group = groupByType[node.type];
  if (!group) return null;
  return {
    id: node.id,
    title: node.name,
    detail: node.detail,
    href: `/directory/${node.type}/${node.id}`,
    group,
    typeLabel: node.label,
    sourceLabel: node.type === "source" ? "Source Registry" : "Public Record",
    sourceUrl: node.sourceUrl,
    importedAt: node.importedAt,
    confidence: node.confidence
  };
}

function buildPublicDirectoryIndex() {
  const results: PublicDirectoryResult[] = [];
  const seen = new Set<string>();
  const add = (result: PublicDirectoryResult) => {
    const key = `${result.group}:${result.id}:${result.sourceUrl ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  if (hasUserStateFile("profile.json")) {
    const athlete = getAthleteProfile(defaultAthleteId);
    add({
      id: athlete.id,
      title: athlete.fullName,
      detail: `${athlete.sport} - ${athlete.primaryPosition} - ${athlete.schoolName} - Class of ${athlete.classYear}`,
      href: `/athletes/${athlete.id}`,
      group: "Athletes",
      typeLabel: "Public Profile",
      sourceLabel: "Public Profile"
    });
  }

  for (const node of getDirectoryGraph().nodes) {
    const result = graphNodeToDirectoryResult(node);
    if (result) add(result);
  }

  return results;
}

function groupDirectoryResults(results: PublicDirectoryResult[]) {
  const buckets = new Map<PublicDirectoryGroupName, PublicDirectoryResult[]>();
  for (const result of results) {
    buckets.set(result.group, [...(buckets.get(result.group) ?? []), result]);
  }
  return publicDirectoryGroupOrder
    .map((group) => ({ group, results: buckets.get(group) ?? [] }))
    .filter((group) => group.results.length > 0);
}

export function searchPublicDirectory(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }
  return groupDirectoryResults(buildPublicDirectoryIndex().filter((result) => matchesPublicDirectoryQuery(result, normalizedQuery)));
}

export function getPublicDirectoryDiscoverySections(): PublicDirectorySection[] {
  const allResults = buildPublicDirectoryIndex();
  const pendingReviewIds = new Set(getDirectoryGraph().nodes.filter((node) => node.reviewStatus === "pending_review").map((node) => node.id));
  const recentlyImported = [...allResults]
    .filter((result) => result.sourceLabel === "Public Record")
    .sort((a, b) => Date.parse(b.importedAt ?? "") - Date.parse(a.importedAt ?? ""))
    .slice(0, 8);
  const pendingReview = allResults.filter((result) => pendingReviewIds.has(result.id)).slice(0, 8);
  const byGroup = (group: PublicDirectoryGroupName) => allResults.filter((result) => result.group === group).slice(0, 8);
  return [
    { title: "Recently imported", caption: "Newest source-attributed records from public imports.", results: recentlyImported },
    { title: "National rankings", caption: "Ranking records parsed from public national sources.", results: byGroup("Rankings") },
    { title: "Schools discovered", caption: "School records found in public data imports.", results: byGroup("Schools") },
    { title: "Teams discovered", caption: "Team records found in public data imports.", results: byGroup("Teams") },
    { title: "Sources active", caption: "Enabled public source registry entries.", results: byGroup("Sources") },
    { title: "Records needing review", caption: "Imported records waiting for review before verification or merge.", results: pendingReview }
  ];
}

export function getPublicDirectoryCounters(): PublicDirectoryCounters {
  const results = buildPublicDirectoryIndex();
  const runs = readAllPublicImportRuns();
  const countGroup = (group: PublicDirectoryGroupName) => results.filter((result) => result.group === group).length;
  return {
    schools: countGroup("Schools"),
    teams: countGroup("Teams"),
    athletes: countGroup("Athletes"),
    coaches: countGroup("Coaches"),
    games: countGroup("Games"),
    sources: readPublicSourceRegistry().filter((source) => source.enabled).length,
    recordsImported: runs.reduce((total, run) => total + (run.entities?.length ?? 0), 0),
    pendingReview: runs.reduce((total, run) => total + (run.reviewQueue?.length ?? 0), 0)
  };
}

export function getPublicDirectoryRecord(entityId: string) {
  const graphNode = getDirectoryGraph().nodes.find((node) => node.id === entityId);
  if (graphNode) {
    return {
      run: null,
      entity: { id: graphNode.id, type: graphNode.type, sourceUrl: graphNode.sourceUrl ?? "", fields: [] },
      title: graphNode.name,
      detail: graphNode.detail,
      typeLabel: graphNode.label,
      group: graphNodeToDirectoryResult(graphNode)?.group ?? "Organizations",
      fields: graphNode.fields.map((field) => ({
        name: field.name,
        value: field.value,
        sourceUrl: field.sourceUrl ?? graphNode.sourceUrl ?? "",
        fetchedAt: field.fetchedAt ?? graphNode.importedAt,
        parser: field.parser ?? "directory-graph-resolver"
      })),
      graphNode
    };
  }

  const source = readPublicSourceRegistry().find((item) => sourceRegistryResult(item).id === entityId);
  if (source) {
    const result = sourceRegistryResult(source);
    return {
      run: null,
      entity: { id: result.id, type: "source", sourceUrl: source.source_url, fields: [] },
      title: result.title,
      detail: result.detail,
      typeLabel: "Source",
      group: "Sources" as PublicDirectoryGroupName,
      fields: [
        { name: "source_name", value: source.source_name, sourceUrl: source.source_url, fetchedAt: "", parser: "source-registry" },
        { name: "source_url", value: source.source_url, sourceUrl: source.source_url, fetchedAt: "", parser: "source-registry" },
        { name: "source_level", value: source.source_level, sourceUrl: source.source_url, fetchedAt: "", parser: "source-registry" },
        { name: "source_type", value: source.source_type, sourceUrl: source.source_url, fetchedAt: "", parser: "source-registry" },
        { name: "state", value: source.state, sourceUrl: source.source_url, fetchedAt: "", parser: "source-registry" }
      ]
    };
  }

  const runs = readAllPublicImportRuns();
  const run = runs.find((item) => item.entities?.some((entity) => entity.id === entityId));
  const entity = run?.entities.find((item) => item.id === entityId) ?? null;
  if (!entity) {
    return null;
  }

  const mapping = importedDirectoryMapping(entity);
  return {
    run,
    entity,
    title: importedTitle(entity),
    detail: importedDetail(entity, run),
    typeLabel: mapping?.typeLabel ?? toTitle(entity.type),
    group: mapping?.group ?? "Schools",
    fields: entity.fields.map((field) => ({
      name: field.name,
      value: field.value,
      sourceUrl: field.attribution?.sourceUrl ?? entity.sourceUrl,
      fetchedAt: field.attribution?.fetchedAt ?? run?.fetchedAt,
      parser: field.attribution?.parser ?? "public-url-importer"
    }))
  };
}

export function searchAthletePublicProfiles(query: string) {
  const athleteGroup = searchPublicDirectory(query).find((group) => group.group === "Athletes");
  return (athleteGroup?.results ?? []).map((result) => ({
    id: result.id,
    fullName: result.title,
    detail: result.detail,
    visibility: "public" as const
  }));
}

export function toTitle(value: string) {
  return value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
