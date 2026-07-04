import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

export type PageProfile = {
  pageKey: string;
  stateCode?: string;
  headline?: string;
  subheadline?: string;
  body?: string;
  coverImageUrl?: string;
  badgeImageUrl?: string;
  featureVideoUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  updatedAt?: string;
};

function cleanPageProfile(profile: PageProfile | undefined) {
  if (!profile) return undefined;
  const headline = profile.headline?.trim();
  if (profile.pageKey === "locked-in" && headline?.toLowerCase() === "alabama") {
    return { ...profile, headline: "Locked In" };
  }
  return profile;
}

export function getPageProfile(pageKey: string, stateCode?: string) {
  const stored = readJsonSync<{ items?: PageProfile[] }>(userStatePath("page-profiles.json"), { items: [] }).items ?? [];
  const latestFirst = [...stored].reverse();
  const normalizedState = (stateCode ?? "").toUpperCase();
  const profile = latestFirst.find((item) => item.pageKey === pageKey && (item.stateCode ?? "").toUpperCase() === normalizedState) ?? latestFirst.find((item) => item.pageKey === pageKey && !item.stateCode);
  return cleanPageProfile(profile);
}
