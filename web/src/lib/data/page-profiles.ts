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

export function getPageProfile(pageKey: string, stateCode?: string) {
  const stored = readJsonSync<{ items?: PageProfile[] }>(userStatePath("page-profiles.json"), { items: [] }).items ?? [];
  const normalizedState = (stateCode ?? "").toUpperCase();
  return stored.find((item) => item.pageKey === pageKey && (item.stateCode ?? "").toUpperCase() === normalizedState) ?? stored.find((item) => item.pageKey === pageKey && !item.stateCode);
}
