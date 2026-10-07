"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { redirect } from "next/navigation";

const execFileAsync = promisify(execFile);

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function runSmartPull(formData: FormData) {
  const state = value(formData, "smartPullState");
  const sportRaw = value(formData, "smartPullSport");
  const sport = sportRaw && sportRaw !== "All Sports" ? sportRaw.toLowerCase() : "";
  const args = [resolve(process.cwd(), "..", "scripts", "import-source-registry.mjs")];
  if (state) args.push("--state", state);
  if (sport) args.push("--sport", sport);

  let destination = "/operations?tab=schools&status=smart-pull-failed";
  try {
    const { stdout } = await execFileAsync(process.execPath, args, {
      cwd: resolve(process.cwd(), ".."),
      timeout: 120_000,
      maxBuffer: 1024 * 1024 * 4
    });

    const sources = stdout.match(/Registry import complete:\s*(\d+) source\(s\)/i)?.[1] ?? "0";
    const found = stdout.match(/Records imported:\s*(\d+)/i)?.[1] ?? "0";
    const review = stdout.match(/Records requiring review:\s*(\d+)/i)?.[1] ?? "0";
    const noMatch = /No enabled public sources matched/i.test(stdout);
    const params = new URLSearchParams({
      tab: "schools",
      status: noMatch ? "smart-pull-no-sources" : "smart-pull-complete",
      sources,
      found,
      review
    });
    destination = `/operations?${params.toString()}`;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 180) : "Smart Pull failed";
    const params = new URLSearchParams({ tab: "schools", status: "smart-pull-failed", detail: message });
    destination = `/operations?${params.toString()}`;
  }
  redirect(destination);
}
