const usStates = new Set([
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new hampshire",
  "new jersey",
  "new mexico",
  "new york",
  "north carolina",
  "north dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode island",
  "south carolina",
  "south dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west virginia",
  "wisconsin",
  "wyoming"
]);

function targetTypeFor(linkClass) {
  return {
    TEAM_PAGE: "TEAM_PAGE",
    STATE_PAGE: "STATE_DIRECTORY_PAGE",
    PLAYER_DIRECTORY: "PLAYER_DIRECTORY_PAGE",
    STAT_LEADERS: "STAT_LEADERS_PAGE",
    SCORES: "SCORES_PAGE",
    SCHEDULES: "SCHEDULE_PAGE",
    PLAYOFFS: "PLAYOFFS_BRACKET_PAGE",
    LIVE_STREAMS: "LIVE_STREAM_PAGE",
    RELATED_CONTENT: "ARTICLE_PAGE"
  }[linkClass] ?? "UNKNOWN";
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function absoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function teamPath(path) {
  const match = path.match(/^\/([a-z]{2})\/[^/]+\/[^/]+\/([a-z0-9-]+)\/?$/);
  return match ? { state: match[1].toUpperCase(), sport: match[2] } : null;
}

export function classifyLink(absHref, anchor, sourceHost, rawHref = "") {
  let host = "";
  let path = "";
  let search = "";
  try {
    const url = new URL(absHref);
    host = url.host;
    path = url.pathname.toLowerCase();
    search = url.search.toLowerCase();
  } catch {
    // Invalid URLs are routed to IGNORE below.
  }
  const anchorText = anchor.toLowerCase();
  const raw = rawHref.toLowerCase();
  const isExternal = !!host && !!sourceHost && host !== sourceHost;
  let linkClass = "IGNORE";
  let strongUrlSignal = false;
  let stateHint;
  let sportHint;

  if (/nfhsnetwork\.com/.test(host) || /\/live(-streams?)?\b/.test(path)) {
    linkClass = "LIVE_STREAMS";
    strongUrlSignal = true;
  } else if (/\b(live stream|live streams|watch live)\b/.test(anchorText)) {
    linkClass = "LIVE_STREAMS";
  } else if (/stat-leaders/.test(path) || /\bstat leaders?\b/.test(anchorText)) {
    linkClass = "STAT_LEADERS";
    strongUrlSignal = /stat-leaders/.test(path);
  } else if (/\/athletes\//.test(path) || /\b(players|athletes|roster)\b/.test(anchorText)) {
    linkClass = "PLAYER_DIRECTORY";
    strongUrlSignal = /\/athletes\//.test(path);
  } else if (/playoffs|brackets?/.test(path) || /\b(playoffs|brackets?)\b/.test(anchorText)) {
    linkClass = "PLAYOFFS";
    strongUrlSignal = /playoffs|brackets?/.test(path);
  } else if (/schedules_scores|scores|results/.test(path + " " + search) || /\bscores?\b/.test(anchorText)) {
    linkClass = "SCORES";
    strongUrlSignal = /schedules_scores|scores|results/.test(path + " " + search);
  } else if (/schedule/.test(path) || /\bschedule\b/.test(anchorText)) {
    linkClass = "SCHEDULES";
    strongUrlSignal = /schedule/.test(path);
  } else if (/#states/.test(raw) || /[?&]state=/.test(search) || usStates.has(anchorText)) {
    linkClass = "STATE_PAGE";
    strongUrlSignal = !usStates.has(anchorText);
    if (usStates.has(anchorText)) stateHint = anchorText;
  } else {
    const team = teamPath(path);
    if (team) {
      linkClass = "TEAM_PAGE";
      strongUrlSignal = true;
      stateHint = team.state;
      sportHint = team.sport;
    } else if (/\/schools\//.test(path) || /\bteams\b/.test(anchorText)) {
      linkClass = "TEAM_PAGE";
    } else if (/\/(news|video|photography|photos|galleries|game-of-the-week|record-book)\b/.test(path) || /\b(news|highlights)\b/.test(anchorText)) {
      linkClass = "RELATED_CONTENT";
      strongUrlSignal = /\/(news|video|photography|photos|galleries|game-of-the-week|record-book)\b/.test(path);
    }
  }

  return {
    href: absHref,
    anchor_text: anchor,
    link_class: linkClass,
    target_page_type_guess: targetTypeFor(linkClass),
    state_hint: stateHint,
    sport_hint: sportHint,
    is_external: isExternal,
    confidence: linkClass === "IGNORE" ? 0 : strongUrlSignal ? 0.9 : 0.6
  };
}

export function extractDiscoveryLinks(html, sourceUrl) {
  const sourceHost = new URL(sourceUrl).host;
  const seen = new Set();
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const rawHref = match[1].trim();
    if (!rawHref || /^(javascript:|mailto:|tel:)/i.test(rawHref)) continue;
    const anchor = cleanText(match[2]);
    const href = absoluteUrl(rawHref, sourceUrl);
    const key = `${href.split("#")[0]}|${anchor.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const link = classifyLink(href, anchor, sourceHost, rawHref);
    if (link.link_class !== "IGNORE") links.push(link);
  }
  return links;
}
