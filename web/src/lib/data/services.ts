import type { AgentIntentContext, AthleteBrandProfile, AthleteHeroMedia, AthleteProfile, CalendarEvent, CollegeMatch, CommandCenterData, D1Role, Film, Game, Highlight, MatchStage, MissionItem, ProgressionLevel, RecruitingOpportunity, SocialPlatform, StatLine, TimelineState, TrustScore } from "@d1/shared";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { agentService } from "@/lib/services/agent-service";
import { opportunityEngine } from "@/lib/services/opportunity-engine";
import { getDirectoryGraph, getDirectoryGraphNode, type DirectoryGraphNode } from "@/lib/data/directory-graph";
import { seedAthletes, seedBrandProfiles, seedCalendarEvents, seedFilms, seedGames, seedHighlights, seedMatches, seedMemberships, seedMessages, seedOpportunities, seedOrgs, seedStats, seedTimelineEvents, seedTrustScores, seedUsers } from "./seed-data";

export const defaultAthleteId = "athlete-jayden-lewis";
export type PublicDirectoryGroupName = "Schools" | "Teams" | "Athletes" | "Rankings" | "Games" | "Organizations" | "Sources" | "Coaches";
export type PublicDirectoryResult = { id: string; title: string; detail: string; href: string; group: PublicDirectoryGroupName; typeLabel: string; sourceLabel: "Public Record" | "Public Profile" | "Source Registry"; sourceUrl?: string; importedAt?: string; confidence?: number };
export type PublicDirectorySection = { title: string; caption: string; results: PublicDirectoryResult[] };
export type PublicDirectoryCounters = { schools: number; teams: number; athletes: number; coaches: number; games: number; sources: number; recordsImported: number; pendingReview: number };
type UploadedMediaFile = { title?: string; name?: string; url?: string };
type ProgressionDefinition = { label: string; stage: string; description: string; milestones: string[]; next?: ProgressionLevel };

const progressionDefinitions: Record<ProgressionLevel, ProgressionDefinition> = {
  A1: { label: "A1 Foundation", stage: "Foundation development", description: "Build your foundation.", milestones: ["complete athlete profile"], next: "B1" },
  B1: { label: "B1 Recruit", stage: "Recruiting profile", description: "Your recruiting journey is active.", milestones: ["complete recruiting profile"], next: "C1" },
  C1: { label: "C1 College", stage: "Collegiate profile", description: "Manage your college profile.", milestones: ["complete college profile"], next: "D1" },
  D1: { label: "D1 Elite", stage: "Elite career management", description: "Operate at the elite level.", milestones: ["complete elite profile"] }
};

 type SavedDocument = { name: string; url: string; kind?: string; uploadedAt: string };
const emptyBrandHandles: Record<SocialPlatform, string> = { instagram: "", tiktok: "", youtube: "", hudl: "", x: "", website: "" };

function readUserState<T>(fileName: string, fallback: T): T { try { const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName); return existsSync(filePath) ? JSON.parse(readFileSync(filePath, "utf8")) as T : fallback; } catch { return fallback; } }
export function toTitle(value: string) { return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim(); }
export function getProgressionDefinition(level: ProgressionLevel) { return progressionDefinitions[level]; }
export function determineProgressionLevelFromEducation(_input?: string): ProgressionLevel { return "B1"; }
export function buildProgressionFields(level: ProgressionLevel, _milestones: string[] = [], note = "Progression initialized.") { const d = getProgressionDefinition(level); return { progressionLevel: level, progressionLabel: d.label, progressionStage: d.stage, progressionDescription: d.description, progressionPercent: 0, nextProgressionLevel: d.next, progressionMilestones: d.milestones.map((label) => ({ label, complete: false, source: "self-reported" as const })), progressionHistory: [{ level, label: d.label, occurredAt: new Date().toISOString(), note }] }; }
function emptyAthleteProfile(athleteId = defaultAthleteId): AthleteProfile { return { id: athleteId, userId: "current-user", fullName: "New Athlete", classYear: new Date().getFullYear(), sport: "", primaryPosition: "", schoolName: "", hometown: "", bio: "", visibility: "private", isMinor: true, parentConsentSigned: false, completionPct: 0, varsityStarter: false, ...buildProgressionFields("B1") }; }

