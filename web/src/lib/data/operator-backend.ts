import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { ContentPublicationRecord, MediaReviewQueueItem, OperatorFieldNote, OperatorMediaUpload, OperatorStatReport } from "@d1/shared";

const operatorDir = resolve(process.cwd(), "..", "data", "operator");

function readJsonFiles<T>(prefix: string) {
  if (!existsSync(operatorDir)) return [];
  return readdirSync(operatorDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(resolve(operatorDir, file), "utf8")) as T)
    .sort((a, b) => Date.parse(String((b as { submittedAt?: string }).submittedAt ?? "")) - Date.parse(String((a as { submittedAt?: string }).submittedAt ?? "")));
}

export function getOperatorBackendState() {
  const media = readJsonFiles<OperatorMediaUpload>("media-");
  const notes = readJsonFiles<OperatorFieldNote>("note-");
  const stats = readJsonFiles<OperatorStatReport>("stat-");
  const reviewQueue = readJsonFiles<MediaReviewQueueItem>("review-");
  const publications = readJsonFiles<ContentPublicationRecord>("publication-");

  return {
    media,
    notes,
    stats,
    reviewQueue,
    publications,
    pendingReviewCount: reviewQueue.filter((item) => item.reviewStatus === "pending_review").length
  };
}
