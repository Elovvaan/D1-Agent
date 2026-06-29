import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const parserVersion = "public-url-importer-v1";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statHeaderAliases = {
  gp: "Games Played",
  g: "Games",
  gs: "Games Started",
  cmp: "Completions",
  comp: "Completions",
  att: "Attempts",
  pct: "Completion Percentage",
  yds: "Yards",
  yards: "Yards",
  td: "Touchdowns",
  tds: "Touchdowns",
  int: "Interceptions",
  rec: "Receptions",
  avg: "Average",
  car: "Carries",
  rush: "Rushing",
  ast: "Assists",
  solo: "Solo Tackles",
  tackles: "Tackles",
  tkls: "Tackles",
  sacks: "Sacks",
  fg: "Field Goals",
  xp: "Extra Points"
};

function parseArgs(argv) {
  const urlIndex = argv.indexOf("--url");
  if (urlIndex === -1 || !argv[urlIndex + 1] || argv[urlIndex + 1].startsWith("--")) {
    return { url: null };
  }

  return { url: argv[urlIndex + 1] };
}

function assertPublicHttpUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Provide a valid public school or athletics URL to import real data.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Provide a valid public school or athletics URL to import real data.");
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    throw new Error("Provide a valid public school or athletics URL to import real data.");
  }

  return url;
}

function stableId(prefix, value) {
  return `${prefix}-${createHash("sha1").update(value).digest("hex").slice(0, 14)}`;
}

function stripTags(html) {
  return decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function normalizeText(value) {
  return decodeHtml(String(value ?? "").replace(/\s+/g, " ").trim());
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function titleFromHtml(html, sourceUrl) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1];
  if (og) return normalizeText(og);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) return normalizeText(stripTags(title));

  return new URL(sourceUrl).hostname;
}

function absoluteUrl(href, sourceUrl) {
  try {
    return new URL(href, sourceUrl).toString();
  } catch {
    return sourceUrl;
  }
}

function field(name, value, sourceUrl, fetchedAt, parser, selector, rawSnippet) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  return {
    name,
    value: normalized,
    attribution: {
      sourceUrl,
      fetchedAt,
      parser,
      selector,
      rawSnippet: normalizeText(stripTags(rawSnippet ?? "")).slice(0, 280)
    }
  };
}

function entity(type, sourceUrl, sourceRef, fields, raw) {
  return {
    id: stableId(type, `${sourceUrl}:${sourceRef}:${fields.map((item) => `${item.name}:${item.value}`).join("|")}`),
    type,
    sourceUrl,
    sourceRef,
    fields,
    raw
  };
}

function inferSportAndSeason(sourceUrl, title) {
  const haystack = `${sourceUrl} ${title}`.toLowerCase();
  const sports = ["football", "basketball", "baseball", "softball", "soccer", "volleyball", "lacrosse", "wrestling", "track", "tennis", "golf"];
  const sport = sports.find((item) => haystack.includes(item)) ?? "athletics";
  const season = haystack.match(/\b(20\d{2})\b/)?.[1] ?? String(new Date().getFullYear());
  return { sport, season };
}

function parseSchoolEntity(html, sourceUrl, fetchedAt) {
  const title = titleFromHtml(html, sourceUrl);
  const schoolName = title
    .replace(/\s*-\s*(Roster|Schedule|Athletics|Football|Basketball|Baseball|Softball|Soccer|Volleyball).*$/i, "")
    .replace(/\s*\|\s*.*$/i, "")
    .trim();
  const fields = [
    field("schoolName", schoolName || new URL(sourceUrl).hostname, sourceUrl, fetchedAt, parserVersion, "title", title),
    field("profileUrl", sourceUrl, sourceUrl, fetchedAt, parserVersion, "canonical", sourceUrl)
  ].filter(Boolean);

  return entity("school", sourceUrl, "school", fields, { title });
}

function parseTeamEntity(html, sourceUrl, fetchedAt) {
  const title = titleFromHtml(html, sourceUrl);
  const inferred = inferSportAndSeason(sourceUrl, title);
  const fields = [
    field("teamName", title, sourceUrl, fetchedAt, parserVersion, "title", title),
    field("sport", inferred.sport, sourceUrl, fetchedAt, parserVersion, "url/title", `${sourceUrl} ${title}`),
    field("season", inferred.season, sourceUrl, fetchedAt, parserVersion, "url/title", `${sourceUrl} ${title}`)
  ].filter(Boolean);

  return entity("team", sourceUrl, "team", fields, { title });
}

