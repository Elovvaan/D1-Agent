function stripTags(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function cellsFromRow(rowHtml) {
  return [...String(rowHtml).matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => ({ html: match[1], text: stripTags(match[1]) }));
}

function canonicalHeader(text) {
  const t = String(text ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["#", "no", "no.", "num", "number", "jersey"].includes(t)) return "jersey";
  if (["name", "player", "athlete"].includes(t)) return "name";
  if (["pos", "pos.", "position"].includes(t)) return "position";
  if (["yr", "year", "class", "cl", "grade", "eligibility", "exp"].includes(t) || /\bclass\b|\byear\b|\bgrade\b/.test(t)) return "class_year";
  if (["ht", "ht.", "height"].includes(t)) return "height";
  if (["wt", "wt.", "weight"].includes(t)) return "weight";
  if (["hometown", "home town", "city", "from", "hometown/high school", "hometown / previous school"].includes(t) || /home\s*town/.test(t)) return "hometown";
  return null;
}

function mapColumns(headerCells) {
  const map = {};
  headerCells.forEach((header, index) => {
    const canonical = canonicalHeader(header);
    if (canonical && !(canonical in map)) map[canonical] = index;
  });
  return map;
}

export function parseHeightInches(raw) {
  const match = String(raw ?? "").trim().match(/(\d)\s*(?:'|ft|-|\s)\s*(\d{1,2})?/);
  if (!match) return undefined;
  const feet = Number(match[1]);
  const inches = match[2] ? Number(match[2]) : 0;
  return Number.isNaN(feet) || inches > 11 ? undefined : feet * 12 + inches;
}

export function parseWeightLb(raw) {
  const match = String(raw ?? "").trim().match(/(\d{2,3})/);
  if (!match) return undefined;
  const weight = Number(match[1]);
  return weight >= 70 && weight <= 400 ? weight : undefined;
}

export function readMetaFacets(html) {
  const candidates = [
    ...String(html).matchAll(/<script[^>]+type=["']application\/json["'][^>]*(?:data-meta-targeting|id=["']meta-targeting["'])[^>]*>([\s\S]*?)<\/script>/gi),
    ...String(html).matchAll(/<meta\b[^>]*content=["']([^"']*pagetype[^"']*)["'][^>]*>/gi)
  ].map((match) => stripTags(match[1]).replace(/&quot;/g, "\""));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore non-JSON metadata.
    }
  }
  return {};
}

export function parseRosterPage({ html, hints = {} }) {
  const facets = readMetaFacets(html);
  const warnings = [];
  const level = hints.level ?? "unknown";
  if (level === "unknown") warnings.push("level_unresolved");
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  let chosen = null;
  for (const table of tables) {
    const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
    if (rows.length < 2) continue;
    const headers = cellsFromRow(rows[0]).map((cell) => cell.text);
    const columns = mapColumns(headers);
    if (columns.name === undefined) continue;
    chosen = { columns, rows: rows.slice(1) };
    break;
  }
  if (!chosen) return { ok: false, level, rows: [], warnings: [...warnings, "no_roster_table_found"], facets, ...hints };

  const rows = [];
  for (const [index, row] of chosen.rows.entries()) {
    const cells = cellsFromRow(row);
    if (!cells.length) continue;
    const at = (key) => {
      const cellIndex = chosen.columns[key];
      return cellIndex === undefined ? undefined : cells[cellIndex]?.text;
    };
    const name = at("name");
    if (!name) continue;
    const nameCellHtml = cells[chosen.columns.name]?.html ?? "";
    const href = nameCellHtml.match(/<a[^>]+href=["']([^"']+)["']/i)?.[1];
    rows.push({
      index,
      jersey_raw: at("jersey"),
      name_raw: name,
      position_raw: at("position"),
      class_year_raw: at("class_year"),
      height_raw: at("height"),
      weight_raw: at("weight"),
      hometown_raw: at("hometown"),
      player_url: href
    });
  }
  if (chosen.columns.class_year === undefined) warnings.push("no_class_column_progression_unavailable");
  if (!rows.length) warnings.push("table_found_but_no_player_rows");
  return { ok: rows.length > 0, level, rows, warnings, facets, ...hints };
}
