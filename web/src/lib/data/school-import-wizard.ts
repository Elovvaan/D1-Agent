import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { DiscoveredLink, DiscoveredSource, SchoolDiscoveryType, SchoolImportSession } from "@d1/shared";

const schoolImportsDir = resolve(process.cwd(), "..", "data", "school-imports");
const publicSourceRegistryPath = resolve(process.cwd(), "..", "data", "sources", "public-sources.json");

export type PublicSourceRegistryEntry = {
  source_name: string;
  source_url: string;
  state: string;
  country: string;
  source_level: string;
  source_type: string;
  sports_supported: string[];
  notes?: string;
  enabled: boolean;
};

export type PublicSourceRegistryFilters = {
  state?: string;
  sport?: string;
  sourceType?: string;
};

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

export function getPublicSourceRegistry(filters: PublicSourceRegistryFilters = {}) {
  if (!existsSync(publicSourceRegistryPath)) return [];
  const sources = JSON.parse(readFileSync(publicSourceRegistryPath, "utf8")) as PublicSourceRegistryEntry[];
  return sources.filter((source) => {
    if (!source.enabled) return false;
    if (filters.state && source.state.toLowerCase() !== filters.state.toLowerCase()) return false;
    if (filters.sourceType && source.source_type.toLowerCase() !== filters.sourceType.toLowerCase()) return false;
    if (filters.sport) {
      const sports = source.sports_supported.map((sport) => sport.toLowerCase());
      if (sports.length > 0 && !sports.includes(filters.sport.toLowerCase())) return false;
    }
    return true;
  });
}

export function getPublicSourceRegistryOptions() {
  if (!existsSync(publicSourceRegistryPath)) {
    return { states: [], sports: [], sourceTypes: [] };
  }
  const sources = JSON.parse(readFileSync(publicSourceRegistryPath, "utf8")) as PublicSourceRegistryEntry[];
  return {
    states: [...new Set(sources.map((source) => source.state).filter(Boolean))].sort(),
    sports: [...new Set(sources.flatMap((source) => source.sports_supported).filter(Boolean))].sort(),
    sourceTypes: [...new Set(sources.map((source) => source.source_type).filter(Boolean))].sort()
  };
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
