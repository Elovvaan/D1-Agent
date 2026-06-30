import { classifySourcePage } from "../classifiers/page-classifier.mjs";
import { extractDiscoveryLinks, absoluteUrl } from "../discovery/link-discovery.mjs";
import { normalizeRankingRecord } from "../normalizers/ranking-normalizer.mjs";

function cleanText(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function canonicalUrl(context) {
  return context.html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ?? context.url;
}

function tableBlocks(html) {
  return [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((match) => match[0]);
}

function cellsFromRow(rowHtml) {
  return [...rowHtml.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((match) => ({
    html: match[1],
    text: cleanText(match[1])
  }));
}

function headerCells(tableHtml) {
  const theadRow = tableHtml.match(/<thead\b[\s\S]*?<tr\b[^>]*>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/i)?.[1];
  const firstRow = tableHtml.match(/<tr\b[^>]*>([\s\S]*?)<\/tr>/i)?.[1];
  return cellsFromRow(theadRow ?? firstRow ?? "").map((cell) => cell.text);
}

function findRankingTable(html) {
  return tableBlocks(html).find((table) => {
    const headers = headerCells(table).map((header) => header.toLowerCase());
    const hasTeam = headers.some((header) => /team/.test(header));
    const hasRank = headers.some((header) => /^#$/.test(header) || /rank/.test(header));
    const hasRecord = headers.some((header) => /ovr|overall|record|w-?l/.test(header));
    return hasTeam && (hasRank || hasRecord);
  }) ?? null;
}

function mapColumns(headers) {
  const find = (regex) => {
    const index = headers.findIndex((header) => regex.test(header));
    return index === -1 ? undefined : index;
  };
  return {
    rank: find(/^#$|rank/),
    team: find(/team/),
    state: find(/state/),
    record: find(/ovr|overall|record/),
    movement: find(/\+\/-|move|movement|chg|change/)
  };
}

export function matches(context) {
  let score = 0;
  let host = "";
  try {
    host = new URL(context.url).host;
  } catch {
    // ignored
  }
  if (/(^|\.)maxpreps\.com$/.test(host)) score += 0.5;
  if (/image\.maxpreps\.io/.test(context.html)) score += 0.1;
  if (/name=["']targeting["']/.test(context.html) || /"pagetype"/.test(context.html)) score += 0.3;
  if (/\/[a-z]{2}\/[^/"']+\/[^/"']+\/[a-z0-9-]+\//.test(context.html)) score += 0.1;
  return Math.min(score, 1);
}

export function classify(context) {
  return classifySourcePage(context);
}

export function extractRows(context) {
  const table = findRankingTable(context.html);
  if (!table) return [];
  const headers = headerCells(table).map((header) => header.toLowerCase());
  const columns = mapColumns(headers);
  const body = table.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] ?? table;
  const rowHtml = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
  const rows = [];
  for (const row of rowHtml) {
    const cells = cellsFromRow(row);
    if (!cells.length) continue;
    const cellText = cells.map((cell) => cell.text);
    let teamName;
    let teamHref;
    if (columns.team != null && cells[columns.team]) {
      const teamCell = cells[columns.team];
      const anchor = teamCell.html.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      if (anchor) {
        teamHref = absoluteUrl(anchor[1], context.url);
        teamName = cleanText(anchor[2]);
      } else {
        teamName = teamCell.text;
      }
    }
    const pick = (index) => (index != null && index < cellText.length ? cellText[index] : undefined);
    rows.push({
      rank: pick(columns.rank),
      team_name: teamName,
      team_href: teamHref,
      state: pick(columns.state),
      record: pick(columns.record),
      movement: pick(columns.movement),
      cells: cellText
    });
  }
  return rows.filter((row) => row.team_name || row.rank);
}

function toIsoDate(value) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return undefined;
  const year = Number(match[3]) < 100 ? Number(match[3]) + 2000 : Number(match[3]);
  const date = new Date(Date.UTC(year, Number(match[1]) - 1, Number(match[2])));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

export function extractMethodology(context) {
  const text = cleanText(context.html);
  const minimumGames = text.match(/minimum games played:\s*(\d+)/i)?.[1];
  const lastUpdated = text.match(/last updated:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i)?.[1];
  return {
    min_games_played: minimumGames ? Number(minimumGames) : undefined,
    source_as_of: lastUpdated ? toIsoDate(lastUpdated) : undefined,
    notes: [],
    raw: {
      ...(minimumGames ? { minimum_games_played: minimumGames } : {}),
      ...(lastUpdated ? { last_updated: lastUpdated } : {})
    }
  };
}

export function parseRankingPage(context) {
  const classification = classify(context);
  const methodology = extractMethodology(context);
  const sourceUrl = canonicalUrl(context);
  const records = extractRows(context).map((row) =>
    normalizeRankingRecord(row, {
      classification,
      source_url: sourceUrl,
      imported_timestamp: context.fetchedAt,
      methodology
    })
  );
  return {
    classification,
    methodology,
    records,
    links: extractDiscoveryLinks(context.html, context.url)
  };
}

export const adapterMaxPreps = {
  id: "adapter_maxpreps",
  matches,
  classify,
  extractRows,
  extractLinks: (context) => extractDiscoveryLinks(context.html, context.url),
  extractMethodology,
  parseRankingPage
};