export function getCurrentRole(): D1Role { return "athlete"; }
export function getRoleHome(role: D1Role) { return ({ athlete: "/profile", coach: "/coach", recruiter: "/recruiter", media_partner: "/media", admin: "/operations" } as Record<D1Role, string>)[role] ?? "/profile"; }
export function canAccessRoute(role: D1Role, pathname: string) { if (role === "admin") return true; if (pathname.startsWith("/coach")) return role === "coach"; if (pathname.startsWith("/recruiter")) return role === "recruiter"; if (pathname.startsWith("/media")) return role === "media_partner"; if (pathname.startsWith("/admin") || pathname.startsWith("/operations")) return false; return true; }
export function getSessionContext(role: D1Role = getCurrentRole()) { const membership = seedMemberships.find((item) => item.role === role) ?? seedMemberships[0]; const user = seedUsers.find((item) => item.id === membership.userId) ?? seedUsers[0]; const org = membership.orgId ? seedOrgs.find((item) => item.id === membership.orgId) : undefined; return { role, user, membership, org }; }
export function getAthleteProfile(athleteId = defaultAthleteId) { const saved = readUserState<Partial<AthleteProfile>>("profile.json", {}); const seed = seedAthletes.find((item) => item.id === athleteId) ?? emptyAthleteProfile(athleteId); return { ...seed, ...buildProgressionFields(saved.progressionLevel ?? seed.progressionLevel ?? "B1"), ...saved, id: seed.id, userId: seed.userId }; }
export function getGames(athleteId = defaultAthleteId) { return seedGames.filter((item) => item.athleteId === athleteId); }
export function getFilms(athleteId = defaultAthleteId) { const uploads = readUserState<{ films?: UploadedMediaFile[] }>("uploads.json", { films: [] }).films ?? []; return [...uploads.map((item, index) => ({ id: `upload-film-${index}`, athleteId, gameId: "uploaded", title: item.title || item.name || "Uploaded film", type: "clip", durationSeconds: 0, processingState: "ready", viewCount: 0, videoUrl: item.url } as Film)), ...seedFilms.filter((item) => item.athleteId === athleteId)]; }
export function getHighlights(athleteId = defaultAthleteId) { return seedHighlights.filter((item) => item.athleteId === athleteId); }
export function getStats(athleteId = defaultAthleteId) { return seedStats.filter((item) => item.athleteId === athleteId); }
export const getPublicStats = getStats;
export function getTrustScore(athleteId = defaultAthleteId) { return seedTrustScores.find((item) => item.athleteId === athleteId) ?? { athleteId, score: 0, tier: "low", factors: [] } as TrustScore; }
export function getOpportunities(athleteId = defaultAthleteId) { return seedOpportunities.filter((item) => item.athleteId === athleteId); }
export function getCollegeMatches(athleteId = defaultAthleteId) { return seedMatches.filter((item) => item.athleteId === athleteId) as CollegeMatch[]; }
export function getTimelineEvents(athleteId = defaultAthleteId) { return seedTimelineEvents.filter((item) => item.athleteId === athleteId); }
export function getCalendarEvents(athleteId = defaultAthleteId) { return seedCalendarEvents.filter((item) => item.athleteId === athleteId); }
export function getMessages() { return seedMessages; }
export function getSupportingDocuments() { return readUserState<{ documents?: SavedDocument[] }>("documents.json", { documents: [] }).documents ?? []; }
export function getBrandProfile(athleteId = defaultAthleteId): AthleteBrandProfile { return seedBrandProfiles.find((item) => item.athleteId === athleteId) ?? { athleteId, handles: emptyBrandHandles, latestPosts: [], metrics: { followers: 0, weeklyReach: 0, engagementRate: 0, profileClicks: 0 }, agentRecommendations: [] }; }
export function getAthleteHeroMedia(): AthleteHeroMedia { const hero = readUserState<{ playerCutoutUrl?: string; backgroundVideoUrl?: string; backgroundVideoTitle?: string }>("hero-media.json", {}); return { title: hero.backgroundVideoTitle || "Athlete media", videoUrl: hero.backgroundVideoUrl, playerCutoutUrl: hero.playerCutoutUrl, fallbackText: "Upload hero media from Profile Studio." }; }
export function getCoachConnection() { return { name: "Coach Marcus Davis", title: "Head Coach", orgName: "North Ridge High", connected: false }; }
