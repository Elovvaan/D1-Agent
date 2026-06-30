export const organizationTypes = [
  "COUNTRY",
  "STATE_ASSOCIATION",
  "DISTRICT",
  "CONFERENCE",
  "LEAGUE",
  "SCHOOL",
  "AGGREGATOR",
  "TOURNAMENT_BODY",
  "PUBLISHER"
];

export function publisherOrgFromSource(source, fallbackUrl) {
  const url = source?.source_url ?? fallbackUrl;
  const host = new URL(url).hostname.replace(/^www\./, "");
  const sourceType = source?.source_type ?? "";
  const isAggregator = /aggregator|rankings|external_public_sports_platform/.test(sourceType) || /maxpreps\.com$/i.test(host);
  const isAssociation = /association/.test(sourceType);
  return {
    org_type: isAggregator ? "AGGREGATOR" : isAssociation ? "STATE_ASSOCIATION" : "PUBLISHER",
    name: source?.source_name ?? host,
    short_name: source?.source_name,
    state: source?.state ?? null,
    source_url: url,
    review_status: "pending"
  };
}

export function parseMaxPrepsTeamUrl(href) {
  try {
    const parts = new URL(href).pathname.split("/").filter(Boolean);
    if (parts.length >= 4 && /^[a-z]{2}$/i.test(parts[0])) {
      return {
        state: parts[0].toUpperCase(),
        city: parts[1],
        school_slug: parts[2],
        sport: parts[3]
      };
    }
  } catch {
    return null;
  }
  return null;
}
