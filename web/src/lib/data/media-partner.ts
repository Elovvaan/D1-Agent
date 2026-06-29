import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { MediaPartnerProfile, MediaPartnerSubmission } from "@d1/shared";
import { defaultAthleteId } from "./services";

const mediaPartnerDir = resolve(process.cwd(), "..", "data", "media-partner");

function readJsonFiles<T>(prefix: string) {
  if (!existsSync(mediaPartnerDir)) return [];
  return readdirSync(mediaPartnerDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(resolve(mediaPartnerDir, file), "utf8")) as T)
    .sort((a, b) => Date.parse(String((b as { uploadedAt?: string; createdAt?: string }).uploadedAt ?? (b as { createdAt?: string }).createdAt ?? "")) - Date.parse(String((a as { uploadedAt?: string; createdAt?: string }).uploadedAt ?? (a as { createdAt?: string }).createdAt ?? "")));
}

export function getMediaPartnerProfile() {
  return readJsonFiles<MediaPartnerProfile>("profile-")[0] ?? null;
}

export function getMediaPartnerSubmissions() {
  return readJsonFiles<MediaPartnerSubmission>("submission-");
}

export function getMediaPartnerLibrary() {
  return getMediaPartnerSubmissions();
}

export function getMediaPartnerDashboard() {
  const profile = getMediaPartnerProfile();
  const submissions = getMediaPartnerSubmissions();
  return {
    profile,
    submissions,
    reviewPending: submissions.filter((item) => item.approvalStatus === "review_pending").length,
    athleteApprovalRequired: submissions.filter((item) => item.approvalStatus === "athlete_approval_required").length,
    published: submissions.filter((item) => item.approvalStatus === "published" || item.visibility === "published").length,
    licenseRequired: submissions.filter((item) => item.licenseState === "paid_license_required").length
  };
}

export function getAthleteMediaApprovalQueue(athleteId = defaultAthleteId) {
  return getMediaPartnerSubmissions().filter((item) => item.attachedAthleteIds.includes(athleteId) && item.approvalStatus === "athlete_approval_required");
}

export function getApprovedMediaPartnerPublicMedia(athleteId = defaultAthleteId) {
  return getMediaPartnerSubmissions().filter((item) =>
    item.attachedAthleteIds.includes(athleteId) &&
    item.visibility === "published" &&
    (item.approvalStatus === "athlete_approved" || item.approvalStatus === "guardian_approved" || item.approvalStatus === "published")
  );
}
