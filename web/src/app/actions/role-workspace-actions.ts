"use server";

import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { deriveAthleteEligibility } from "@/lib/athlete-eligibility";

export type RoleProfilePhotoState = {
  status: "idle" | "success" | "error";
  message: string;
  photoUrl?: string;
};

export type RoleProfileDetailsState = {
  status: "idle" | "success" | "error";
  message: string;
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

const roleProfileFields: Record<string, string[]> = {
  athlete: ["athleteId", "displayName", "dateOfBirth", "age", "competitionDivision", "verifiedAthlete", "currentTeam", "activeWristbandId", "lastCheckIn", "eventsPlayed", "weighIns", "wins", "championships", "nickname", "city", "sport", "position", "schoolName", "classYear", "bio", "skills"],
  family: ["displayName", "relationship", "linkedAthlete", "city", "phone", "contactPreference", "bio"],
  coach: ["displayName", "title", "organizationName", "sport", "city", "teamLevel", "bio"],
  recruiter: ["displayName", "organizationName", "region", "sportsCovered", "contactEmail", "bio"],
  media: ["brandName", "contactName", "coverageArea", "services", "website", "bio"],
  organization: ["organizationName", "schoolType", "city", "state", "sportsOffered", "mainContact", "website", "bio"],
  admin: ["displayName", "adminRole", "department", "coverageArea", "contactEmail", "bio"]
};

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function userStatePath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", fileName);
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberText(formData: FormData, key: string) {
  const raw = value(formData, key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : "0";
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function hasRailwayR2Config() {
  return Boolean(process.env.RAILWAY_R2_ENDPOINT && process.env.RAILWAY_R2_ACCESS_KEY_ID && process.env.RAILWAY_R2_SECRET_ACCESS_KEY && process.env.RAILWAY_R2_BUCKET && process.env.RAILWAY_R2_PUBLIC_URL);
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function sha256Hex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function hmacHex(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function signingKey(secret: string, dateStamp: string, region: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

function publicR2Url(key: string) {
  const base = String(process.env.RAILWAY_R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key.split("/").map(encodePathSegment).join("/")}`;
}

async function saveLocalPublicImage(file: File, safeName: string, uploadedAt: string): Promise<SavedUpload> {
  const uploadsDir = resolve(process.cwd(), "public", "uploads", "role-profiles");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(resolve(uploadsDir, safeName), Buffer.from(await file.arrayBuffer()));
  return { name: file.name, url: `/uploads/role-profiles/${safeName}`, size: file.size, type: file.type, uploadedAt, storage: "local-public" };
}

async function saveRailwayR2Image(file: File, safeName: string, uploadedAt: string): Promise<SavedUpload> {
  const endpoint = String(process.env.RAILWAY_R2_ENDPOINT || "").replace(/\/$/, "");
  const accessKeyId = String(process.env.RAILWAY_R2_ACCESS_KEY_ID || "");
  const secretAccessKey = String(process.env.RAILWAY_R2_SECRET_ACCESS_KEY || "");
  const bucket = String(process.env.RAILWAY_R2_BUCKET || "");
  const region = String(process.env.RAILWAY_R2_REGION || "auto");
  const key = `role-profiles/${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const endpointUrl = new URL(endpoint);
  const canonicalUri = `/${encodePathSegment(bucket)}/${key.split("/").map(encodePathSegment).join("/")}`;
  const uploadUrl = `${endpoint}${canonicalUri}`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = `content-type:${contentType}\nhost:${endpointUrl.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmacHex(signingKey(secretAccessKey, dateStamp, region), stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(uploadUrl, { method: "PUT", headers: { Authorization: authorization, "Content-Type": contentType, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate, "Cache-Control": "public, max-age=31536000, immutable" }, body });
  if (!response.ok) throw new Error(`Railway R2 upload failed (${response.status}). ${await response.text().catch(() => "")}`.trim());
  return { name: file.name, url: publicR2Url(key), size: file.size, type: file.type, uploadedAt, storage: "railway-r2" };
}

async function saveUploadedImage(file: File, role: string): Promise<SavedUpload> {
  if (!file || file.size === 0) throw new Error("Choose an image before saving.");
  if (!file.type.startsWith("image/")) throw new Error("Choose a PNG, JPG, WEBP, or GIF image.");
  if (file.size > ROLE_PROFILE_PHOTO_MAX_BYTES) throw new Error("Choose an image under 5 MB.");
  const uploadedAt = new Date().toISOString();
  const safeName = `${role}-profile-${Date.now()}-${cleanFileName(file.name)}`;
  if (hasRailwayR2Config()) return saveRailwayR2Image(file, safeName, uploadedAt);
  return saveLocalPublicImage(file, safeName, uploadedAt);
}

function rolePath(role: string) {
  return role === "organization" ? "/organization" : role === "admin" ? "/operations" : `/${role}`;
}

async function readRoleWorkspaceFile() {
  const filePath = userStatePath("role-workspaces.json");
  const existing = await readJsonFile<Record<string, Record<string, unknown>>>(filePath, {});
  return { filePath, existing };
}

async function writeRoleWorkspace(role: string, updates: Record<string, unknown>) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  await mkdir(dir, { recursive: true });
  const { filePath, existing } = await readRoleWorkspaceFile();
  const currentRoleState = existing[role] ?? {};
  const next = { ...existing, [role]: { ...currentRoleState, ...updates } };
  await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export async function saveRoleWorkspaceProfile(_prevState: RoleProfileDetailsState, formData: FormData): Promise<RoleProfileDetailsState> {
  try {
    const role = value(formData, "role");
    if (!allowedRoles.has(role)) throw new Error("Unknown workspace role.");
    const allowedFields = roleProfileFields[role] ?? [];
    const profile = allowedFields.reduce<Record<string, string | string[]>>((payload, field) => {
      if (field === "skills") payload[field] = formData.getAll(field).map(String);
      else if (["eventsPlayed", "weighIns", "wins", "championships"].includes(field)) payload[field] = numberText(formData, field);
      else payload[field] = value(formData, field);
      return payload;
    }, {});

    if (role === "athlete") {
      const existing = (await readRoleWorkspaceFile()).existing.athlete?.profile as Record<string, string | string[]> | undefined;
      const athleteId = String(profile.athleteId || existing?.athleteId || `MYD1-${randomUUID().slice(0, 8).toUpperCase()}`);
      const eligibility = deriveAthleteEligibility(String(profile.dateOfBirth || ""));
      profile.athleteId = athleteId;
      profile.age = eligibility.age === undefined ? "" : String(eligibility.age);
      profile.competitionDivision = eligibility.competitionDivision;
      profile.verifiedAthlete = String(profile.verifiedAthlete || existing?.verifiedAthlete || "Pending");
      profile.currentTeam = String(profile.currentTeam || "Unassigned");
      profile.activeWristbandId = String(profile.activeWristbandId || "None");
    }

    await writeRoleWorkspace(role, { profile, profileUpdatedAt: new Date().toISOString() });
    revalidatePath(rolePath(role));
    revalidatePath("/search");
    return { status: "success", message: "Profile details saved." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile details could not be saved." };
  }
}

export async function saveRoleWorkspaceProfilePicture(_prevState: RoleProfilePhotoState, formData: FormData): Promise<RoleProfilePhotoState> {
  try {
    const role = value(formData, "role");
    if (!allowedRoles.has(role)) throw new Error("Unknown workspace role.");
    const file = formData.get("profilePicture");
    if (!(file instanceof File)) throw new Error("Choose an image before saving.");
    const upload = await saveUploadedImage(file, role);
    await writeRoleWorkspace(role, { profilePhotoUrl: upload.url, profilePhotoUpdatedAt: upload.uploadedAt });
    revalidatePath(rolePath(role));
    revalidatePath("/search");
    return { status: "success", message: "Profile picture saved.", photoUrl: upload.url };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile picture could not be saved." };
  }
}
