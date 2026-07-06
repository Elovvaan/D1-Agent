"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const PAGE_PROFILES_FILE = "page-profiles.json";
const PAGE_ASSET_MAX_BYTES = 25 * 1024 * 1024;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function savePageAsset(formData: FormData, fileKey: string, fallbackKey: string, ownerKey: string, kind: "cover" | "badge" | "video") {
  const uploaded = formData.get(fileKey);
  const fallback = value(formData, fallbackKey);
  if (!(uploaded instanceof File) || uploaded.size === 0) return fallback;
  if (uploaded.size > PAGE_ASSET_MAX_BYTES) return fallback;
  const isVideo = kind === "video";
  if (isVideo && !uploaded.type.startsWith("video/")) return fallback;
  if (!isVideo && !uploaded.type.startsWith("image/")) return fallback;
  const dir = resolve(process.cwd(), "..", "data", "user-state", "uploads");
  await mkdir(dir, { recursive: true });
  const safeName = `${ownerKey}-${kind}-${Date.now()}-${cleanFileName(uploaded.name)}`;
  await writeFile(resolve(dir, safeName), Buffer.from(await uploaded.arrayBuffer()));
  return `/api/uploads/${safeName}`;
}

function safePreviewPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function savePreviewPageProfile(formData: FormData) {
  const pageKey = value(formData, "pageKey") || "home";
  const previewPath = safePreviewPath(value(formData, "previewPath") || "/");
  const back = value(formData, "back").startsWith("/operations") ? value(formData, "back") : "/operations";
  const coverImageUrl = await savePageAsset(formData, "coverImageFile", "coverImageUrl", pageKey, "cover");
  const badgeImageUrl = await savePageAsset(formData, "badgeImageFile", "badgeImageUrl", pageKey, "badge");
  const featureVideoUrl = await savePageAsset(formData, "featureVideoFile", "featureVideoUrl", pageKey, "video");

  await appendUserState(PAGE_PROFILES_FILE, {
    id: `page-profile-${pageKey}-preview-${randomUUID()}`,
    pageKey,
    stateCode: "",
    headline: value(formData, "headline"),
    subheadline: value(formData, "subheadline"),
    body: value(formData, "body"),
    coverImageUrl,
    badgeImageUrl,
    featureVideoUrl,
    ctaLabel: value(formData, "ctaLabel"),
    ctaHref: value(formData, "ctaHref"),
    updatedAt: new Date().toISOString()
  });

  revalidatePath("/");
  revalidatePath(previewPath);
  revalidatePath("/operations");
  redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=preview-saved`);
}
