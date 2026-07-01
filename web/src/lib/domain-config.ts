export const brandConfig = {
  primaryBrand: "MyD1",
  agentProductName: "D1 Agent",
  primaryDomain: "myd1sports.pro",
  appDomain: "myd1sports.pro"
} as const;

export const portalDomains = {
  marketing: "myd1sports.pro",
  app: "myd1sports.pro",
  coach: "coach.myd1sports.pro",
  recruiter: "recruiter.myd1sports.pro",
  team: "team.myd1sports.pro",
  media: "media.myd1sports.pro",
  admin: "admin.myd1sports.pro",
  api: "api.myd1sports.pro",
  appShort: "myd1.app"
} as const;

export const portalRoutingNotes = {
  "coach.myd1sports.pro": "Coach portal",
  "recruiter.myd1sports.pro": "Recruiter portal",
  "team.myd1sports.pro": "Team portal",
  "media.myd1sports.pro": "Media/film",
  "admin.myd1sports.pro": "Admin",
  "api.myd1sports.pro": "API"
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
