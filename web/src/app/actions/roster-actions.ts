"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const execFileAsync = promisify(execFile);

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function runRosterBackfillAction(formData: FormData) {
  const rosterUrl = value(formData, "rosterUrl");
  try {
    new URL(rosterUrl);
  } catch {
    redirect("/admin/rosters?status=invalid-url");
  }

  try {
    await execFileAsync(process.execPath, ["scripts/import-public-deep.mjs", "--url", rosterUrl], {
      cwd: process.cwd().replace(/\\web$/, ""),
      timeout: 90_000,
      windowsHide: true
    });
  } catch {
    redirect("/admin/rosters?status=backfill-failed");
  }

  revalidatePath("/admin/rosters");
  revalidatePath("/search");
  redirect("/admin/rosters?status=backfill-complete");
}
