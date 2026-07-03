"use server";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";

export type ProfilePictureActionState = {
  status: "idle" | "success" | "error";
  message: string;
  avatarUrl?: string;
};

const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

function userStatePath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", fileName);
}

function uploadPath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", "uploads", fileName);
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function savePersistentProfilePicture(_prevState: ProfilePictureActionState, formData: FormData): Promise<ProfilePictureActionState> {
  try {
    const file = formData.get("profilePicture");
    if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose an image before saving." };
    if (!file.type.startsWith("image/")) return { status: "error", message: "Choose an image file." };
    if (file.size > PROFILE_PICTURE_MAX_BYTES) return { status: "error", message: "Choose an image under 5 MB." };

    const uploadedAt = new Date().toISOString();
    const safeName = `profile-picture-${Date.now()}-${cleanFileName(file.name)}`;
    const uploadsDir = resolve(process.cwd(), "..", "data", "user-state", "uploads");
    const profileDir = resolve(process.cwd(), "..", "data", "user-state");
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(profileDir, { recursive: true });
    await writeFile(uploadPath(safeName), Buffer.from(await file.arrayBuffer()));

    const avatarUrl = `/api/uploads/${safeName}`;
    const profilePath = userStatePath("profile.json");
    const existing = await readJsonFile<Record<string, unknown>>(profilePath, {});
    await writeFile(profilePath, `${JSON.stringify({ ...existing, avatarUrl, avatarUpdatedAt: uploadedAt }, null, 2)}\n`, "utf8");

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/athletes/athlete-current");

    return {
      status: "success",
      message: "Profile picture saved and updated across the app.",
      avatarUrl: `${avatarUrl}?v=${encodeURIComponent(uploadedAt)}`
    };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile picture could not be saved." };
  }
}
