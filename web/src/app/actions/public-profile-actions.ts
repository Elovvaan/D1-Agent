"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProgressionLevel } from "@d1/shared";
import { buildProgressionFields } from "@/lib/data/services";

export type ProfilePictureActionState = {
  status: "idle" | "success" | "error";
  message: string;
  avatarUrl?: string;
};

const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;
const HERO_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function writePublicProfileAction(kind: string, payload: Record<string, string>) {
  const now = new Date().toISOString();
  const id = `${kind}-${randomUUID()}`;
  const dir = resolve(process.cwd(), "..", "data", "public-profile-actions");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${id}.json`), `${JSON.stringify({ id, kind, occurredAt: now, ...payload }, null, 2)}\n`, "utf8");
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

function publicUploadPath(fileName: string) {
  return resolve(process.cwd(), "public", "uploads", fileName);
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function saveUploadedFile(file: File, prefix: string, accept?: "image" | "video") {
  if (!file || file.size === 0) {
    throw new Error("No file was selected.");
  }
  if (accept === "image" && !file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (accept === "image" && file.size > PROFILE_PICTURE_MAX_BYTES) {
    throw new Error("Choose an image under 5 MB.");
  }
  if (accept === "video" && !file.type.startsWith("video/")) {
    throw new Error("Choose a video file.");
  }
  if (accept === "video" && file.size > HERO_VIDEO_MAX_BYTES) {
    throw new Error("Choose a video under 50 MB.");
  }

  const safeName = `${prefix}-${Date.now()}-${cleanFileName(file.name)}`;
  await mkdir(resolve(process.cwd(), "public", "uploads"), { recursive: true });
  await writeFile(publicUploadPath(safeName), Buffer.from(await file.arrayBuffer()));

  return {
    name: file.name,
    url: `/uploads/${safeName}`,
    size: String(file.size),
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString()
  };
}

export async function recordVisibilityControl(formData: FormData) {
  const athleteId = value(formData, "athleteId");
  const profileDir = resolve(process.cwd(), "..", "data", "user-state");
  const profilePath = userStatePath("profile.json");
  await mkdir(profileDir, { recursive: true });
  const existingProfile = await readJsonFile<Record<string, unknown>>(profilePath, {});
  await writeFile(profilePath, `${JSON.stringify({ ...existingProfile, visibility: value(formData, "visibility"), visibilityUpdatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
  await writePublicProfileAction("visibility-control", {
    athleteId,
    requestedVisibility: value(formData, "visibility"),
    currentVisibility: value(formData, "currentVisibility")
  });
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?status=visibility-saved`);
}

export async function saveProfileVisibility(formData: FormData) {
  const athleteId = value(formData, "athleteId") || "athlete-jayden-lewis";
  const visibility = value(formData, "visibility");
  const allowedVisibility = ["public", "recruiters_only", "private"].includes(visibility) ? visibility : "private";
  let status = "visibility-saved";

  try {
    const profileDir = resolve(process.cwd(), "..", "data", "user-state");
    const profilePath = userStatePath("profile.json");
    await mkdir(profileDir, { recursive: true });
    const existingProfile = await readJsonFile<Record<string, unknown>>(profilePath, {});
    await writeFile(profilePath, `${JSON.stringify({ ...existingProfile, visibility: allowedVisibility, visibilityUpdatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
    await writePublicProfileAction("profile-visibility-control", {
      athleteId,
      requestedVisibility: allowedVisibility,
      currentVisibility: value(formData, "currentVisibility")
    });
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/athletes/${athleteId}`);
  } catch {
    status = "visibility-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function recordRecruiterInterest(formData: FormData) {
  const athleteId = value(formData, "athleteId");
  const isMinor = value(formData, "isMinor") === "true";
  await writePublicProfileAction("recruiter-interest", {
    athleteId,
    athleteName: value(formData, "athleteName"),
    source: "public-athlete-homepage",
    routing: isMinor ? "d1-inbox-guardian-approval-required" : "d1-inbox",
    directContactExposed: "false"
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?status=interest-sent`);
}

export async function saveProfileDetails(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("profile.json");
  let status = "profile-saved";

  try {
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});

    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          ...existing,
          fullName: value(formData, "fullName"),
          sport: value(formData, "sport"),
          primaryPosition: value(formData, "primaryPosition"),
          secondaryPosition: value(formData, "secondaryPosition"),
          jerseyNumber: value(formData, "jerseyNumber"),
          schoolName: value(formData, "schoolName"),
          classYear: Number(value(formData, "classYear")) || existing.classYear,
          hometown: value(formData, "hometown"),
          bio: value(formData, "bio"),
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "profile-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function saveProfilePicture(_prevState: ProfilePictureActionState, formData: FormData): Promise<ProfilePictureActionState> {
  try {
    const file = formData.get("profilePicture");
    if (!(file instanceof File)) {
      return { status: "error", message: "Choose an image before saving." };
    }

    const upload = await saveUploadedFile(file, "profile-picture", "image");
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("profile.json");
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});

    await writeFile(filePath, `${JSON.stringify({ ...existing, avatarUrl: upload.url, avatarUpdatedAt: upload.uploadedAt }, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    return {
      status: "success",
      message: "Profile picture saved and updated across the app.",
      avatarUrl: upload.url
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Profile picture could not be saved."
    };
  }
}

export async function saveTranscriptUpload(formData: FormData) {
  let status = "transcript-uploaded";
  try {
    const file = formData.get("transcript");
    const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "transcript");
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("documents.json");
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});

    await writeFile(filePath, `${JSON.stringify({ ...existing, transcript: upload }, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/trust");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "transcript-error";
  }

  redirect(`/trust?status=${status}`);
}

export async function savePublicProfileIntake(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("profile-intake.json");
  const existing = await readJsonFile<{
    measurables?: Record<string, string>;
    academics?: Record<string, string>;
    athletics?: Record<string, string>;
    sources?: Record<string, string>;
  }>(filePath, { measurables: {}, academics: {}, athletics: {}, sources: {} });
  const payload = {
    measurables: {
      height: value(formData, "height").trim(),
      weight: value(formData, "weight").trim(),
      wingspan: value(formData, "wingspan").trim(),
      fortyYardDash: value(formData, "fortyYardDash").trim(),
      verticalJump: value(formData, "verticalJump").trim(),
      benchPress: value(formData, "benchPress").trim(),
      sportSpecificMetrics: value(formData, "sportSpecificMetrics").trim()
    },
    academics: {
      gpa: value(formData, "gpa").trim(),
      satScore: value(formData, "satScore").trim(),
      actScore: value(formData, "actScore").trim(),
      academicEligibilityNotes: value(formData, "academicEligibilityNotes").trim()
    },
    athletics: existing.athletics ?? {},
    sources: {
      ...(existing.sources ?? {}),
      height: "Self-reported",
      weight: "Self-reported",
      wingspan: "Self-reported",
      fortyYardDash: "Self-reported",
      verticalJump: "Self-reported",
      benchPress: "Self-reported",
      sportSpecificMetrics: "Self-reported",
      gpa: "Self-reported",
      satScore: "Self-reported",
      actScore: "Self-reported",
      academicEligibilityNotes: "Self-reported"
    },
    updatedAt: new Date().toISOString()
  };

  let status = "public-profile-intake-saved";
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/trust");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "public-profile-intake-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function saveAthleticPerformanceIntake(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("profile-intake.json");
  let status = "performance-saved";
  try {
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<{
      measurables?: Record<string, string>;
      academics?: Record<string, string>;
      athletics?: Record<string, string>;
      sources?: Record<string, string>;
      updatedAt?: string;
    }>(filePath, { measurables: {}, academics: {}, athletics: {}, sources: {} });

    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          ...existing,
          athletics: {
            seasonStats: value(formData, "seasonStats").trim(),
            gameStats: value(formData, "gameStats").trim(),
            positionSpecificStats: value(formData, "positionSpecificStats").trim(),
            awardsHonors: value(formData, "awardsHonors").trim()
          },
          sources: {
            ...(existing.sources ?? {}),
            seasonStats: "Self-reported",
            gameStats: "Self-reported",
            positionSpecificStats: "Self-reported",
            awardsHonors: "Self-reported"
          },
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/performance");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "performance-error";
  }

  redirect(`/performance?status=${status}`);
}

export async function saveAthleteProgression(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("profile.json");
  const selectedLevel = value(formData, "progressionLevel") as ProgressionLevel;
  const returnTo = value(formData, "returnTo") || "/profile";
  const completed = value(formData, "completedMilestones")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const validLevel: ProgressionLevel = ["A1", "B1", "C1", "D1"].includes(selectedLevel) ? selectedLevel : "B1";
  const progressionFields = buildProgressionFields(validLevel, completed, "Progression manually updated from Profile.");
  const percentOverride = Number(value(formData, "progressionPercent"));
  const payload = {
    ...progressionFields,
    progressionStage: value(formData, "progressionStage").trim() || progressionFields.progressionStage,
    progressionPercent: Number.isFinite(percentOverride) ? Math.max(0, Math.min(100, percentOverride)) : progressionFields.progressionPercent
  };

  let status = "progression-saved";
  try {
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});
    await writeFile(filePath, `${JSON.stringify({ ...existing, ...payload, progressionUpdatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/performance");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "progression-error";
  }

  redirect(`${returnTo}?status=${status}`);
}

export async function saveSupportingDocument(formData: FormData) {
  let status = "supporting-document-uploaded";
  try {
    const file = formData.get("supportingDocument");
    const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "supporting-document");
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("documents.json");
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<{ supportingDocuments?: Array<Record<string, string>> }>(filePath, {});
    const supportingDocuments = Array.isArray(existing.supportingDocuments) ? existing.supportingDocuments : [];
    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          ...existing,
          supportingDocuments: [
            {
              ...upload,
              kind: value(formData, "documentKind") || "Supporting document",
              source: "Document uploaded",
              reviewState: "pending review"
            },
            ...supportingDocuments
          ]
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/trust");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "supporting-document-error";
  }

  redirect(`/trust?status=${status}`);
}

export async function saveBrandLinks(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("brand-links.json");
  const links = {
    instagram: value(formData, "instagram").trim(),
    tiktok: value(formData, "tiktok").trim(),
    youtube: value(formData, "youtube").trim(),
    hudl: value(formData, "hudl").trim(),
    x: value(formData, "x").trim(),
    website: value(formData, "website").trim()
  };

  let status = "brand-links-saved";
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, `${JSON.stringify({ ...links, updatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "brand-links-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function saveAccountPreferences(formData: FormData) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("account-settings.json");
  let status = "settings-saved";

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          email: value(formData, "email").trim(),
          recruitingDigest: value(formData, "recruitingDigest") === "on",
          messageAlerts: value(formData, "messageAlerts") === "on",
          profilePrivacySummary: value(formData, "profilePrivacySummary"),
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    revalidatePath("/settings");
  } catch {
    status = "settings-error";
  }

  redirect(`/settings?status=${status}`);
}

export async function saveHeroPlayerPhoto(formData: FormData) {
  let status = "hero-player-photo-saved";
  try {
    const file = formData.get("heroPlayerPhoto");
    const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "hero-player-photo", "image");
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("hero-media.json");
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});

    await writeFile(filePath, `${JSON.stringify({ ...existing, playerCutoutUrl: upload.url, playerCutoutUpdatedAt: upload.uploadedAt }, null, 2)}\n`, "utf8");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "hero-player-photo-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function saveHeroBackgroundVideo(formData: FormData) {
  let status = "hero-background-video-saved";
  try {
    const file = formData.get("heroBackgroundVideo");
    const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "hero-background-video", "video");
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("hero-media.json");
    await mkdir(dir, { recursive: true });
    const existing = await readJsonFile<Record<string, unknown>>(filePath, {});

    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          ...existing,
          backgroundVideoUrl: upload.url,
          backgroundVideoTitle: value(formData, "heroBackgroundTitle") || upload.name,
          backgroundVideoUpdatedAt: upload.uploadedAt
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-jayden-lewis");
  } catch {
    status = "hero-background-video-error";
  }

  redirect(`/profile?status=${status}`);
}

export async function saveFilmUpload(formData: FormData) {
  const file = formData.get("film");
  const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "film");
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("uploads.json");
  await mkdir(dir, { recursive: true });
  const existing = await readJsonFile<{ films?: Array<Record<string, string>> }>(filePath, { films: [] });
  const films = Array.isArray(existing.films) ? existing.films : [];

  await writeFile(filePath, `${JSON.stringify({ ...existing, films: [{ ...upload, title: value(formData, "title") || upload.name }, ...films] }, null, 2)}\n`, "utf8");
  revalidatePath("/film");
  redirect("/film?status=film-uploaded");
}

export async function saveHighlightUpload(formData: FormData) {
  const file = formData.get("highlight");
  const upload = await saveUploadedFile(file instanceof File ? file : new File([], ""), "highlight");
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath("uploads.json");
  await mkdir(dir, { recursive: true });
  const existing = await readJsonFile<{ highlights?: Array<Record<string, string>> }>(filePath, { highlights: [] });
  const highlights = Array.isArray(existing.highlights) ? existing.highlights : [];

  await writeFile(
    filePath,
    `${JSON.stringify({ ...existing, highlights: [{ ...upload, title: value(formData, "title") || upload.name }, ...highlights] }, null, 2)}\n`,
    "utf8"
  );
  revalidatePath("/highlights");
  redirect("/highlights?status=highlight-uploaded");
}

export async function recordUnavailableAction(formData: FormData) {
  const returnTo = value(formData, "returnTo") || "/";
  const action = value(formData, "action") || "action";
  await writePublicProfileAction("unavailable-action", {
    action,
    reason: value(formData, "reason") || "This workflow requires the connected production backend."
  });
  redirect(`${returnTo}?status=${encodeURIComponent(`${action}-unavailable`)}`);
}
