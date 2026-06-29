"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { redirect } from "next/navigation";
import type { ProgressionLevel } from "@d1/shared";
import { buildProgressionFields, determineProgressionLevelFromEducation } from "@/lib/data/services";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function writeOnboardingAction(step: string, payload: Record<string, string>) {
  const id = `athlete-onboarding-${step}-${randomUUID()}`;
  const dir = resolve(process.cwd(), "..", "data", "athlete-onboarding");
  await mkdir(dir, { recursive: true });
  await writeFile(
    resolve(dir, `${id}.json`),
    `${JSON.stringify({ id, step, occurredAt: new Date().toISOString(), ...payload }, null, 2)}\n`,
    "utf8"
  );
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function persistProgression(level: ProgressionLevel, note: string) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = resolve(dir, "profile.json");
  await mkdir(dir, { recursive: true });
  const existing = await readJsonFile<Record<string, unknown>>(filePath, {});
  await writeFile(filePath, `${JSON.stringify({ ...existing, ...buildProgressionFields(level, [], note) }, null, 2)}\n`, "utf8");
}

export async function recordAthleteSignup(formData: FormData) {
  const override = value(formData, "progressionOverride");
  const inferredLevel = determineProgressionLevelFromEducation(value(formData, "educationLevel") || value(formData, "classYear"));
  const progressionLevel = ["A1", "B1", "C1", "D1"].includes(override) ? (override as ProgressionLevel) : inferredLevel;
  await writeOnboardingAction("signup", {
    fullName: value(formData, "fullName"),
    email: value(formData, "email"),
    classYear: value(formData, "classYear"),
    educationLevel: value(formData, "educationLevel"),
    progressionLevel
  });
  await persistProgression(progressionLevel, "Progression assigned during athlete onboarding.");
}

export async function recordSchoolTeamSport(formData: FormData) {
  await writeOnboardingAction("school-team-sport", {
    schoolName: value(formData, "schoolName"),
    teamName: value(formData, "teamName"),
    sport: value(formData, "sport"),
    position: value(formData, "position")
  });
}

export async function recordPublicPlayerClaim(formData: FormData) {
  await writeOnboardingAction("public-player-claim", {
    importedPlayerId: value(formData, "importedPlayerId"),
    playerName: value(formData, "playerName"),
    sourceUrl: value(formData, "sourceUrl"),
    matchStatus: value(formData, "matchStatus")
  });
}

export async function recordManualUnmatchedProfile(formData: FormData) {
  await writeOnboardingAction("manual-unmatched-profile", {
    fullName: value(formData, "fullName"),
    schoolName: value(formData, "schoolName"),
    sport: value(formData, "sport"),
    position: value(formData, "position"),
    matchStatus: "unmatched public profile"
  });
}

export async function recordAthleteProfileCompletion(formData: FormData) {
  await writeOnboardingAction("profile-completion", {
    bio: value(formData, "bio"),
    hometown: value(formData, "hometown"),
    heightWeight: value(formData, "heightWeight"),
    gpa: value(formData, "gpa")
  });
}

export async function recordAthleteBrandLinks(formData: FormData) {
  await writeOnboardingAction("brand-links", {
    instagram: value(formData, "instagram"),
    tiktok: value(formData, "tiktok"),
    youtube: value(formData, "youtube"),
    hudl: value(formData, "hudl"),
    website: value(formData, "website")
  });
}

export async function recordCoachInvite(formData: FormData) {
  await writeOnboardingAction("coach-invite", {
    coachName: value(formData, "coachName"),
    coachEmail: value(formData, "coachEmail"),
    verificationSubject: "imported roster and athlete profile verification"
  });
}

export async function recordGuardianConsent(formData: FormData) {
  await writeOnboardingAction("guardian-consent", {
    athleteIsMinor: value(formData, "athleteIsMinor"),
    guardianName: value(formData, "guardianName"),
    guardianEmail: value(formData, "guardianEmail"),
    consentRequired: value(formData, "athleteIsMinor") === "true" ? "true" : "false"
  });
}

export async function completeAthleteOnboarding(formData: FormData) {
  const athleteId = value(formData, "athleteId");
  await writeOnboardingAction("complete", {
    athleteId,
    redirectPublicProfile: `/athletes/${athleteId}`,
    redirectCommandCenter: "/"
  });
  redirect(`/athletes/${athleteId}?next=/`);
}
