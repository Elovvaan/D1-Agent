import { parseRosterPage, readMetaFacets } from "./parse.mjs";

function facetGender(facets) {
  const gender = String(facets.gnd ?? facets.gender ?? "").toLowerCase();
  if (/girl|female|women/.test(gender)) return "girls";
  if (/boy|male|men/.test(gender)) return "boys";
  if (/coed/.test(gender)) return "coed";
  return "unknown";
}

function facetSport(facets) {
  const sport = facets.activity ?? facets.sport;
  return sport ? String(sport).toLowerCase() : undefined;
}

function facetSeason(facets, url) {
  const source = facets.season ?? facets.seasonYear;
  if (source) {
    const match = String(source).match(/(\d{4})-?(\d{2,4})?/);
    if (match) return match[2] ? `${match[1]}-${String(match[2]).slice(-2)}` : `${Number(match[1]) - 1}-${String(match[1]).slice(2)}`;
  }
  const urlMatch = String(url).match(/\/(\d{2})-(\d{2})\/|\/(\d{4})-(\d{2})\//);
  if (urlMatch?.[1]) return `20${urlMatch[1]}-${urlMatch[2]}`;
  if (urlMatch?.[3]) return `${urlMatch[3]}-${urlMatch[4]}`;
  return undefined;
}

export const maxprepsRosterAdapter = {
  id: "adapter_maxpreps_roster",
  matches(url, host) {
    return /maxpreps\.com$/i.test(host) && /\/roster\/?($|\?)/i.test(url);
  },
  seasonTemplate(url) {
    if (/\/\d{2}-\d{2}\//.test(url)) return url.replace(/\/\d{2}-\d{2}\//, "/{maxPrepsSeason}/");
    if (/\/\d{4}-\d{2}\//.test(url)) return url.replace(/\/\d{4}-\d{2}\//, "/{season}/");
    if (/\/roster\/?($|\?)/i.test(url) && /maxpreps\.com/i.test(url)) return url;
    return null;
  },
  parse(html, url) {
    const facets = readMetaFacets(html);
    const h1 = String(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const level = /college|ncaa|naia/i.test(String(facets.level ?? "")) ? "college" : "hs";
    return parseRosterPage({
      html,
      hints: { level, sport: facetSport(facets), gender: facetGender(facets), season_id: facetSeason(facets, url), team_name_raw: h1 ?? facets.schoolName }
    });
  }
};
