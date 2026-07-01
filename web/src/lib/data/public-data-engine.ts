import {
  getPublicDirectoryCounters as getBasePublicDirectoryCounters,
  getPublicDirectoryDiscoverySections as getBasePublicDirectoryDiscoverySections,
  searchPublicDirectory as searchBasePublicDirectory,
  type PublicDirectoryCounters,
  type PublicDirectoryGroupName,
  type PublicDirectoryResult,
  type PublicDirectorySection
} from "./services";
import { searchOperationsIntakeDirectory } from "./public-intake-search";

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

export function searchPublicData(query: string) {
  return mergeDirectoryGroups([...searchBasePublicDirectory(query), ...searchOperationsIntakeDirectory(query)]);
}

export function getPublicDataCounters(): PublicDirectoryCounters {
  return getBasePublicDirectoryCounters();
}

export function getPublicSchoolResults(limit = 12) {
  return searchPublicData("school").find((group) => group.group === "Schools")?.results.slice(0, limit) ?? [];
}

export function getPublicDiscoverySections(): PublicDirectorySection[] {
  return getBasePublicDirectoryDiscoverySections();
}
