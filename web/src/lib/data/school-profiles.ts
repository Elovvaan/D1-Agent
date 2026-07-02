import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

export type SchoolProfile = {
  schoolId: string;
  logoImageUrl?: string;
  coverImageUrl?: string;
  updatedAt?: string;
};

export function getSchoolProfiles() {
  const stored = readJsonSync<{ items?: SchoolProfile[] }>(userStatePath("school-profiles.json"), { items: [] }).items ?? [];
  const latest = new Map<string, SchoolProfile>();
  for (const profile of stored) {
    if (!profile.schoolId) continue;
    if (latest.has(profile.schoolId)) continue;
    latest.set(profile.schoolId, profile);
  }
  return latest;
}

export function getSchoolProfile(schoolId: string) {
  return getSchoolProfiles().get(schoolId);
}
