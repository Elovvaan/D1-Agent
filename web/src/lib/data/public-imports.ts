import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
  CoachImportedVerificationRequest,
  PublicImportedEntity,
  PublicImportedField,
  PublicImportResult,
  PublicReviewQueueItem
} from "@d1/shared";

const importsDir = resolve(process.cwd(), "..", "data", "imports");
const publicActionsDir = resolve(process.cwd(), "..", "data", "public-actions");

export interface ImportHistoryItem {
  runId: string;
  sourceUrl: string;
  sourceTitle?: string;
  fetchedAt: string;
  recordsImported: number;
  reviewCount: number;
}

export type ReviewActionKind = "approve" | "correct" | "reject" | "merge";

export interface ReviewAction {
  id: string;
  kind: ReviewActionKind;
  label: string;
  description: string;
}

export interface ImportedPlayerSummary {
  id: string;
  name: string;
  jerseyNumber?: string;
  position?: string;
  classYear?: string;
  height?: string;
  weight?: string;
  hometown?: string;
  profileUrl?: string;
  sourceUrl: string;
  fields: PublicImportedField[];
}

type StoredPublicReviewAction = {
  id?: string;
  kind?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  sourceUrl?: string;
  occurredAt?: string;
};

function isStoredPublicReviewAction(action: StoredPublicReviewAction | null): action is StoredPublicReviewAction {
  return action !== null && action.kind === "public-review" && Boolean(action.entityId);
}

async function getStoredReviewActions() {
  let files: string[] = [];
  try {
    files = await readdir(publicActionsDir);
  } catch {
    return [] as StoredPublicReviewAction[];
  }
  const actions = await Promise.all(
    files.filter((file) => file.endsWith(".json")).map(async (file) => {
      try {
        return JSON.parse(await readFile(join(publicActionsDir, file), "utf8")) as StoredPublicReviewAction;
      } catch {
        return null;
      }
    })
  );
  return actions.filter(isStoredPublicReviewAction);
}

export async function getPublicImportRuns(): Promise<PublicImportResult[]> {
  let files: string[] = [];
  try {
    files = await readdir(importsDir);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((file) => file.endsWith(".json")).sort();
  const runs = await Promise.all(
    jsonFiles.map(async (file) => {
      const raw = await readFile(join(importsDir, file), "utf8");
      return JSON.parse(raw) as PublicImportResult;
    })
  );

  return runs.sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt));
}

export async function getLatestPublicImportRun() {
  const [latest] = await getPublicImportRuns();
  return latest;
}

export async function getImportHistory(): Promise<ImportHistoryItem[]> {
  const runs = await getPublicImportRuns();
  return runs.map((run) => ({
    runId: run.runId,
    sourceUrl: run.sourceUrl,
    sourceTitle: run.sourceTitle,
    fetchedAt: run.fetchedAt,
    recordsImported: run.entities.length,
    reviewCount: run.reviewQueue.length
  }));
}

export async function getPublicDataReviewQueue() {
  const run = await getLatestPublicImportRun();
  if (!run) return { run: null, items: [] as Array<PublicReviewQueueItem & { entity?: PublicImportedEntity }> };

  const actions = await getStoredReviewActions();
  const reviewedEntityIds = new Set(actions.map((action) => action.entityId).filter(Boolean));
  const reviewedQueueIds = new Set(actions.map((action) => action.id?.replace(/^public-review-/, "")).filter(Boolean));

  const items = run.reviewQueue
    .filter((item) => !reviewedEntityIds.has(item.importedEntityId) && !reviewedQueueIds.has(item.id))
    .map((item) => ({
      ...item,
      entity: run.entities.find((entity) => entity.id === item.importedEntityId)
    }));

  return { run, items };
}

export async function getImportedPlayers() {
  const run = await getLatestPublicImportRun();
  if (!run) return [] as ImportedPlayerSummary[];

  return run.entities
    .filter((entity) => entity.type === "player")
    .map((entity) => ({
      id: entity.id,
      name: getField(entity, "name") ?? "Unknown player",
      jerseyNumber: getField(entity, "jerseyNumber"),
      position: getField(entity, "position"),
      classYear: getField(entity, "classYear"),
      height: getField(entity, "height"),
      weight: getField(entity, "weight"),
      hometown: getField(entity, "hometown"),
      profileUrl: getField(entity, "profileUrl"),
      sourceUrl: entity.sourceUrl,
      fields: entity.fields
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCoachImportedVerificationQueue() {
  const run = await getLatestPublicImportRun();
  if (!run) {
    return [] as Array<CoachImportedVerificationRequest & { player?: ImportedPlayerSummary }>;
  }

  const players = await getImportedPlayers();
  return run.coachVerificationRequests.map((request) => ({
    ...request,
    player: players.find((player) => player.id === request.importedPlayerId)
  }));
}

export function getReviewActions(entityType: string): ReviewAction[] {
  return [
    {
      id: `approve-${entityType}`,
      kind: "approve",
      label: "Approve",
      description: "Accept imported fields as reviewed and ready for trust-safe use."
    },
    {
      id: `correct-${entityType}`,
      kind: "correct",
      label: "Correct",
      description: "Keep the source record, but apply a reviewed correction before merge."
    },
    {
      id: `reject-${entityType}`,
      kind: "reject",
      label: "Reject",
      description: "Exclude this imported record from matching, claims, and trust calculations."
    },
    {
      id: `merge-${entityType}`,
      kind: "merge",
      label: "Merge",
      description: "Attach this imported public record to an existing D1 entity."
    }
  ];
}

export function getField(entity: PublicImportedEntity, name: string) {
  return entity.fields.find((field) => field.name === name)?.value;
}

export function formatImportDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
