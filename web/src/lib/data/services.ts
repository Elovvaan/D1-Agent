import type { AthleteHeroMedia, AthleteProfile, CommandCenterData, D1Role, MissionItem, ProgressionLevel, ProgressionMilestone, SocialPlatform, StatLine, TimelineState, TrustScore } from "@d1/shared";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { agentService } from "@/lib/services/agent-service";
import { opportunityEngine } from "@/lib/services/opportunity-engine";
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
  entities: Array<{
    id: string;
    type: string;
    sourceUrl: string;
    fields: Array<{
      name: string;
      value: string;
      attribution?: { sourceUrl: string; fetchedAt: string; parser: string; selector?: string };
    }>;
  }>;
};

export type PublicStatRecord = StatLine & {
  sourceUrl: string;
  fetchedAt: string;
  confidence: number;
  reviewState: "auto_matched" | "needs_review";
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
  try {
    const dir = resolve(process.cwd(), "..", "data", "imports");
    if (!existsSync(dir)) return null;
    const files = readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
    const runs = files
      .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as ImportedStatRun)
      .sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt));
    return runs[0] ?? null;
  } catch {
    return null;
  }
}

function requireSeed<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing seed data for ${label}`);
  }

  return value;
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
    athlete: "/",
    coach: "/coach",
    recruiter: "/recruiter",
    admin: "/admin"
  };

  return homes[role];
}

export function canAccessRoute(role: D1Role, pathname: string) {
  if (role === "admin") return true;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/coach")) return role === "coach";
  if (pathname.startsWith("/recruiter")) return role === "recruiter";
  return role === "athlete" || role === "coach" || role === "recruiter";
}

export function getSessionContext(role: D1Role = getCurrentRole()) {
  const membership = requireSeed(seedMemberships.find((item) => item.role === role), `${role} membership`);
  const user = requireSeed(seedUsers.find((item) => item.id === membership.userId), `${role} user`);
  const org = membership.orgId ? seedOrgs.find((item) => item.id === membership.orgId) : undefined;

  return { role, user, membership, org };
}

export function getAthleteProfile(athleteId = defaultAthleteId) {
  const athlete = requireSeed(seedAthletes.find((item) => item.id === athleteId), `athlete ${athleteId}`);
  const saved = readUserState<Partial<AthleteProfile>>("profile.json", {});
  if (!hasUserStateFile("profile.json")) {
    return athlete;
  }

  const savedLevel = saved.progressionLevel ?? determineProgressionLevelFromEducation(String(saved.classYear ?? athlete.classYear));
  const progressionFields = buildProgressionFields(savedLevel, [], "Progression assigned from profile data.");
  return { ...athlete, ...progressionFields, ...saved, id: athlete.id, userId: athlete.userId };
}

export function getTrustScore(athleteId = defaultAthleteId) {
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
  const recentProfileViews = getBrandProfile(athleteId).metrics.profileClicks;
  const activeMatches = getCollegeMatches(athleteId).length;
  const coachOpens = 2;
  const recruiterReplies = seedMessages.filter((message) => message.participantRole === "recruiter").length;
  const daysSinceFilm = 3;

  return opportunityEngine.computeScore({ recentProfileViews, activeMatches, coachOpens, recruiterReplies, daysSinceFilm });
}

export function getCollegeMatches(athleteId = defaultAthleteId) {
  return seedMatches.filter((match) => match.athleteId === athleteId).sort((a, b) => b.matchPct - a.matchPct);
}

export function getOpportunities(athleteId = defaultAthleteId) {
  return opportunityEngine.rankFeed(seedOpportunities.filter((item) => item.athleteId === athleteId));
}

export function getTimelineEvents(athleteId = defaultAthleteId) {
  return seedTimelineEvents.filter((event) => event.athleteId === athleteId);
}

export function getCalendarEvents(athleteId = defaultAthleteId) {
  return seedCalendarEvents.filter((event) => event.athleteId === athleteId);
}

export function getGames(athleteId = defaultAthleteId) {
  return seedGames.filter((game) => game.athleteId === athleteId);
}

export function getFilms(athleteId = defaultAthleteId) {
  return seedFilms.filter((film) => film.athleteId === athleteId);
}

export function getHighlights(athleteId = defaultAthleteId) {
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
  return seedMessages;
}

export function getBrandProfile(athleteId = defaultAthleteId) {
  const seedBrand = requireSeed(seedBrandProfiles.find((brand) => brand.athleteId === athleteId), `brand profile ${athleteId}`);

  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "brand-links.json");
    if (!existsSync(filePath)) {
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
  const coach = requireSeed(seedCoachProfiles[0], "coach profile");
  const user = requireSeed(seedUsers.find((item) => item.id === coach.userId), "coach user");
  const org = requireSeed(seedOrgs.find((item) => item.id === coach.orgId), "coach org");

  return { name: user.fullName, title: coach.title, orgName: org.name, connected: coach.verified };
}

export function getCoachDashboard() {
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

  return [
    { label: "Profile Completion", value: `${athlete.completionPct}%`, detail: "Transcript and second coach link remain." },
    { label: "Trust Score", value: `${trust.score}`, detail: "Good tier - verification is moving." },
    { label: "Opportunity Score", value: `${score.score}`, detail: "Views, replies, and film freshness." },
    { label: "Recruiting Progress", value: toTitle(furthestStage), detail: "Furthest stage across active matches." }
  ];
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
    nextGame: "Friday against Pine Creek"
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

export function searchAthletePublicProfiles(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return seedAthletes
    .map((athlete) => getAthleteProfile(athlete.id))
    .filter((athlete) =>
      [
        athlete.fullName,
        athlete.schoolName,
        athlete.sport,
        athlete.primaryPosition,
        athlete.secondaryPosition ?? "",
        String(athlete.classYear)
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
    .map((athlete) => ({
      id: athlete.id,
      fullName: athlete.fullName,
      detail: `${athlete.sport} - ${athlete.primaryPosition} - ${athlete.schoolName} - Class of ${athlete.classYear}`,
      visibility: athlete.visibility
    }));
}

export function toTitle(value: string) {
  return value
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
