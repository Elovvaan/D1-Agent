"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMediaConnection, recordMediaImport, recordMediaSyncRun, updateMediaReviewStatus, type MediaPlatform } from "@/lib/services/media-agent-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function platformValue(formData: FormData): MediaPlatform {
  const platform = value(formData, "platform").toLowerCase();
  if (["instagram", "tiktok", "youtube", "x", "facebook"].includes(platform)) return platform as MediaPlatform;
  return "instagram";
}

export async function connectMediaAccount(formData: FormData) {
  await createMediaConnection({
    athleteId: value(formData, "athleteId") || "athlete-current",
    athleteName: value(formData, "athleteName") || "Current Athlete",
    platform: platformValue(formData),
    handle: value(formData, "handle"),
    profileUrl: value(formData, "profileUrl")
  });
  revalidatePath("/media-connections");
  revalidatePath("/operations/media-connections");
  redirect("/media-connections?status=connected");
}

export async function queueMediaImport(formData: FormData) {
  await recordMediaImport({
    athleteId: value(formData, "athleteId") || "athlete-current",
    athleteName: value(formData, "athleteName") || "Current Athlete",
    platform: platformValue(formData),
    sourceUrl: value(formData, "sourceUrl"),
    title: value(formData, "title") || "Connected media import",
    caption: value(formData, "caption"),
    mediaType: (value(formData, "mediaType") || "video") as "video" | "image" | "post"
  });
  revalidatePath("/media-connections");
  revalidatePath("/operations/media-connections");
  redirect("/operations/media-connections?status=queued");
}

export async function runMediaSync(formData: FormData) {
  await recordMediaSyncRun({
    connectionId: value(formData, "connectionId"),
    athleteId: value(formData, "athleteId") || "athlete-current",
    athleteName: value(formData, "athleteName") || "Current Athlete",
    platform: platformValue(formData)
  });
  revalidatePath("/media-connections");
  revalidatePath("/operations/media-connections");
  redirect("/operations/media-connections?status=sync-queued");
}

export async function reviewMediaItem(formData: FormData) {
  const action = value(formData, "reviewAction") === "reject" ? "rejected" : "approved";
  await updateMediaReviewStatus({ reviewId: value(formData, "reviewId"), status: action, notes: value(formData, "notes") });
  revalidatePath("/operations/media-connections");
  redirect(`/operations/media-connections?status=${action}`);
}
