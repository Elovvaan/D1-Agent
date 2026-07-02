"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";

export type RoleProfilePhotoState = {
  status: "idle" | "success" | "error";
  message: string;
  photoUrl?: string;
};

type SavedUpload = {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  storage: "railway-r2" | "local-public";
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

function hasRailwayR2Config() {
  return Boolean(
    process.env.RAILWAY_R2_ENDPOINT &&
    process.env.RAILWAY_R2_ACCESS_KEY_ID &&
    process.env.RAILWAY_R2_SECRET_ACCESS_KEY &&
    process.env.RAILWAY_R2_BUCKET &&
    process.env.RAILWAY_R2_PUBLIC_URL
  );
}

function r2Client() {
  return new S3Client({
    region: process.env.RAILWAY_R2_REGION || "auto",
    endpoint: process.env.RAILWAY_R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.RAILWAY_R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.RAILWAY_R2_SECRET_ACCESS_KEY || ""
    }
  });
}

function publicR2Url(key: string) {
  const base = String(process.env.RAILWAY_R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
}

async function saveLocalPublicImage(file: File, safeName: string, uploadedAt: string): Promise<SavedUpload> {
  const uploadsDir = resolve(process.cwd(), "public", "uploads", "role-profiles");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(resolve(uploadsDir, safeName), Buffer.from(await file.arrayBuffer()));

  return {
    name: file.name,
    url: `/uploads/role-profiles/${safeName}`,
    size: file.size,
    type: file.type,
    uploadedAt,
    storage: "local-public"
  };
}

async function saveRailwayR2Image(file: File, safeName: string, uploadedAt: string): Promise<SavedUpload> {
  const key = `role-profiles/${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());

  await r2Client().send(
    new PutObjectCommand({
      Bucket: process.env.RAILWAY_R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    name: file.name,
    url: publicR2Url(key),
    size: file.size,
    type: file.type,
    uploadedAt,
    storage: "railway-r2"
  };
}

async function saveUploadedImage(file: File, role: string): Promise<SavedUpload> {
  if (!file || file.size === 0) throw new Error("Choose an image before saving.");
  if (!file.type.startsWith("image/")) throw new Error("Choose a PNG, JPG, WEBP, or GIF image.");
  if (file.size > ROLE_PROFILE_PHOTO_MAX_BYTES) throw new Error("Choose an image under 5 MB.");

  const uploadedAt = new Date().toISOString();
  const safeName = `${role}-profile-${Date.now()}-${cleanFileName(file.name)}`;

  if (hasRailwayR2Config()) {
    return saveRailwayR2Image(file, safeName, uploadedAt);
  }

  return saveLocalPublicImage(file, safeName, uploadedAt);
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
        profilePhotoStorage: upload.storage,
        profilePhotoUpdatedAt: upload.uploadedAt
      }
    };

    await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

    revalidatePath(`/${role === "organization" ? "organization" : role}`);
    revalidatePath("/search");
    revalidatePath("/media");
    revalidatePath("/coach");
    revalidatePath("/organization");

    return {
      status: "success",
      message: upload.storage === "railway-r2" ? "Profile picture saved to Railway durable storage." : "Profile picture saved locally. Add Railway R2 variables for durable storage.",
      photoUrl: upload.url
    };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile picture could not be saved." };
  }
}
