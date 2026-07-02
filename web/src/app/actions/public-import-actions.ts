"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writePublicAction } from "@/lib/data/platform-storage";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function writeAction(kind: string, payload: Record<string, string>) {
  const now = new Date().toISOString();
  const id = `${kind}-${randomUUID()}`;
  await writePublicAction(id, { id, kind, occurredAt: now, ...payload });
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
