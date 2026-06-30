import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { selectAdapter } from "./ingestion/adapters/source-adapter.mjs";
import { adapterMaxPreps } from "./ingestion/adapters/maxpreps.mjs";
import { publisherOrgFromSource } from "./ingestion/org-resolution/organization-model.mjs";
import { sourceSchedulerNote, refreshTierForSource } from "./ingestion/scheduler/source-scheduler.mjs";

export const repoRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
export const importsDir = resolve(repoRoot, "data", "imports");
export const sourcesPath = resolve(repoRoot, "data", "sources", "public-sources.json");

const sportTerms = [
  "football",
  "basketball",
  "baseball",
  "softball",
  "soccer",
  "volleyball",
  "track",
  "wrestling",
  "lacrosse",
  "tennis",
  "golf",
  "swimming",
  "cross country",
  "hockey",
  "cheer",
  "drill",
  "esports"
];

const sourceTypeRules = [
  { sourceType: "roster", entityType: "team", confidence: 0.93, terms: ["roster", "players", "student-athlete"] },
  { sourceType: "stats", entityType: "stat", confidence: 0.9, terms: ["stats", "statistics", "leaders", "boxscore", "box-score"] },
  { sourceType: "schedule", entityType: "game", confidence: 0.88, terms: ["schedule", "scores", "fixtures"] },
  { sourceType: "bracket/tournament", entityType: "game", confidence: 0.87, terms: ["bracket", "tournament", "playoff", "championship"] },
  { sourceType: "livestream/media", entityType: "stream", confidence: 0.84, terms: ["stream", "broadcast", "watch", "live", "video", "media"] },
  { sourceType: "coach/staff", entityType: "coach", confidence: 0.82, terms: ["coach", "coaches", "staff"] },
  { sourceType: "camp/event", entityType: "game", confidence: 0.78, terms: ["camp", "clinic", "event", "showcase", "meet"] },
  { sourceType: "team", entityType: "team", confidence: 0.72, terms: sportTerms },
  { sourceType: "school", entityType: "school", confidence: 0.68, terms: ["athletics", "school", "academy", "high", "university", "college"] },
  { sourceType: "rankings", entityType: "stat", confidence: 0.66, terms: ["ranking", "rankings", "ranked"] }
];

const adapters = [adapterMaxPreps];

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export async function readSourceRegistry() {
  if (!existsSync(sourcesPath)) return [];
  return JSON.parse(await readFile(sourcesPath, "utf8"));
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html, fallbackUrl) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return cleanText(h1 || title || new URL(fallbackUrl).hostname);
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function samePublicSite(candidate, hubUrl) {
  try {
    const candidateUrl = new URL(candidate);
    const sourceUrl = new URL(hubUrl);
    return candidateUrl.hostname === sourceUrl.hostname;
  } catch {
    return false;
  }
}

function extractLinks(html, baseUrl) {
  const records = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = absoluteUrl(match[1], baseUrl);
    if (!url || !url.startsWith("http") || !samePublicSite(url, baseUrl)) continue;
    const title = cleanText(match[2]) || new URL(url).pathname.split("/").filter(Boolean).join(" / ") || url;
    if (/\.(pdf|jpg|jpeg|png|gif|webp|zip)$/i.test(new URL(url).pathname)) continue;
    records.push({ url, title });
  }
  const seen = new Set();
  return records.filter((record) => {
    const key = record.url.replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function classifyPublicLink(url, title = "") {
  const text = `${url} ${title}`.toLowerCase();
  const rule = sourceTypeRules.find((item) => item.terms.some((term) => text.includes(term)));
  if (!rule) {
    return { sourceType: "unknown", entityType: "school", confidence: 0.38, evidence: ["No high-confidence public sports pattern matched."] };
  }
  return {
    sourceType: rule.sourceType,
    entityType: rule.entityType,
    confidence: rule.confidence,
    evidence: rule.terms.filter((term) => text.includes(term)).slice(0, 5).map((term) => `Matched "${term}".`)
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "user-agent": "MyD1PublicSportsImporter/1.0 (+https://myd1.sports)"
    }
  });
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error(`Unsupported content type: ${contentType || "unknown"}`);
  }
  return response.text();
}

