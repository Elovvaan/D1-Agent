export const brandConfig = {
  primaryBrand: "MyD1",
  agentProductName: "D1 Agent",
  primaryDomain: "myd1.sports",
  appDomain: "myd1.app"
} as const;

export const portalDomains = {
  marketing: "myd1.sports",
  app: "app.myd1.sports",
  coach: "coach.myd1.sports",
  recruiter: "recruiter.myd1.sports",
  team: "team.myd1.sports",
  media: "media.myd1.sports",
  admin: "admin.myd1.sports",
  api: "api.myd1.sports",
  appShort: "myd1.app"
} as const;

export const portalRoutingNotes = {
  "coach.myd1.sports": "Coach portal",
  "recruiter.myd1.sports": "Recruiter portal",
  "team.myd1.sports": "Team portal",
  "media.myd1.sports": "Media/film",
  "admin.myd1.sports": "Admin",
  "api.myd1.sports": "API"
} as const;

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function configuredUrl(value: string | undefined, fallback: string) {
  return withoutTrailingSlash(value?.trim() || fallback);
}

export function getMarketingBaseUrl() {
  return configuredUrl(process.env.NEXT_PUBLIC_MARKETING_URL, `https://${portalDomains.marketing}`);
}

export function getAppBaseUrl() {
  return configuredUrl(process.env.NEXT_PUBLIC_APP_URL, `https://${portalDomains.app}`);
}

export function getPublicProfileBaseUrl() {
  return configuredUrl(process.env.NEXT_PUBLIC_PUBLIC_PROFILE_BASE_URL, getMarketingBaseUrl());
}

export function absoluteUrl(path: string, baseUrl = getAppBaseUrl()) {
  return new URL(path, `${baseUrl}/`).toString();
}

export function publicProfileUrl(path: string) {
  return absoluteUrl(path, getPublicProfileBaseUrl());
}

export function portalUrl(portal: keyof typeof portalDomains, path = "/") {
  return absoluteUrl(path, `https://${portalDomains[portal]}`);
}

export function getSafePortalRedirect(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === portalDomains.coach) return "/coach";
  if (host === portalDomains.recruiter) return "/recruiter";
  if (host === portalDomains.media) return "/media";
  if (host === portalDomains.admin) return "/admin";
  return null;
}
