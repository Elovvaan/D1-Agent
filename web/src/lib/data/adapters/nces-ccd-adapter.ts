import type { CanonicalProposal, DetectionResult, ExtractionContext, ExtractionResult, FieldValue, RawInput, SourceAdapter } from "./types";

const requiredHeaders = ["ncessch", "school_name", "state", "city"];

function bodyText(input: RawInput) {
  return typeof input.body === "string" ? input.body : input.body.toString("utf8");
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { headers: [] as string[], rows: [] as Record<string, string>[] };
  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  return { headers, rows };
}

function getField(row: Record<string, string>, names: string[]) {
  for (const name of names) {
    const key = normalizeHeader(name);
    const value = row[key];
    if (value) return value.trim();
  }
  return "";
}

function field<T>(value: T | null, confidence: number, evidence: string): FieldValue<T> {
  return { value, status: value === null || value === "" ? "unresolved" : "extracted", confidence, evidence };
}

function stableId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unresolved";
}

export class NcesCcdAdapter implements SourceAdapter {
  readonly adapterId = "nces.ccd.v1";
  readonly sourceId = "nces-ccd";
  readonly version = "1.0.0";

  detect(input: RawInput): DetectionResult {
    if (input.medium !== "csv") {
      return { handled: false, fingerprint: { sourceId: this.sourceId, evidence: ["input medium is not csv"] }, confidence: 0 };
    }
    const { headers } = parseCsv(bodyText(input));
    const headerSet = new Set(headers);
    const hits = requiredHeaders.filter((header) => headerSet.has(header)).length;
    const hasNcesLikeId = headers.some((header) => ["ncessch", "leaid", "school_id"].includes(header));
    const confidence = Math.min(1, hits / requiredHeaders.length + (hasNcesLikeId ? 0.15 : 0));
    return {
      handled: confidence >= 0.9,
      pageType: "ccd-directory-file",
      fingerprint: { sourceId: this.sourceId, evidence: [`${hits}/${requiredHeaders.length} required headers matched`, hasNcesLikeId ? "NCES-style identifier present" : "NCES-style identifier missing"] },
      confidence
    };
  }

  extract(input: RawInput, ctx: ExtractionContext): ExtractionResult {
    const detected = this.detect(input);
    const extractedAt = ctx.extractedAt ?? new Date().toISOString();
    if (!detected.handled) {
      return {
        proposals: [],
        envelope: {
          sourceId: this.sourceId,
          adapterId: this.adapterId,
          adapterVersion: this.version,
          uri: input.uri,
          fetchedAt: input.fetchedAt,
          extractedAt,
          rawArchiveRef: ctx.rawArchiveRef,
          pageType: "unclassified",
          sourceTier: "T0-canonical",
          licenseClass: "public-domain"
        },
        diagnostics: [{ level: "warning", message: "NCES CCD adapter did not pass detection gate." }]
      };
    }

    const { rows } = parseCsv(bodyText(input));
    const proposals: CanonicalProposal[] = rows.map((row, index) => {
      const ncesId = getField(row, ["ncessch", "nces_school_id", "school_id"]);
      const name = getField(row, ["school_name", "sch_name", "name"]);
      const city = getField(row, ["city", "lcity"]);
      const state = getField(row, ["state", "state_abbr", "st"]);
      const districtId = getField(row, ["leaid", "district_id"]);
      const districtName = getField(row, ["lea_name", "district_name"]);
      const proposalId = `nces-school-${stableId(ncesId || `${name}-${city}-${state}`)}`;
      const identityConfidence = ncesId && name && state ? 0.99 : name && city && state ? 0.86 : 0.7;
      return {
        proposalId,
        kind: "SchoolProposal",
        fields: {
          ncesId: field(ncesId || null, ncesId ? 0.99 : 0, `row:${index + 2}:ncessch`),
          name: field(name || null, name ? 0.97 : 0, `row:${index + 2}:school_name`),
          city: field(city || null, city ? 0.94 : 0, `row:${index + 2}:city`),
          state: field(state || null, state ? 0.98 : 0, `row:${index + 2}:state`),
          districtId: field(districtId || null, districtId ? 0.94 : 0, `row:${index + 2}:leaid`),
          districtName: field(districtName || null, districtName ? 0.9 : 0, `row:${index + 2}:lea_name`)
        },
        identityHints: [
          ...(ncesId ? [{ type: "nces-id" as const, value: ncesId, confidence: 0.99 }] : []),
          ...(name && city && state ? [{ type: "name-city-state" as const, value: `${name}|${city}|${state}`, confidence: 0.88 }] : []),
          ...(name && state ? [{ type: "name-state" as const, value: `${name}|${state}`, confidence: 0.8 }] : [])
        ],
        confidence: identityConfidence
      };
    });

    return {
      proposals,
      envelope: {
        sourceId: this.sourceId,
        adapterId: this.adapterId,
        adapterVersion: this.version,
        uri: input.uri,
        fetchedAt: input.fetchedAt,
        extractedAt,
        rawArchiveRef: ctx.rawArchiveRef,
        pageType: "ccd-directory-file",
        sourceTier: "T0-canonical",
        licenseClass: "public-domain"
      },
      diagnostics: [{ level: "info", message: "NCES CCD extraction completed.", count: proposals.length }]
    };
  }
}

export const ncesCcdAdapter = new NcesCcdAdapter();