export async function robotsAllows(targetUrl) {
  const url = new URL(targetUrl);
  try {
    const robots = await fetchText(new URL("/robots.txt", url.origin).toString());
    const blocks = [...robots.matchAll(/disallow:\s*(\S+)/gi)].map((match) => match[1]).filter(Boolean);
    if (blocks.includes("/")) return false;
    return !blocks.some((path) => path !== "/" && url.pathname.startsWith(path));
  } catch {
    return true;
  }
}

function sourceNameFromUrl(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function recordId(prefix, value) {
  return `${prefix}-${createHash("sha1").update(value).digest("hex").slice(0, 12)}`;
}

function publicFields({ title, url, fetchedAt, parser, sourceName, sourceType, confidence }) {
  const attribution = { sourceUrl: url, fetchedAt, parser, rawSnippet: title };
  return [
    { name: "name", value: title, attribution },
    { name: "profileUrl", value: url, attribution },
    { name: "sourceName", value: sourceName, attribution },
    { name: "sourceType", value: sourceType, attribution },
    { name: "confidenceScore", value: String(confidence), attribution },
    { name: "reviewStatus", value: confidence >= 0.92 ? "ready_for_review" : "pending_review", attribution },
    { name: "importedAt", value: fetchedAt, attribution }
  ];
}

function rankingRecordFields(record, fetchedAt, parser) {
  const attribution = { sourceUrl: record.source_url, fetchedAt, parser, rawSnippet: record.team_name_raw };
  const fields = [
    { name: "name", value: `${record.team_name_raw} #${record.rank}`, attribution },
    { name: "teamName", value: record.team_name_raw, attribution },
    { name: "profileUrl", value: record.team_url ?? record.source_url, attribution },
    { name: "sport", value: record.sport, attribution },
    { name: "season", value: record.season, attribution },
    { name: "sourceName", value: "MaxPreps", attribution },
    { name: "sourceType", value: "rankings_page", attribution },
    { name: "confidenceScore", value: String(record.confidence_score), attribution },
    { name: "reviewStatus", value: record.review.length ? "pending_review" : "auto_commit_ready", attribution },
    { name: "importedAt", value: record.imported_timestamp, attribution },
    { name: "statMetric", value: "national_rank", attribution },
    { name: "statValue", value: String(record.rank), attribution },
    { name: "statContext", value: `${record.gender} ${record.sport} ${record.season}`, attribution }
  ];
  if (record.state) fields.push({ name: "location", value: record.state, attribution });
  if (record.overall_record) fields.push({ name: "statContext", value: `overall_record:${record.overall_record.raw}`, attribution });
  return fields;
}

function linkClassToEntityType(linkClass) {
  if (linkClass === "LIVE_STREAMS") return "stream";
  if (linkClass === "PLAYER_DIRECTORY") return "player";
  if (linkClass === "SCORES" || linkClass === "SCHEDULES" || linkClass === "PLAYOFFS") return "game";
  if (linkClass === "STAT_LEADERS") return "stat";
  return "team";
}

function adapterLinkToGeneric(link) {
  const sourceType = link.link_class.toLowerCase();
  return {
    url: link.href,
    title: link.anchor_text || link.href,
    sourceType,
    entityType: linkClassToEntityType(link.link_class),
    confidence: link.confidence,
    evidence: [
      `Adapter classified link as ${link.link_class}.`,
      ...(link.state_hint ? [`State hint: ${link.state_hint}.`] : []),
      ...(link.sport_hint ? [`Sport hint: ${link.sport_hint}.`] : [])
    ]
  };
}

export async function runDeepDiscovery(source, options = {}) {
  const sourceUrl = typeof source === "string" ? source : source.source_url;
  if (!sourceUrl) throw new Error("Provide a public school or athletics URL to import real data.");
  const fetchedAt = new Date().toISOString();
  const parser = "national-public-deep-v1";
  const sourceName = typeof source === "string" ? sourceNameFromUrl(sourceUrl) : source.source_name || sourceNameFromUrl(sourceUrl);
  const maxFollow = Number(options.maxFollow ?? 14);
  const allowed = await robotsAllows(sourceUrl);

  const runId = `deep-import-${randomUUID()}`;
  const result = {
    runId,
    sourceUrl,
    fetchedAt,
    sourceTitle: sourceName,
    sourceRegistry: typeof source === "string" ? null : source,
    entities: [],
    matches: [],
    reviewQueue: [],
    claimRequests: [],
    coachVerificationRequests: [],
    discoveredLinks: [],
    blockedByRobots: !allowed
  };

  if (!allowed) {
    result.reviewQueue.push({
      id: `review-${runId}`,
      importedEntityId: runId,
      reason: "robots.txt blocks public discovery for this URL.",
      priority: "high",
      decision: "pending_review",
      evidence: { sourceUrl, reviewStatus: "blocked_by_robots" }
    });
    return result;
  }

  const hubHtml = await fetchText(sourceUrl);
  const context = { url: sourceUrl, html: hubHtml, fetchedAt };
  const selectedAdapter = selectAdapter(adapters, context);
  const publisherOrg = publisherOrgFromSource(typeof source === "string" ? null : source, sourceUrl);

  if (selectedAdapter) {
    const adapterResult = selectedAdapter.adapter.parseRankingPage(context);
    result.parser = selectedAdapter.adapter.id;
    result.publisherOrganization = publisherOrg;
    result.refreshTier = refreshTierForSource(typeof source === "string" ? { source_type: adapterResult.classification.primary } : source);
    result.schedulerNote = sourceSchedulerNote(typeof source === "string" ? { source_type: adapterResult.classification.primary } : source);
    result.pageClassification = adapterResult.classification;
    result.methodology = adapterResult.methodology;
    result.discoveredLinks = adapterResult.links.map(adapterLinkToGeneric).slice(0, 120);
    result.entities = adapterResult.records.map((record) => ({
      id: recordId("ranking", `${record.source_url}:${record.rank}:${record.team_name_raw}`),
      type: "stat",
      sourceUrl: record.source_url,
      sourceRef: "ranking_record",
      fields: rankingRecordFields(record, fetchedAt, selectedAdapter.adapter.id),
      raw: {
        sourceLabel: "Public Record",
        sourceName,
        publisherOrganization: publisherOrg,
        pageClassification: adapterResult.classification,
        methodology: adapterResult.methodology,
        refreshTier: result.refreshTier,
        record,
        confidenceScore: record.confidence_score,
        reviewStatus: record.review.length ? "pending_review" : "auto_commit_ready",
        reviewFlags: record.review,
        importedAt: fetchedAt
      }
    }));
    const followLinks = result.discoveredLinks.filter((link) => link.confidence >= 0.6).slice(0, maxFollow);
    for (const link of followLinks) {
      const entityId = recordId("public", link.url);
      result.entities.push({
        id: entityId,
        type: link.entityType,
        sourceUrl: link.url,
        sourceRef: link.sourceType,
        fields: publicFields({ title: link.title, url: link.url, fetchedAt, parser: selectedAdapter.adapter.id, sourceName, sourceType: link.sourceType, confidence: link.confidence }),
        raw: {
          sourceLabel: "Public Record",
          sourceName,
          publisherOrganization: publisherOrg,
          sourceUrl: link.url,
          importedAt: fetchedAt,
          confidenceScore: link.confidence,
          reviewStatus: link.confidence >= 0.85 ? "auto_commit_ready" : "pending_review",
          sourceType: link.sourceType,
          evidence: link.evidence
        }
      });
    }
    result.reviewQueue = result.entities
      .filter((entity) => entity.raw.reviewStatus !== "auto_commit_ready")
      .map((entity) => ({
        id: `review-${entity.id}`,
        importedEntityId: entity.id,
        reason: "Adapter-parsed public record requires review before merge or verification.",
        priority: Number(entity.raw.confidenceScore ?? 0) < 0.6 ? "high" : "medium",
        decision: "pending_review",
        evidence: {
          sourceLabel: "Public Record",
          sourceName,
          sourceUrl: entity.sourceUrl,
          confidenceScore: entity.raw.confidenceScore,
          reviewStatus: entity.raw.reviewStatus,
          reviewFlags: entity.raw.reviewFlags
        }
      }));
    return result;
  }

  const hubTitle = titleFromHtml(hubHtml, sourceUrl);
  const hubClassification = classifyPublicLink(sourceUrl, hubTitle);
  const hubEntityId = recordId("source", sourceUrl);
  result.entities.push({
    id: hubEntityId,
    type: hubClassification.entityType,
    sourceUrl,
    sourceRef: hubClassification.sourceType,
    fields: publicFields({ title: hubTitle, url: sourceUrl, fetchedAt, parser, sourceName, sourceType: hubClassification.sourceType, confidence: hubClassification.confidence }),
    raw: {
      sourceLevel: typeof source === "string" ? "unknown" : source.source_level,
      sourceType: hubClassification.sourceType,
      confidence: hubClassification.confidence,
      reviewStatus: "pending_review",
      sourceLabel: "Public Record",
      sourceName,
      publisherOrganization: publisherOrg,
      refreshTier: refreshTierForSource(typeof source === "string" ? { source_type: hubClassification.sourceType } : source),
      schedulerNote: sourceSchedulerNote(typeof source === "string" ? { source_type: hubClassification.sourceType } : source),
      sourceUrl,
      importedAt: fetchedAt
    }
  });

  const discovered = extractLinks(hubHtml, sourceUrl)
    .map((link) => ({ ...link, ...classifyPublicLink(link.url, link.title) }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 120);
  result.discoveredLinks = discovered;

  const selected = discovered.filter((link) => link.confidence >= 0.66).slice(0, maxFollow);
  for (const link of selected) {
    let pageTitle = link.title;
    let fetchedPage = false;
    try {
      const html = await fetchText(link.url);
      pageTitle = titleFromHtml(html, link.url) || link.title;
      fetchedPage = true;
    } catch {
      fetchedPage = false;
    }
    const entityId = recordId("public", link.url);
    result.entities.push({
      id: entityId,
      type: link.entityType,
      sourceUrl: link.url,
      sourceRef: link.sourceType,
      fields: publicFields({ title: pageTitle, url: link.url, fetchedAt, parser, sourceName, sourceType: link.sourceType, confidence: link.confidence }),
      raw: {
        sourceLabel: "Public Record",
        sourceName,
        publisherOrganization: publisherOrg,
        sourceUrl: link.url,
        importedAt: fetchedAt,
        confidenceScore: link.confidence,
        reviewStatus: link.confidence >= 0.92 ? "ready_for_review" : "pending_review",
        sourceType: link.sourceType,
        fetchedPage,
        evidence: link.evidence
      }
    });
  }

  result.reviewQueue = result.entities
    .filter((entity) => Number(entity.raw.confidenceScore ?? entity.raw.confidence ?? 0) < 0.92)
    .map((entity) => ({
      id: `review-${entity.id}`,
      importedEntityId: entity.id,
      reason: "Public source discovery requires admin review before merge or verification.",
      priority: Number(entity.raw.confidenceScore ?? entity.raw.confidence ?? 0) < 0.7 ? "high" : "medium",
      decision: "pending_review",
      evidence: {
        sourceLabel: "Public Record",
        sourceName,
        sourceUrl: entity.sourceUrl,
        confidenceScore: entity.raw.confidenceScore ?? entity.raw.confidence,
        reviewStatus: entity.raw.reviewStatus
      }
    }));

  return result;
}

export async function writeDeepImportResult(result) {
  await mkdir(dirname(resolve(importsDir, "placeholder")), { recursive: true });
  const path = resolve(importsDir, `${result.runId}.json`);
  await writeFile(path, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return path;
}
