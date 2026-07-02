"use server";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";

export type RoleProfilePhotoState = {
  status: "idle" | "success" | "error";
  message: string;
  photoUrl?: string;
};

const ROLE_PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const allowedRoles = new Set(["athlete", "family", "coach", "recruiter", "media", "organization", "admin"]);

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function userStatePath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", fileName);
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function saveUploadedImage(file: File, role: string) {
  if (!file || file.size === 0) throw new Error("Choose an image before saving.");
  if (!file.type.startsWith("image/")) throw new Error("Choose a PNG, JPG, WEBP, or GIF image.");
  if (file.size > ROLE_PROFILE_PHOTO_MAX_BYTES) throw new Error("Choose an image under 5 MB.");

  const safeName = `${role}-profile-${Date.now()}-${cleanFileName(file.name)}`;
  const uploadsDir = resolve(process.cwd(), "public", "uploads", "role-profiles");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(resolve(uploadsDir, safeName), Buffer.from(await file.arrayBuffer()));

  return {
    name: file.name,
    url: `/uploads/role-profiles/${safeName}`,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  };
}

export async function saveRoleWorkspaceProfilePicture(_prevState: RoleProfilePhotoState, formData: FormData): Promise<RoleProfilePhotoState> {
  try {
    const role = String(formData.get("role") ?? "").trim();
    if (!allowedRoles.has(role)) throw new Error("Unknown workspace role.");

    const file = formData.get("profilePicture");
    if (!(file instanceof File)) throw new Error("Choose an image before saving.");

    const upload = await saveUploadedImage(file, role);
    const dir = resolve(process.cwd(), "..", "data", "user-state");
    const filePath = userStatePath("role-workspaces.json");
    await mkdir(dir, { recursive: true });

    const existing = await readJsonFile<Record<string, Record<string, unknown>>>(filePath, {});
    const currentRoleState = existing[role] ?? {};
    const next = {
      ...existing,
      [role]: {
        ...currentRoleState,
        profilePhotoUrl: upload.url,
        profilePhotoName: upload.name,
        profilePhotoType: upload.type,
        profilePhotoSize: upload.size,
        profilePhotoUpdatedAt: upload.uploadedAt
      }
    };

    await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

    revalidatePath(`/${role === "organization" ? "organization" : role}`);
    revalidatePath("/search");
    revalidatePath("/media");
    revalidatePath("/coach");
    revalidatePath("/organization");

    return { status: "success", message: "Profile picture saved to the workspace backend.", photoUrl: upload.url };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile picture could not be saved." };
  }
}
