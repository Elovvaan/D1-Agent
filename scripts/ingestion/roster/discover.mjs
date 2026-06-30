import { endYearOf, seasonFromEndYear } from "../types.mjs";

const rosterUrlHints = [/\broster\b/i, /\bteam\/roster\b/i, /\bplayers?\b/i, /\bsquad\b/i, /\bteam-roster\b/i];
const rosterAnchorHints = [/\broster\b/i, /\bplayers?\b/i, /\bteam\b/i, /\bsquad\b/i, /\bvarsity\b/i];

export function discoverRosterSources(links, opts = {}) {
  const out = [];
  for (const { url, href, anchor_text = "", title = "" } of links) {
    const target = url ?? href;
    if (!target) continue;
    if (opts.sameHost) {
      try {
        const host = new URL(target, `https://${opts.sameHost}`).host;
        if (host && opts.sameHost && !host.endsWith(opts.sameHost)) continue;
      } catch {
        continue;
      }
    }
    let score = 0;
    const reasons = [];
    if (rosterUrlHints.some((regex) => regex.test(target))) {
      score += 0.6;
      reasons.push("url_hint");
    }
    if (rosterAnchorHints.some((regex) => regex.test(`${anchor_text} ${title}`))) {
      score += 0.3;
      reasons.push("anchor_hint");
    }
    if (/\/\d{4}(-\d{2,4})?\//.test(target) || /[?&](season|year)=/i.test(target)) {
      score += 0.1;
      reasons.push("season_param");
    }
    if (score >= 0.6) out.push({ url: target, anchor_text: anchor_text || title, reason: reasons.join("+"), score: Math.min(1, score) });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function enumerateBackfillSeasons(current, depth = 3) {
  const end = endYearOf(current);
  return Array.from({ length: depth }, (_, index) => ({ ...seasonFromEndYear(end - index), is_current: index === 0 }));
}

export function candidateRosterUrls(template, seasons) {
  const hasPlaceholder = /\{(season|startYear|endYear|seasonSlug|maxPrepsSeason)\}/.test(template);
  if (!hasPlaceholder) {
    const current = seasons.find((season) => season.is_current) ?? seasons[0];
    return current ? [{ season_id: current.id, url: template }] : [];
  }
  return seasons.map((season) => ({
    season_id: season.id,
    url: template
      .replace(/\{season\}/g, season.id)
      .replace(/\{seasonSlug\}/g, season.id.replace("-", ""))
      .replace(/\{maxPrepsSeason\}/g, season.id.slice(2))
      .replace(/\{startYear\}/g, String(season.start_year))
      .replace(/\{endYear\}/g, String(season.end_year))
  }));
}
