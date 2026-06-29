import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { DiscoveredLink, DiscoveredSource, SchoolDiscoveryType, SchoolImportSession } from "@d1/shared";

const schoolImportsDir = resolve(process.cwd(), "..", "data", "school-imports");

export type SchoolImportWizardState = {
  sources: DiscoveredSource[];
  links: DiscoveredLink[];
  sessions: SchoolImportSession[];
};

function readJsonFiles<T>(prefix: string) {
  if (!existsSync(schoolImportsDir)) return [];
  return readdirSync(schoolImportsDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(resolve(schoolImportsDir, file), "utf8")) as T)
    .sort((a, b) => Date.parse(String((b as { fetchedAt?: string; submittedAt?: string }).fetchedAt ?? (b as { submittedAt?: string }).submittedAt ?? "")) - Date.parse(String((a as { fetchedAt?: string; submittedAt?: string }).fetchedAt ?? (a as { submittedAt?: string }).submittedAt ?? "")));
}

export function getSchoolImportWizardState(): SchoolImportWizardState {
  return {
    sources: readJsonFiles<DiscoveredSource>("source-"),
    links: readJsonFiles<DiscoveredLink>("link-"),
    sessions: readJsonFiles<SchoolImportSession>("session-")
  };
}

export function getLatestSchoolImportSession() {
  return getSchoolImportWizardState().sessions[0] ?? null;
}

export function discoveryTypeLabel(type: SchoolDiscoveryType) {
  const labels: Record<SchoolDiscoveryType, string> = {
    school: "School",
    team: "Team",
    roster: "Roster",
    schedule: "Schedule",
    stats: "Stats",
    coaches: "Coaches",
    events: "Events",
    camps: "Camps",
    livestream: "Livestream",
    unknown: "Unknown"
  };
  return labels[type];
}

export const schoolDiscoveryTypes: SchoolDiscoveryType[] = ["school", "team", "roster", "schedule", "stats", "coaches", "events", "camps", "livestream", "unknown"];
