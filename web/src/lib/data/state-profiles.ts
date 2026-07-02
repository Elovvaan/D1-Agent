import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

export type StateProfile = {
  stateCode: string;
  displayName?: string;
  tagline?: string;
  bio?: string;
  coverImageUrl?: string;
  badgeImageUrl?: string;
  featureVideoUrl?: string;
  primarySport?: string;
  updatedAt?: string;
};

export function getStateProfiles() {
  const stored = readJsonSync<{ items?: StateProfile[] }>(userStatePath("state-profiles.json"), { items: [] }).items ?? [];
  const latest = new Map<string, StateProfile>();
  for (const profile of stored) {
    if (!profile.stateCode) continue;
    latest.set(profile.stateCode.toUpperCase(), { ...profile, stateCode: profile.stateCode.toUpperCase() });
  }
  return latest;
}

export function getStateProfile(stateCode: string) {
  return getStateProfiles().get(stateCode.toUpperCase());
}
