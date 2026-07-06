"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPageProfile } from "@/lib/data/page-profiles";
import { appendUserState } from "@/lib/data/platform-storage";

const PAGE_PROFILES_FILE = "page-profiles.json";
const SCHOOL_PROFILES_FILE = "school-profiles.json";
const PAGE_ASSET_MAX_BYTES = 25 * 1024 * 1024;

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function cleanFileName(fileName: string) { return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-"); }
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
function safePreviewPath(path: string) { return path.startsWith("/") && !path.startsWith("//") ? path : "/"; }
function parseInlineEdits(raw: string) {
  const output: Record<string, string> = {};
  try {
    const parsed = JSON.parse(raw || "{}");
    for (const [key, entry] of Object.entries(parsed as Record<string, { value?: unknown }>)) {
      const text = String(entry?.value ?? "").trim();
      if (text) output[key] = text;
    }
  } catch {}
  return output;
}
function firstValue(edits: Record<string, string>, words: string[]) { for (const [key, entry] of Object.entries(edits)) if (words.some((word) => key.includes(word))) return entry; return ""; }

export async function savePreviewPageProfile(formData: FormData) {
  const pageKey = value(formData, "pageKey") || "home";
  const previewPath = safePreviewPath(value(formData, "previewPath") || "/");
  const back = value(formData, "back").startsWith("/operations") ? value(formData, "back") : "/operations";
  const existing = getPageProfile(pageKey);
  const inlineEdits = parseInlineEdits(value(formData, "inlineEdits"));
  const coverImageUrl = await savePageAsset(formData, "coverImageFile", "coverImageUrl", pageKey, "cover");
  const badgeImageUrl = await savePageAsset(formData, "badgeImageFile", "badgeImageUrl", pageKey, "badge");
  const featureVideoUrl = await savePageAsset(formData, "featureVideoFile", "featureVideoUrl", pageKey, "video");
  await appendUserState(PAGE_PROFILES_FILE, {
    id: `page-profile-${pageKey}-preview-${randomUUID()}`,
    pageKey,
    stateCode: "",
    headline: value(formData, "headline") || firstValue(inlineEdits, ["headline", "h1"]) || existing?.headline || "",
    subheadline: value(formData, "subheadline") || firstValue(inlineEdits, ["subheadline", "tagline"]) || existing?.subheadline || "",
    body: value(formData, "body") || firstValue(inlineEdits, ["body", "copy"]) || existing?.body || "",
    coverImageUrl: coverImageUrl || existing?.coverImageUrl || "",
    badgeImageUrl: badgeImageUrl || existing?.badgeImageUrl || "",
    featureVideoUrl: featureVideoUrl || existing?.featureVideoUrl || "",
    ctaLabel: value(formData, "ctaLabel") || firstValue(inlineEdits, ["primary-cta", "cta"]) || existing?.ctaLabel || "",
    ctaHref: value(formData, "ctaHref") || existing?.ctaHref || "",
    inlineEdits: { ...(existing?.inlineEdits ?? {}), ...inlineEdits },
    updatedAt: new Date().toISOString()
  });
  revalidatePath("/");
  revalidatePath(previewPath);
  revalidatePath("/operations");
  redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=preview-saved`);
}

export async function savePreviewSchoolLogo(formData: FormData) {
  const schoolId = value(formData, "schoolId");
  const previewPath = safePreviewPath(value(formData, "previewPath") || "/schools");
  const back = value(formData, "back").startsWith("/operations") ? value(formData, "back") : "/operations";
  if (!schoolId) redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=missing-school`);
  const removeLogo = value(formData, "removeLogo") === "1";
  let logoImageUrl = "";
  if (!removeLogo) {
    const uploaded = formData.get("logoFile");
    if (!(uploaded instanceof File) || uploaded.size === 0 || !uploaded.type.startsWith("image/")) redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=no-logo-file`);
    if (uploaded.size > PAGE_ASSET_MAX_BYTES) redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=logo-too-large`);
    const dir = resolve(process.cwd(), "..", "data", "user-state", "uploads");
    await mkdir(dir, { recursive: true });
    const safeName = `school-${schoolId}-logo-${Date.now()}-${cleanFileName(uploaded.name)}`;
    await writeFile(resolve(dir, safeName), Buffer.from(await uploaded.arrayBuffer()));
    logoImageUrl = `/api/uploads/${safeName}`;
  }
  await appendUserState(SCHOOL_PROFILES_FILE, { id: `school-profile-${schoolId}-${randomUUID()}`, schoolId, logoImageUrl, updatedAt: new Date().toISOString() });
  revalidatePath("/schools");
  revalidatePath(previewPath);
  revalidatePath("/operations");
  redirect(`/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(back)}&status=school-logo-saved`);
}
