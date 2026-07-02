"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function writeAction(kind: string, payload: Record<string, string>) {
  const now = new Date().toISOString();
  const id = `${kind}-${randomUUID()}`;
  const dir = resolve(process.cwd(), "..", "data", "public-actions");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${id}.json`), `${JSON.stringify({ id, kind, occurredAt: now, ...payload }, null, 2)}\n`, "utf8");
  return id;
}

export async function recordPublicReviewAction(formData: FormData) {
  await writeAction("public-review", {
    action: value(formData, "action"),
    entityId: value(formData, "entityId"),
    entityType: value(formData, "entityType"),
    sourceUrl: value(formData, "sourceUrl")
  });
  revalidatePath("/operations");
  revalidatePath("/admin/public-data");
  redirect("/operations?status=review-recorded&tab=reviews");
}

export async function recordAthleteClaimRequest(formData: FormData) {
  await writeAction("athlete-claim", {
    importedPlayerId: value(formData, "importedPlayerId"),
    playerName: value(formData, "playerName"),
    sourceUrl: value(formData, "sourceUrl")
  });
  revalidatePath("/profile/public-claim");
}

export async function recordCoachVerificationAction(formData: FormData) {
  await writeAction("coach-imported-verification", {
    action: value(formData, "action"),
    importedPlayerId: value(formData, "importedPlayerId"),
    playerName: value(formData, "playerName"),
    sourceUrl: value(formData, "sourceUrl")
  });
  revalidatePath("/coach/imported-verification");
}
