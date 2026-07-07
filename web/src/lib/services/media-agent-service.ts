import { randomUUID } from "node:crypto";
import { appendUserState, readJsonSync, userStatePath } from "@/lib/data/platform-storage";

export type MediaPlatform = "instagram" | "tiktok" | "youtube" | "x" | "facebook";
export type MediaConnectionStatus = "connected" | "permission-needed" | "sync-paused" | "error";
export type MediaImportStatus = "imported" | "queued" | "review" | "published" | "rejected" | "failed";

export type MediaConnection = {
  id: string;
  athleteId: string;
  athleteName: string;
  platform: MediaPlatform;
  handle: string;
  profileUrl?: string;
  status: MediaConnectionStatus;
  permissionScope: string[];
  lastSyncAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MediaImport = {
  id: string;
  connectionId?: string;
  athleteId: string;
  athleteName: string;
  platform: MediaPlatform;
  sourceUrl: string;
  title: string;
  caption?: string;
  mediaType: "video" | "image" | "post";
  status: MediaImportStatus;
  createdAt: string;
  importedAt?: string;
};

export type MediaReviewItem = {
  id: string;
  importId: string;
  athleteId: string;
  athleteName: string;
  platform: MediaPlatform;
  title: string;
  sourceUrl: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
};

const MEDIA_CONNECTIONS_FILE = "media-connections.json";
const MEDIA_IMPORTS_FILE = "media-imports.json";
const MEDIA_REVIEW_QUEUE_FILE = "media-review-queue.json";

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function now() {
  return new Date().toISOString();
}

export function getMediaConnections() {
  return readItems<MediaConnection>(MEDIA_CONNECTIONS_FILE);
}

export function getMediaImports() {
  return readItems<MediaImport>(MEDIA_IMPORTS_FILE);
}

export function getMediaReviewQueue() {
  return readItems<MediaReviewItem>(MEDIA_REVIEW_QUEUE_FILE);
}

export function getConnectedMediaDashboard() {
  const connections = getMediaConnections();
  const imports = getMediaImports();
  const reviewQueue = getMediaReviewQueue();
  return {
    connections,
    imports,
    reviewQueue,
    totals: {
      connected: connections.filter((item) => item.status === "connected").length,
      needsPermission: connections.filter((item) => item.status === "permission-needed").length,
      imported: imports.length,
      pendingReview: reviewQueue.filter((item) => item.status === "pending").length,
      approved: reviewQueue.filter((item) => item.status === "approved").length,
      rejected: reviewQueue.filter((item) => item.status === "rejected").length
    }
  };
}

export async function createMediaConnection(input: { athleteId?: string; athleteName?: string; platform: MediaPlatform; handle: string; profileUrl?: string }) {
  const entry: MediaConnection = {
    id: `media-connection-${randomUUID()}`,
    athleteId: input.athleteId || "athlete-current",
    athleteName: input.athleteName || "Current Athlete",
    platform: input.platform,
    handle: input.handle,
    profileUrl: input.profileUrl,
    status: "connected",
    permissionScope: ["profile", "public_media", "myd1_review"],
    createdAt: now(),
    updatedAt: now()
  };
  await appendUserState(MEDIA_CONNECTIONS_FILE, entry, 1000);
  return entry;
}

export async function recordMediaImport(input: { connectionId?: string; athleteId?: string; athleteName?: string; platform: MediaPlatform; sourceUrl: string; title: string; caption?: string; mediaType?: "video" | "image" | "post" }) {
  const entry: MediaImport = {
    id: `media-import-${randomUUID()}`,
    connectionId: input.connectionId,
    athleteId: input.athleteId || "athlete-current",
    athleteName: input.athleteName || "Current Athlete",
    platform: input.platform,
    sourceUrl: input.sourceUrl,
    title: input.title,
    caption: input.caption,
    mediaType: input.mediaType || "video",
    status: "review",
    createdAt: now(),
    importedAt: now()
  };
  const reviewItem: MediaReviewItem = {
    id: `media-review-${randomUUID()}`,
    importId: entry.id,
    athleteId: entry.athleteId,
    athleteName: entry.athleteName,
    platform: entry.platform,
    title: entry.title,
    sourceUrl: entry.sourceUrl,
    status: "pending",
    createdAt: now()
  };
  await appendUserState(MEDIA_IMPORTS_FILE, entry, 2000);
  await appendUserState(MEDIA_REVIEW_QUEUE_FILE, reviewItem, 2000);
  return { entry, reviewItem };
}

export async function updateMediaReviewStatus(input: { reviewId: string; status: "approved" | "rejected"; notes?: string }) {
  const existing = getMediaReviewQueue().find((item) => item.id === input.reviewId);
  if (!existing) return null;
  const updated: MediaReviewItem = { ...existing, status: input.status, notes: input.notes, reviewedAt: now() };
  await appendUserState(MEDIA_REVIEW_QUEUE_FILE, updated, 2000);
  return updated;
}

export async function recordMediaSyncRun(input: { connectionId?: string; athleteId?: string; athleteName?: string; platform?: MediaPlatform }) {
  return recordMediaImport({
    connectionId: input.connectionId,
    athleteId: input.athleteId,
    athleteName: input.athleteName,
    platform: input.platform || "instagram",
    sourceUrl: "manual-sync://connected-media-phase-one",
    title: "Connected media sync queued",
    caption: "Phase One sync placeholder recorded for operations review.",
    mediaType: "post"
  });
}