function cellsFromRow(rowHtml) {
  const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => normalizeText(stripTags(match[1])));
  return cells;
}

function parseTables(html, sourceUrl, fetchedAt) {
  const entities = [];
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];

  for (const [tableIndex, tableMatch] of tables.entries()) {
    const table = tableMatch[0];
    const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
    if (rows.length < 2) continue;

    const headers = cellsFromRow(rows[0]).map((item) => item.toLowerCase());
    const looksLikeRoster = headers.some((header) => /name|player|student|athlete/.test(header)) && headers.some((header) => /pos|position|#/i.test(header));
    const looksLikeSchedule = headers.some((header) => /date/.test(header)) && headers.some((header) => /opponent|vs|team/.test(header));
    if (!looksLikeRoster && !looksLikeSchedule) continue;

    for (const [rowIndex, row] of rows.slice(1).entries()) {
      const cells = cellsFromRow(row);
      if (cells.length < 2) continue;

      if (looksLikeRoster) {
        const mapped = mapRosterCells(headers, cells);
        if (!mapped.name) continue;
        const fields = rosterFields(mapped, sourceUrl, fetchedAt, `table:nth(${tableIndex}) tr:nth(${rowIndex + 1})`, row);
        entities.push(entity("player", sourceUrl, `table-${tableIndex}-player-${rowIndex}-${mapped.name}`, fields, mapped));
        entities.push(...statEntitiesFromRosterRow(headers, cells, mapped, sourceUrl, fetchedAt, `table:nth(${tableIndex}) tr:nth(${rowIndex + 1})`, row));
      } else if (looksLikeSchedule) {
        const mapped = mapScheduleCells(headers, cells);
        if (!mapped.opponent && !mapped.gameDate) continue;
        const fields = scheduleFields(mapped, sourceUrl, fetchedAt, `table:nth(${tableIndex}) tr:nth(${rowIndex + 1})`, row);
        entities.push(entity("game", sourceUrl, `table-${tableIndex}-game-${rowIndex}-${mapped.opponent ?? mapped.gameDate}`, fields, mapped));
      }
    }
  }

  return entities;
}

function isIdentityRosterHeader(header) {
  return /^#|number|no\.|name|player|student|athlete|pos|position|class|year|yr|height|ht|weight|wt|hometown|home town|city/.test(header);
}

function normalizeStatMetric(header) {
  const compact = header.toLowerCase().replace(/[^a-z0-9%]/g, "");
  if (!compact || isIdentityRosterHeader(header)) return null;
  return statHeaderAliases[compact] ?? normalizeText(header.replace(/[_-]+/g, " "));
}

function looksLikeStatValue(value) {
  return /^-?\d+(\.\d+)?%?$/.test(normalizeText(value));
}

