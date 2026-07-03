"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const STATE_PROFILES_FILE = "state-profiles.json";
const OPERATOR_AUDIT_FILE = "operator-audit.json";
const MAX_BYTES = 25 * 1024 * 1024;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function audit(action: string, payload: Record<string, unknown>) {
  await appendUserState(OPERATOR_AUDIT_FILE, { id: `operator-${randomUUID()}`, action, occurredAt: new Date().toISOString(), ...payload });
}

async function saveStateAsset(formData: FormData, fileKey: string, fallbackKey: string, ownerKey: string, kind: "cover" | "badge" | "video") {
  const uploaded = formData.get(fileKey);
  const fallback = value(formData, fallbackKey);
  if (!(uploaded instanceof File) || uploaded.size === 0) return fallback;
  if (uploaded.size > MAX_BYTES) return fallback;
  const isVideo = kind === "video";
  if (isVideo && !uploaded.type.startsWith("video/")) return fallback;
  if (!isVideo && !uploaded.type.startsWith("image/")) return fallback;

  const safeName = `${ownerKey}-${kind}-${Date.now()}-${cleanFileName(uploaded.name)}`;
  const dir = resolve(process.cwd(), "..", "data", "user-state", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, safeName), Buffer.from(await uploaded.arrayBuffer()));
  return `/api/uploads/${safeName}`;
}

export async function saveStateProfileV2(formData: FormData) {
  const stateCode = value(formData, "stateCode").toUpperCase();
  if (!stateCode) redirect("/operations?status=missing-state");

  const ownerKey = `state-${stateCode.toLowerCase()}`;
  const coverImageUrl = await saveStateAsset(formData, "coverImageFile", "coverImageUrl", ownerKey, "cover");
  const badgeImageUrl = await saveStateAsset(formData, "badgeImageFile", "badgeImageUrl", ownerKey, "badge");
  const featureVideoUrl = await saveStateAsset(formData, "featureVideoFile", "featureVideoUrl", ownerKey, "video");

  await appendUserState(STATE_PROFILES_FILE, {
    id: `state-profile-${stateCode}-${randomUUID()}`,
    stateCode,
    displayName: value(formData, "displayName"),
    tagline: value(formData, "tagline"),
    bio: value(formData, "bio"),
    coverImageUrl,
    badgeImageUrl,
    featureVideoUrl,
    primarySport: value(formData, "primarySport"),
    updatedAt: new Date().toISOString()
  });

  await audit("state-profile-saved", { stateCode, coverImageUrl, badgeImageUrl, featureVideoUrl });
  revalidatePath("/schools");
  revalidatePath(`/schools/${stateCode.toLowerCase()}`);
  revalidatePath("/operations");
  revalidatePath("/operations/profile-manager");
  redirect(`/operations?state=${stateCode}&status=state-profile-saved`);
}
