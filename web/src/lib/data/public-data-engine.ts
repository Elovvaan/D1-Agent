import {
  getPublicDirectoryCounters as getBasePublicDirectoryCounters,
  getPublicDirectoryDiscoverySections as getBasePublicDirectoryDiscoverySections,
  searchPublicDirectory as searchBasePublicDirectory,
  type PublicDirectoryCounters,
  type PublicDirectoryGroupName,
  type PublicDirectoryResult,
  type PublicDirectorySection
} from "./services";
import { getOperationsIntakeDirectoryResults, searchOperationsIntakeDirectory } from "./public-intake-search";

export type { PublicDirectoryCounters, PublicDirectoryGroupName, PublicDirectoryResult, PublicDirectorySection };

const groupOrder: PublicDirectoryGroupName[] = ["Athletes", "Schools", "Teams", "Rankings", "Games", "Coaches", "Sources", "Organizations"];

export const publicDataEngineSource = {
  name: "MYD1 Public Data Engine",
  operationsWritePath: "data/user-state/operator-data-intake.json",
  publicReadModule: "web/src/lib/data/public-data-engine.ts",
  rule: "Operations writes data here. Public pages read through this engine."
} as const;

function mergeDirectoryGroups(groups: Array<{ group: PublicDirectoryGroupName; results: PublicDirectoryResult[] }>) {
  const buckets = new Map<PublicDirectoryGroupName, PublicDirectoryResult[]>();
  const seen = new Set<string>();
  for (const group of groups) {
    for (const result of group.results) {
      const key = `${result.group}:${result.id}:${result.sourceUrl ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      buckets.set(result.group, [...(buckets.get(result.group) ?? []), result]);
    }
  }
  return groupOrder.map((group) => ({ group, results: buckets.get(group) ?? [] })).filter((group) => group.results.length > 0);
}

function groupRawResults(results: PublicDirectoryResult[]) {
  const buckets = new Map<PublicDirectoryGroupName, PublicDirectoryResult[]>();
  for (const result of results) buckets.set(result.group, [...(buckets.get(result.group) ?? []), result]);
  return groupOrder.map((group) => ({ group, results: buckets.get(group) ?? [] })).filter((group) => group.results.length > 0);
}

export function searchPublicData(query: string) {
  return mergeDirectoryGroups([...searchBasePublicDirectory(query), ...searchOperationsIntakeDirectory(query)]);
}

export function getPublicDataCounters(): PublicDirectoryCounters {
  const base = getBasePublicDirectoryCounters();
  const intake = getOperationsIntakeDirectoryResults();
  const count = (group: PublicDirectoryGroupName) => intake.filter((result) => result.group === group).length;
  return {
    schools: base.schools + count("Schools"),
    teams: base.teams + count("Teams"),
    athletes: base.athletes + count("Athletes"),
    coaches: base.coaches + count("Coaches"),
    games: base.games + count("Games"),
    sources: base.sources + count("Sources"),
    recordsImported: base.recordsImported + intake.length,
    pendingReview: base.pendingReview + intake.length
  };
}

export function getPublicSchoolResults(limit = 12) {
  return searchPublicData("school").find((group) => group.group === "Schools")?.results.slice(0, limit) ?? [];
}

export function getPublicDiscoverySections(): PublicDirectorySection[] {
  const baseSections = getBasePublicDirectoryDiscoverySections();
  const intakeResults = getOperationsIntakeDirectoryResults();
  const intakeSection = { title: "Operations intake", caption: "Newest records entered from the Operations Center.", results: intakeResults.slice(0, 8) };
  const groupedIntake = groupRawResults(intakeResults);
  return [intakeSection, ...baseSections, ...groupedIntake.map((group) => ({ title: `${group.group} from Operations`, caption: "Records entered through the one public data engine.", results: group.results.slice(0, 8) }))];
}

export function getPublicSportsCatalog() {
  return {
    boys: ["Football", "Basketball", "Baseball", "Soccer", "Track & Field", "Wrestling", "Volleyball", "Tennis", "Golf", "Lacrosse", "Swimming", "Cross Country"],
    girls: ["Basketball", "Volleyball", "Softball", "Soccer", "Track & Field", "Tennis", "Golf", "Swimming", "Cross Country", "Wrestling", "Lacrosse", "Cheer"],
    coed: ["Archery", "Band", "Bass Fishing", "Bowling", "Dance Team", "Esports", "Flag Football", "Speech", "Unified Sports"]
  };
}
