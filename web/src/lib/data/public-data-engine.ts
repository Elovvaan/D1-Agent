import { getPublicDirectoryCounters, searchPublicDirectory, type PublicDirectoryResult } from "./services";
import { getOperationsIntakeDirectoryResults, searchOperationsIntakeDirectory } from "./public-intake-search";
import { getNavigationGraph, type NavigationStateNode } from "./organization-graph";

export type { PublicDirectoryResult };

export type PublicStateNode = NavigationStateNode;

const groupOrder: PublicDirectoryResult["group"][] = ["States", "Athletes", "Schools", "Teams", "Rankings", "Games", "Coaches", "Sources", "Organizations"];

function mergeGroups(groups: Array<{ group: PublicDirectoryResult["group"]; results: PublicDirectoryResult[] }>) {
  const buckets = new Map<PublicDirectoryResult["group"], PublicDirectoryResult[]>();
  const seen = new Set<string>();
  for (const group of groups) {
    for (const result of group.results) {
      const key = `${result.group}-${result.id}-${result.href}-${result.sourceUrl ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      buckets.set(result.group, [...(buckets.get(result.group) ?? []), result]);
    }
  }
  return groupOrder.map((group) => ({ group, results: buckets.get(group) ?? [] })).filter((group) => group.results.length > 0);
}

export function searchPublicData(query: string) {
  return mergeGroups([...searchPublicDirectory(query), ...searchOperationsIntakeDirectory(query)]);
}

export function getPublicDataCounters() {
  const base = getPublicDirectoryCounters();
  const intake = getOperationsIntakeDirectoryResults();
  const count = (group: PublicDirectoryResult["group"]) => intake.filter((result) => result.group === group).length;
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

export function getPublicSchoolHierarchy() {
  return getNavigationGraph();
}
