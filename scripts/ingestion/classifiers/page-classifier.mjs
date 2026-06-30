const sports = new Set([
  "basketball",
  "football",
  "baseball",
  "softball",
  "soccer",
  "volleyball",
  "hockey",
  "lacrosse",
  "wrestling",
  "tennis",
  "golf",
  "swimming",
  "cross-country",
  "track-and-field",
  "field-hockey",
  "water-polo"
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanText(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readTargeting(html) {
  const candidates = [];
  for (const match of html.matchAll(/<meta\b[^>]*content=["']([^"']*pagetype[^"']*)["'][^>]*>/gi)) {
    candidates.push(match[1].replace(/&quot;/g, "\""));
  }
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Metadata may not be JSON on non-adapter sources.
    }
  }
  return null;
}

function titleFromHtml(html) {
  return cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
}

function sportFromUrl(url) {
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    return segments.find((segment) => sports.has(segment));
  } catch {
    return undefined;
  }
}

function sportFromTitle(title) {
  const lowered = title.toLowerCase();
  for (const sport of sports) {
    if (lowered.includes(sport.replaceAll("-", " "))) return sport;
  }
  return undefined;
}

function resolveGender(targeting, url, title) {
  const metaGender = String(targeting?.gnd ?? "").toLowerCase();
  if (["boys", "girls", "coed"].includes(metaGender)) return { value: metaGender, source: "meta:gnd", fromMetadata: true };
  if (/\/girls\//i.test(url)) return { value: "girls", source: "url:gender", fromMetadata: false };
  if (/\/boys\//i.test(url)) return { value: "boys", source: "url:gender", fromMetadata: false };
  if (/\bgirls\b/i.test(title)) return { value: "girls", source: "title:gender", fromMetadata: false };
  if (/\bboys\b/i.test(title)) return { value: "boys", source: "title:gender", fromMetadata: false };
  return { value: "unknown", source: "", fromMetadata: false };
}

function seasonFromTitle(title) {
  const match = title.match(/\((\d{4})-(\d{2})\)/);
  return match ? `${match[1]}-${match[2]}` : undefined;
}

function selectedSeasonFromHtml(html) {
  return html.match(/<option\b[^>]*selected[^>]*>\s*(\d{4}-\d{2})\s*<\/option>/i)?.[1];
}

function hasRankingTable(html) {
  return /<table[\s\S]*?(#|rank)[\s\S]*?team[\s\S]*?(ovr|overall|record|w-?l)[\s\S]*?<\/table>/i.test(html);
}

function hasStateDirectory(html) {
  const stateMatches = html.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Florida|Georgia|Virginia|Texas|New York|Ohio)\b/g) ?? [];
  return stateMatches.length >= 5;
}

export function classifySourcePage({ url, html }) {
  const signals = [];
  const targeting = readTargeting(html);
  const title = titleFromHtml(html);

  let sport = targeting?.activity ? String(targeting.activity).toLowerCase() : undefined;
  if (sport) signals.push("meta:activity");
  if (!sport) {
    sport = sportFromUrl(url);
    if (sport) signals.push("url:sport");
  }
  if (!sport) {
    sport = sportFromTitle(title);
    if (sport) signals.push("title:sport");
  }

  const gender = resolveGender(targeting, url, title);
  if (gender.source) signals.push(gender.source);

  let season = seasonFromTitle(title);
  if (season) signals.push("title:season");
  if (!season) {
    season = selectedSeasonFromHtml(html);
    if (season) signals.push("dom:season");
  }

  const pageType = targeting?.pagetype ? String(targeting.pagetype) : undefined;
  if (pageType) signals.push("meta:pagetype");

  const rankTable = hasRankingTable(html);
  const looksRanking = pageType === "rankings_list" || /rankings?/i.test(title) || /\/rankings?\//i.test(url);
  const state = targeting?.state ? String(targeting.state) : new URL(url).searchParams.get("state") || "all";
  const isNational = /national/i.test(title) || state === "all" || state == null;
  const isRankingList = looksRanking || rankTable;
  const primary = isRankingList ? (isNational ? "NATIONAL_RANKING_PAGE" : "STATE_RANKING_PAGE") : hasStateDirectory(html) ? "STATE_DIRECTORY_PAGE" : "UNKNOWN";

  let confidence = 0.4;
  if (pageType) confidence += 0.3;
  if (targeting?.activity) confidence += 0.1;
  if (gender.fromMetadata) confidence += 0.1;
  if (season) confidence += 0.1;
  if (looksRanking && rankTable) confidence += 0.05;
  if (pageType === "rankings_list" && !rankTable) {
    confidence -= 0.15;
    signals.push("warn:meta_dom_mismatch");
  }

  return {
    primary,
    facets: {
      sport,
      gender: gender.value,
      season,
      scope: isNational ? "national" : "state",
      state
    },
    isRankingList,
    isDirectory: hasStateDirectory(html),
    confidence: clamp(confidence, 0, 1),
    signals
  };
}
