"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deriveAthleteEligibility } from "@/lib/athlete-eligibility";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function userStatePath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", fileName);
}

export async function saveAthleteProfileDetails(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("profile.json");
  let status = "profile-saved";

  try {
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});
    const dateOfBirth = value(formData, "dateOfBirth") || String(existing.dateOfBirth ?? "");
    const eligibility = deriveAthleteEligibility(dateOfBirth);
    const athleteId = String(existing.athleteId || value(formData, "athleteId") || `MYD1-${randomUUID().slice(0, 8).toUpperCase()}`);
    const currentTeam = value(formData, "currentTeam") || String(existing.currentTeam ?? "Unassigned");

    const payload = {
      ...existing,
      athleteId,
      fullName: value(formData, "fullName"),
      dateOfBirth,
      age: eligibility.age,
      competitionDivision: eligibility.competitionDivision,
      competitionDivisionLabel: eligibility.competitionDivisionLabel,
      verifiedAthlete: value(formData, "verifiedAthlete") || String(existing.verifiedAthlete ?? "Pending"),
      currentTeam,
      activeWristbandId: value(formData, "activeWristbandId") || String(existing.activeWristbandId ?? "None"),
      lastCheckIn: value(formData, "lastCheckIn") || String(existing.lastCheckIn ?? ""),
      eventsPlayed: numberValue(formData, "eventsPlayed", Number(existing.eventsPlayed ?? 0)),
      weighIns: numberValue(formData, "weighIns", Number(existing.weighIns ?? 0)),
      wins: numberValue(formData, "wins", Number(existing.wins ?? 0)),
      championships: numberValue(formData, "championships", Number(existing.championships ?? 0)),
      sport: value(formData, "sport"),
      primaryPosition: value(formData, "primaryPosition"),
      secondaryPosition: value(formData, "secondaryPosition"),
      jerseyNumber: value(formData, "jerseyNumber"),
      schoolName: value(formData, "schoolName"),
      classYear: Number(value(formData, "classYear")) || existing.classYear,
      hometown: value(formData, "hometown"),
      bio: value(formData, "bio"),
      skills: formData.getAll("skills").map(String),
      updatedAt: new Date().toISOString()
    };

    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-current");
  } catch {
    status = "profile-error";
  }

  redirect(`/profile?status=${status}`);
}
