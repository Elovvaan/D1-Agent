import { getPublicDirectoryCounters, searchPublicDirectory, type PublicDirectoryResult } from "./services";

export type { PublicDirectoryResult };

export function searchPublicData(query: string) {
  return searchPublicDirectory(query);
}

export function getPublicDataCounters() {
  return getPublicDirectoryCounters();
}

export function getPublicSchoolResults(limit = 12) {
  return searchPublicData("school").find((group) => group.group === "Schools")?.results.slice(0, limit) ?? [];
}