function statEntitiesFromRosterRow(headers, cells, mapped, sourceUrl, fetchedAt, selector, rawSnippet) {
  const entities = [];
  const inferred = inferSportAndSeason(sourceUrl, titleFromHtml(String(rawSnippet), sourceUrl));
  for (const [index, header] of headers.entries()) {
    const metric = normalizeStatMetric(header);
    const statValue = cells[index];
    if (!metric || !looksLikeStatValue(statValue)) continue;

    const fields = [
      field("athleteName", mapped.name, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
      field("jerseyNumber", mapped.jerseyNumber, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
      field("position", mapped.position, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
      field("sport", inferred.sport, sourceUrl, fetchedAt, parserVersion, "url/title", sourceUrl),
      field("season", inferred.season, sourceUrl, fetchedAt, parserVersion, "url/title", sourceUrl),
      field("statMetric", metric, sourceUrl, fetchedAt, parserVersion, `${selector} th:nth(${index + 1})`, rawSnippet),
      field("statValue", statValue, sourceUrl, fetchedAt, parserVersion, `${selector} td:nth(${index + 1})`, rawSnippet),
      field("statContext", `${inferred.season} ${inferred.sport}`, sourceUrl, fetchedAt, parserVersion, "url/title", sourceUrl)
    ].filter(Boolean);

    entities.push(entity("stat", sourceUrl, `${selector}-stat-${mapped.name}-${metric}`, fields, { athleteName: mapped.name, metric, value: statValue }));
  }

  return entities;
}

function mapRosterCells(headers, cells) {
  const mapped = {};
  for (const [index, header] of headers.entries()) {
    const value = cells[index];
    if (!value) continue;
    if (/^#|number|no\./.test(header)) mapped.jerseyNumber = value;
    else if (/name|player|student|athlete/.test(header)) mapped.name = value;
    else if (/pos|position/.test(header)) mapped.position = value;
    else if (/class|year|yr/.test(header)) mapped.classYear = value;
    else if (/height|ht/.test(header)) mapped.height = value;
    else if (/weight|wt/.test(header)) mapped.weight = value;
    else if (/hometown|home town|city/.test(header)) mapped.hometown = value;
  }

  if (!mapped.name && cells.length >= 3) {
    mapped.jerseyNumber = /^#?\d+$/.test(cells[0]) ? cells[0].replace("#", "") : undefined;
    mapped.name = cells.find((item) => /[A-Za-z]+,\s*[A-Za-z]+|[A-Za-z]+\s+[A-Za-z]+/.test(item));
    mapped.position = cells.find((item) => /^(QB|RB|WR|TE|OL|DL|LB|DB|CB|S|K|P|G|F|C|GK|M|D)$/i.test(item));
  }

  return mapped;
}

function mapScheduleCells(headers, cells) {
  const mapped = {};
  for (const [index, header] of headers.entries()) {
    const value = cells[index];
    if (!value) continue;
    if (/date/.test(header)) mapped.gameDate = value;
    else if (/opponent|vs|team/.test(header)) mapped.opponent = value;
    else if (/location|site|venue/.test(header)) mapped.location = value;
  }

  return mapped;
}

function rosterFields(mapped, sourceUrl, fetchedAt, selector, rawSnippet) {
  return [
    field("name", mapped.name, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("jerseyNumber", mapped.jerseyNumber, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("position", mapped.position, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("classYear", mapped.classYear, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("height", mapped.height, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("weight", mapped.weight, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("hometown", mapped.hometown, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet)
  ].filter(Boolean);
}

function scheduleFields(mapped, sourceUrl, fetchedAt, selector, rawSnippet) {
  return [
    field("gameDate", mapped.gameDate, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("opponent", mapped.opponent, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet),
    field("location", mapped.location, sourceUrl, fetchedAt, parserVersion, selector, rawSnippet)
  ].filter(Boolean);
}

function parseRosterCards(html, sourceUrl, fetchedAt) {
  const entities = [];
  const cardMatches = [...html.matchAll(/<li[^>]+class=["'][^"']*(?:roster|player)[^"']*["'][\s\S]*?<\/li>/gi)];
  const divMatches = [...html.matchAll(/<div[^>]+class=["'][^"']*(?:sidearm-roster-player|roster-card|player-card)[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi)];
  const cards = [...cardMatches, ...divMatches].map((match) => match[0]);

  for (const [index, card] of cards.entries()) {
    const name =
      pickByClass(card, /(sidearm-roster-player-name|roster.*name|player.*name)/i) ??
      card.match(/aria-label=["']([^"']+)["']/i)?.[1];
    if (!name || name.length > 80) continue;

    const jerseyNumber = pickByClass(card, /(jersey|number|no)/i)?.replace("#", "");
    const position = pickByClass(card, /(position|pos)/i);
    const classYear = pickByClass(card, /(academic-year|class|year|yr)/i);
    const height = pickByClass(card, /(height|ht)/i);
    const weight = pickByClass(card, /(weight|wt)/i);
    const hometown = pickByClass(card, /(hometown|location|home)/i);
    const profileHref = card.match(/<a[^>]+href=["']([^"']+)["']/i)?.[1];
    const mapped = { name, jerseyNumber, position, classYear, height, weight, hometown };
    const fields = rosterFields(mapped, sourceUrl, fetchedAt, `.roster-card:nth(${index})`, card);
    const profile = field("profileUrl", profileHref ? absoluteUrl(profileHref, sourceUrl) : "", sourceUrl, fetchedAt, parserVersion, `.roster-card:nth(${index}) a`, card);
    if (profile) fields.push(profile);
    entities.push(entity("player", sourceUrl, `card-player-${index}-${name}`, fields, mapped));
  }

  return dedupeEntities(entities);
}

function pickByClass(html, classRegex) {
  const matches = [...html.matchAll(/<([a-z0-9]+)[^>]*class=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const match of matches) {
    if (classRegex.test(match[2])) {
      const text = normalizeText(stripTags(match[3]));
      if (text) return text;
    }
  }

  return null;
}

function parseJsonLd(html, sourceUrl, fetchedAt) {
  const entities = [];
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [index, match] of scripts.entries()) {
    const rawJson = normalizeText(match[1]);
    try {
      const parsed = JSON.parse(rawJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const type = String(item["@type"] ?? "").toLowerCase();
        if (type.includes("sportsorganization") || type.includes("organization")) {
          const fields = [
            field("schoolName", item.name, sourceUrl, fetchedAt, parserVersion, `jsonld[${index}].name`, rawJson),
            field("profileUrl", item.url ?? sourceUrl, sourceUrl, fetchedAt, parserVersion, `jsonld[${index}].url`, rawJson)
          ].filter(Boolean);
          if (fields.length) entities.push(entity("school", sourceUrl, `jsonld-school-${index}`, fields, item));
        }
      }
    } catch {
      continue;
    }
  }

  return entities;
}

function parseLinksForStreams(html, sourceUrl, fetchedAt) {
  const entities = [];
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const [index, match] of links.entries()) {
    const href = match[1];
    const label = normalizeText(stripTags(match[2]));
    const combined = `${href} ${label}`.toLowerCase();
    if (!/(stream|watch live|live video|youtube|hudl|nfhs)/.test(combined)) continue;
    const streamUrl = absoluteUrl(href, sourceUrl);
    const fields = [
      field("streamUrl", streamUrl, sourceUrl, fetchedAt, parserVersion, `a:nth(${index})`, match[0]),
      field("name", label || streamUrl, sourceUrl, fetchedAt, parserVersion, `a:nth(${index})`, match[0])
    ].filter(Boolean);
    entities.push(entity("stream", sourceUrl, `stream-${index}-${streamUrl}`, fields, { href: streamUrl, label }));
  }

  return entities;
}

function dedupeEntities(entities) {
  const seen = new Set();
  const result = [];
  for (const item of entities) {
    const key = `${item.type}:${item.fields.map((fieldItem) => `${fieldItem.name}:${fieldItem.value}`).join("|")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function importedName(entity) {
  return entity.fields.find((item) => item.name === "name" || item.name === "athleteName" || item.name === "schoolName" || item.name === "teamName" || item.name === "statMetric")?.value ?? "";
}

function normalizeForMatch(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildMatches(entities) {
  return entities.map((item) => {
    const name = importedName(item);
    const hasName = Boolean(name);
    const hasSource = item.fields.length > 0;
    const confidence = item.type === "school" || item.type === "team" ? 0.58 : item.type === "stat" && hasName && hasSource ? 0.55 : hasName && hasSource ? 0.42 : 0.18;
    const decision = confidence >= 0.92 ? "auto_merged" : confidence >= 0.55 ? "pending_review" : "rejected";

    return {
      id: `match-${item.id}`,
      importedEntityId: item.id,
      entityType: item.type,
      confidence,
      decision,
      evidence: {
        importedName: name,
        normalizedName: normalizeForMatch(name),
        fieldCount: item.fields.length,
        sourceRef: item.sourceRef,
        reason: decision === "pending_review" ? "No connected database entity was available for automatic merge." : "Insufficient confidence for automatic merge."
      }
    };
  });
}

function buildReviewQueue(matches) {
  return matches
    .filter((match) => match.decision !== "auto_merged")
    .map((match) => ({
      id: `review-${match.id}`,
      importedEntityId: match.importedEntityId,
      reason:
        match.decision === "pending_review"
          ? "Imported public record needs admin review before merge."
          : "Imported public record did not confidently match an existing D1 entity.",
      priority: match.entityType === "player" ? "high" : "medium",
      decision: match.decision,
      evidence: match.evidence
    }));
}

function buildClaimAndVerificationWorkflows(entities, fetchedAt) {
  const players = entities.filter((item) => item.type === "player");
  const claimRequests = players.map((player) => ({
    id: `claim-${player.id}`,
    importedPlayerId: player.id,
    athleteUserId: "pending-auth-user",
    status: "pending",
    submittedAt: fetchedAt,
    evidence: {
      importedName: importedName(player),
      sourceUrl: player.sourceUrl,
      requiredNextStep: "Athlete must authenticate and prove identity before claim approval."
    }
  }));
  const coachVerificationRequests = players.map((player) => ({
    id: `coach-verify-${player.id}`,
    importedPlayerId: player.id,
    coachUserId: "pending-coach-user",
    status: "pending",
    submittedAt: fetchedAt,
    correctedFields: [],
    note: "Coach must verify roster/player data before it can raise trust."
  }));

  return { claimRequests, coachVerificationRequests };
}

function parsePublicAthleticsHtml(html, sourceUrl, fetchedAt) {
  const baseEntities = [parseSchoolEntity(html, sourceUrl, fetchedAt), parseTeamEntity(html, sourceUrl, fetchedAt)];
  const parsed = [
    ...parseJsonLd(html, sourceUrl, fetchedAt),
    ...parseTables(html, sourceUrl, fetchedAt),
    ...parseRosterCards(html, sourceUrl, fetchedAt),
    ...parseLinksForStreams(html, sourceUrl, fetchedAt)
  ];

  return dedupeEntities([...baseEntities, ...parsed]);
}

async function importPublicUrl(rawUrl) {
  const url = assertPublicHttpUrl(rawUrl);
  const fetchedAt = new Date().toISOString();
  const response = await fetch(url, {
    headers: {
      "user-agent": "D1-Agent-PublicSportsImporter/1.0 (+https://d1-agent.local)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Public import failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml") && !contentType.includes("text/plain")) {
    throw new Error(`Public import failed: unsupported content type ${contentType || "unknown"}`);
  }

  const html = await response.text();
  const sourceUrl = response.url || url.toString();
  const entities = parsePublicAthleticsHtml(html, sourceUrl, fetchedAt);
  const matches = buildMatches(entities);
  const reviewQueue = buildReviewQueue(matches);
  const workflows = buildClaimAndVerificationWorkflows(entities, fetchedAt);
  const sourceTitle = titleFromHtml(html, sourceUrl);
  const runId = stableId("public-import", `${sourceUrl}:${fetchedAt}`);
  const result = {
    runId,
    sourceUrl,
    fetchedAt,
    sourceTitle,
    entities,
    matches,
    reviewQueue,
    claimRequests: workflows.claimRequests,
    coachVerificationRequests: workflows.coachVerificationRequests
  };

  const artifactDir = resolve(repoRoot, "data", "imports");
  await mkdir(artifactDir, { recursive: true });
  const artifactPath = resolve(artifactDir, `${runId}.json`);
  await writeFile(artifactPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  return { result, artifactPath };
}

const { url } = parseArgs(process.argv.slice(2));
if (!url) {
  console.error("Provide a public school or athletics URL to import real data.");
  process.exit(1);
}

try {
  const { result, artifactPath } = await importPublicUrl(url);
  const players = result.entities.filter((item) => item.type === "player").length;
  const schools = result.entities.filter((item) => item.type === "school").length;
  const teams = result.entities.filter((item) => item.type === "team").length;
  const games = result.entities.filter((item) => item.type === "game").length;
  const streams = result.entities.filter((item) => item.type === "stream").length;

  console.log(`Imported public athletics URL: ${result.sourceUrl}`);
  console.log(`Source title: ${result.sourceTitle ?? "Unknown"}`);
  console.log(`Records imported: ${result.entities.length}`);
  console.log(`Breakdown: schools=${schools}, teams=${teams}, players=${players}, games=${games}, streams=${streams}`);
  console.log(`Records requiring review: ${result.reviewQueue.length}`);
  console.log(`Athlete claim records created: ${result.claimRequests.length}`);
  console.log(`Coach verification records created: ${result.coachVerificationRequests.length}`);
  console.log(`Artifact: ${artifactPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
