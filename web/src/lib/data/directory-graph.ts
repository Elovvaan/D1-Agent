import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

type DirectoryEntityType = "school" | "team" | "organization" | "ranking" | "source" | "import_session" | "review_queue_item";
type ReviewStatus = "auto_linked" | "pending_review" | "setup_incomplete";

type ImportRun = {
  runId: string;
  sourceUrl: string;
  fetchedAt: string;
  sourceTitle?: string;
  sourceRegistry?: SourceRegistryEntry | null;
  publisherOrganization?: {
    org_type?: string;
    name?: string;
    short_name?: string;
    state?: string | null;
    source_url?: string;
    review_status?: string;
  };
  entities?: ImportedEntity[];
  reviewQueue?: Array<{ id: string; importedEntityId?: string; reason?: string; priority?: string; evidence?: Record<string, unknown> }>;
};

type ImportedEntity = {
  id: string;
  type: string;
  sourceUrl: string;
  sourceRef?: string;
  fields: Array<{ name: string; value: string; attribution?: { sourceUrl: string; fetchedAt: string; parser: string } }>;
  raw?: Record<string, unknown>;
};

type SourceRegistryEntry = {
  source_name: string;
  source_url: string;
  state: string;
  country: string;
  source_level: string;
  source_type: string;
  sports_supported: string[];
  notes?: string;
  enabled: boolean;
};

export type DirectoryGraphNode = {
  id: string;
  type: DirectoryEntityType;
  name: string;
  label: string;
  detail: string;
  sourceUrl?: string;
  sourceName?: string;
  importedAt?: string;
  reviewStatus: ReviewStatus;
  confidence: number;
  fields: Array<{ name: string; value: string; sourceUrl?: string; fetchedAt?: string; parser?: string }>;
  linked?: Array<{ type: DirectoryEntityType; id: string; label: string; name: string }>;
  raw?: Record<string, unknown>;
};

export type DirectoryGraphEdge = {
  fromType: DirectoryEntityType;
  fromId: string;
  toType: DirectoryEntityType;
  toId: string;
  relation: string;
  confidence: number;
  reviewStatus: ReviewStatus;
};

export type DirectoryGraph = {
  nodes: DirectoryGraphNode[];
  edges: DirectoryGraphEdge[];
  sports: string[];
  seasons: string[];
  affiliations: DirectoryGraphEdge[];
};

const importsDir = resolve(process.cwd(), "..", "data", "imports");
const sourceRegistryPath = resolve(process.cwd(), "..", "data", "sources", "public-sources.json");

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function readImportRuns(): ImportRun[] {
  try {
    if (!existsSync(importsDir)) return [];
    return readdirSync(importsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(readFileSync(join(importsDir, file), "utf8")) as ImportRun)
      .sort((a, b) => Date.parse(b.fetchedAt) - Date.parse(a.fetchedAt));
  } catch {
    return [];
  }
}

function readSourceRegistry(): SourceRegistryEntry[] {
  try {
    if (!existsSync(sourceRegistryPath)) return [];
    return JSON.parse(readFileSync(sourceRegistryPath, "utf8")) as SourceRegistryEntry[];
  } catch {
    return [];
  }
}

function field(entity: ImportedEntity, name: string) {
  return entity.fields.find((item) => item.name === name)?.value;
}

function confidence(entity: ImportedEntity) {
  return Number(field(entity, "confidenceScore") ?? entity.raw?.confidenceScore ?? entity.raw?.confidence ?? 0);
}

export function parseMaxPrepsTeamUrl(href: string) {
  try {
    const parts = new URL(href).pathname.split("/").filter(Boolean);
    if (parts.length < 4 || !/^[a-z]{2}$/i.test(parts[0])) return null;
    const schoolMascotSlug = parts[2];
    const slugParts = schoolMascotSlug.split("-").filter(Boolean);
    const mascot = slugParts.length > 1 ? slugParts[slugParts.length - 1] : undefined;
    const schoolSlug = mascot ? slugParts.slice(0, -1).join("-") : schoolMascotSlug;
    return {
      state: parts[0].toUpperCase(),
      city: parts[1],
      schoolSlug,
      mascot,
      schoolMascotSlug,
      sport: parts[3]
    };
  } catch {
    return null;
  }
}

export function resolveOrg(run: ImportRun): DirectoryGraphNode {
  const sourceName = run.publisherOrganization?.name ?? run.sourceTitle ?? new URL(run.sourceUrl).hostname.replace(/^www\./, "");
  const orgType = run.publisherOrganization?.org_type ?? (run.sourceRegistry?.source_type?.includes("association") ? "STATE_ASSOCIATION" : "PUBLISHER");
  const sourceUrl = run.publisherOrganization?.source_url ?? run.sourceUrl;
  return {
    id: `org-${slug(sourceName)}`,
    type: "organization",
    name: sourceName,
    label: orgType.replaceAll("_", " "),
    detail: `${run.publisherOrganization?.state ?? run.sourceRegistry?.state ?? "National"} publisher organization`,
    sourceUrl,
    sourceName,
    importedAt: run.fetchedAt,
    reviewStatus: "auto_linked",
    confidence: 0.9,
    fields: [
      { name: "name", value: sourceName, sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" },
      { name: "org_type", value: orgType, sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" },
      { name: "source_url", value: sourceUrl, sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" }
    ]
  };
}

export function resolveSchool(entity: ImportedEntity): DirectoryGraphNode | null {
  const teamUrl = field(entity, "profileUrl") ?? entity.sourceUrl;
  const parsed = parseMaxPrepsTeamUrl(teamUrl);
  const teamName = field(entity, "teamName") ?? field(entity, "name") ?? "";
  if (!parsed) {
    if (!teamName) return null;
    return {
      id: `school-unresolved-${slug(teamName)}`,
      type: "school",
      name: teamName,
      label: "School",
      detail: "School identity requires review because no strong team URL was available.",
      sourceUrl: entity.sourceUrl,
      sourceName: field(entity, "sourceName"),
      importedAt: field(entity, "importedAt"),
      reviewStatus: "pending_review",
      confidence: 0.45,
      fields: entity.fields.map((item) => ({ name: item.name, value: item.value, sourceUrl: item.attribution?.sourceUrl, fetchedAt: item.attribution?.fetchedAt, parser: item.attribution?.parser }))
    };
  }
  const schoolName = teamName || parsed.schoolSlug.replaceAll("-", " ");
  return {
    id: `school-${slug(parsed.state)}-${slug(parsed.city)}-${slug(parsed.schoolSlug)}`,
    type: "school",
    name: schoolName,
    label: "School",
    detail: `${parsed.city.replaceAll("-", " ")}, ${parsed.state}${parsed.mascot ? ` - ${parsed.mascot}` : ""}`,
    sourceUrl: teamUrl,
    sourceName: field(entity, "sourceName"),
    importedAt: field(entity, "importedAt"),
    reviewStatus: confidence(entity) >= 0.85 ? "auto_linked" : "pending_review",
    confidence: Math.max(0.85, confidence(entity)),
    fields: [
      { name: "name", value: schoolName, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      { name: "state", value: parsed.state, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      { name: "city", value: parsed.city, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      { name: "school_slug", value: parsed.schoolSlug, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      ...(parsed.mascot ? [{ name: "mascot", value: parsed.mascot, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" }] : [])
    ]
  };
}

export function resolveTeam(entity: ImportedEntity): DirectoryGraphNode | null {
  const teamUrl = field(entity, "profileUrl") ?? entity.sourceUrl;
  const parsed = parseMaxPrepsTeamUrl(teamUrl);
  const teamName = field(entity, "teamName") ?? field(entity, "name") ?? "";
  const sport = field(entity, "sport") ?? parsed?.sport;
  if (!parsed || !sport) return null;
  return {
    id: `team-${slug(parsed.state)}-${slug(parsed.city)}-${slug(parsed.schoolMascotSlug)}-${slug(sport)}`,
    type: "team",
    name: `${teamName || parsed.schoolSlug.replaceAll("-", " ")} ${sport}`,
    label: "Team",
    detail: `${sport} - ${parsed.city.replaceAll("-", " ")}, ${parsed.state}`,
    sourceUrl: teamUrl,
    sourceName: field(entity, "sourceName"),
    importedAt: field(entity, "importedAt"),
    reviewStatus: confidence(entity) >= 0.85 ? "auto_linked" : "pending_review",
    confidence: Math.max(0.85, confidence(entity)),
    fields: [
      { name: "team_name", value: teamName || parsed.schoolSlug, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      { name: "sport", value: sport, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" },
      { name: "team_url", value: teamUrl, sourceUrl: teamUrl, fetchedAt: field(entity, "importedAt"), parser: "directory-graph-resolver" }
    ]
  };
}

function resolveRanking(entity: ImportedEntity): DirectoryGraphNode | null {
  if (entity.type !== "stat" || entity.sourceRef !== "ranking_record") return null;
  const name = field(entity, "name") ?? `${field(entity, "teamName") ?? "Ranking"} #${field(entity, "statValue") ?? ""}`.trim();
  return {
    id: entity.id,
    type: "ranking",
    name,
    label: "Ranking",
    detail: `${field(entity, "statContext") ?? ""} ${field(entity, "season") ?? ""}`.trim() || "Public ranking record",
    sourceUrl: entity.sourceUrl,
    sourceName: field(entity, "sourceName"),
    importedAt: field(entity, "importedAt"),
    reviewStatus: field(entity, "reviewStatus") === "auto_commit_ready" ? "auto_linked" : "pending_review",
    confidence: confidence(entity),
    fields: entity.fields.map((item) => ({ name: item.name, value: item.value, sourceUrl: item.attribution?.sourceUrl, fetchedAt: item.attribution?.fetchedAt, parser: item.attribution?.parser })),
    raw: entity.raw
  };
}

function sourceNode(source: SourceRegistryEntry): DirectoryGraphNode {
  const id = `source-${slug(source.source_name)}`;
  return {
    id,
    type: "source",
    name: source.source_name,
    label: "Source",
    detail: `${source.source_level} - ${source.source_type.replaceAll("_", " ")} - ${source.state}, ${source.country}`,
    sourceUrl: source.source_url,
    sourceName: source.source_name,
    reviewStatus: "auto_linked",
    confidence: 1,
    fields: [
      { name: "source_name", value: source.source_name, sourceUrl: source.source_url, parser: "source-registry" },
      { name: "source_url", value: source.source_url, sourceUrl: source.source_url, parser: "source-registry" },
      { name: "source_level", value: source.source_level, sourceUrl: source.source_url, parser: "source-registry" },
      { name: "source_type", value: source.source_type, sourceUrl: source.source_url, parser: "source-registry" },
      { name: "state", value: source.state, sourceUrl: source.source_url, parser: "source-registry" }
    ]
  };
}

function importSessionNode(run: ImportRun): DirectoryGraphNode {
  return {
    id: run.runId,
    type: "import_session",
    name: run.sourceTitle ?? run.runId,
    label: "Import Session",
    detail: `${run.entities?.length ?? 0} records imported - ${run.reviewQueue?.length ?? 0} requiring review`,
    sourceUrl: run.sourceUrl,
    sourceName: run.sourceTitle,
    importedAt: run.fetchedAt,
    reviewStatus: (run.reviewQueue?.length ?? 0) > 0 ? "pending_review" : "auto_linked",
    confidence: 1,
    fields: [
      { name: "run_id", value: run.runId, sourceUrl: run.sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" },
      { name: "records_imported", value: String(run.entities?.length ?? 0), sourceUrl: run.sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" },
      { name: "review_count", value: String(run.reviewQueue?.length ?? 0), sourceUrl: run.sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" }
    ]
  };
}

function reviewNode(run: ImportRun, review: NonNullable<ImportRun["reviewQueue"]>[number]): DirectoryGraphNode {
  return {
    id: review.id,
    type: "review_queue_item",
    name: review.reason ?? "Review queue item",
    label: "Review Queue Item",
    detail: `${review.priority ?? "medium"} priority - ${review.importedEntityId ?? "unlinked record"}`,
    sourceUrl: run.sourceUrl,
    sourceName: run.sourceTitle,
    importedAt: run.fetchedAt,
    reviewStatus: "pending_review",
    confidence: 0,
    fields: [
      { name: "reason", value: review.reason ?? "Review required", sourceUrl: run.sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" },
      { name: "priority", value: review.priority ?? "medium", sourceUrl: run.sourceUrl, fetchedAt: run.fetchedAt, parser: "directory-graph-resolver" }
    ],
    raw: review.evidence
  };
}

export function createAffiliationEdges(nodes: DirectoryGraphNode[], runs: ImportRun[]): DirectoryGraphEdge[] {
  const edges: DirectoryGraphEdge[] = [];
  const nodeExists = (type: DirectoryEntityType, id: string) => nodes.some((node) => node.type === type && node.id === id);
  for (const run of runs) {
    const org = resolveOrg(run);
    const sourceId = `source-${slug(run.sourceRegistry?.source_name ?? run.sourceTitle ?? org.name)}`;
    if (nodeExists("organization", org.id) && nodeExists("source", sourceId)) {
      edges.push({ fromType: "organization", fromId: org.id, toType: "source", toId: sourceId, relation: "publishes_source", confidence: 0.9, reviewStatus: "auto_linked" });
    }
    if (nodeExists("source", sourceId) && nodeExists("import_session", run.runId)) {
      edges.push({ fromType: "source", fromId: sourceId, toType: "import_session", toId: run.runId, relation: "has_import_session", confidence: 1, reviewStatus: "auto_linked" });
    }
    for (const review of run.reviewQueue ?? []) {
      edges.push({ fromType: "import_session", fromId: run.runId, toType: "review_queue_item", toId: review.id, relation: "has_review_item", confidence: 1, reviewStatus: "pending_review" });
    }
    for (const entity of run.entities ?? []) {
      const ranking = resolveRanking(entity);
      const team = resolveTeam(entity);
      const school = resolveSchool(entity);
      if (ranking && team) edges.push({ fromType: "ranking", fromId: ranking.id, toType: "team", toId: team.id, relation: "ranks_team", confidence: ranking.confidence, reviewStatus: ranking.reviewStatus });
      if (team && school) edges.push({ fromType: "team", fromId: team.id, toType: "school", toId: school.id, relation: "belongs_to_school", confidence: team.confidence, reviewStatus: team.reviewStatus });
      if (school && nodeExists("organization", org.id)) edges.push({ fromType: "school", fromId: school.id, toType: "organization", toId: org.id, relation: "covered_by_publisher", confidence: school.confidence, reviewStatus: school.reviewStatus });
      if (ranking) edges.push({ fromType: "import_session", fromId: run.runId, toType: "ranking", toId: ranking.id, relation: "imported_ranking", confidence: ranking.confidence, reviewStatus: ranking.reviewStatus });
    }
  }
  return edges;
}

export function getDirectoryGraph(): DirectoryGraph {
  const nodes = new Map<string, DirectoryGraphNode>();
  const addNode = (node: DirectoryGraphNode | null) => {
    if (!node) return;
    const key = `${node.type}:${node.id}`;
    const existing = nodes.get(key);
    if (!existing || node.confidence > existing.confidence) nodes.set(key, node);
  };

  const runs = readImportRuns();
  const registry = readSourceRegistry().filter((source) => source.enabled);
  for (const source of registry) addNode(sourceNode(source));
  for (const run of runs) {
    addNode(resolveOrg(run));
    addNode(importSessionNode(run));
    for (const review of run.reviewQueue ?? []) addNode(reviewNode(run, review));
    for (const entity of run.entities ?? []) {
      addNode(resolveRanking(entity));
      addNode(resolveTeam(entity));
      addNode(resolveSchool(entity));
    }
  }

  const nodeList = [...nodes.values()];
  const edges = createAffiliationEdges(nodeList, runs);
  for (const node of nodeList) {
    node.linked = edges
      .filter((edge) => (edge.fromType === node.type && edge.fromId === node.id) || (edge.toType === node.type && edge.toId === node.id))
      .map((edge) => {
        const targetType = edge.fromType === node.type && edge.fromId === node.id ? edge.toType : edge.fromType;
        const targetId = edge.fromType === node.type && edge.fromId === node.id ? edge.toId : edge.fromId;
        const target = nodeList.find((item) => item.type === targetType && item.id === targetId);
        return target ? { type: target.type, id: target.id, label: edge.relation, name: target.name } : null;
      })
      .filter(Boolean) as DirectoryGraphNode["linked"];
  }

  const sports = new Set<string>();
  const seasons = new Set<string>();
  for (const node of nodeList) {
    const sport = node.fields.find((item) => item.name === "sport")?.value;
    const season = node.fields.find((item) => item.name === "season")?.value;
    if (sport) sports.add(sport);
    if (season) seasons.add(season);
  }

  return { nodes: nodeList, edges, sports: [...sports].sort(), seasons: [...seasons].sort(), affiliations: edges };
}

export function getDirectoryGraphNode(type: string, id: string) {
  const graph = getDirectoryGraph();
  const singular = type.replace(/s$/, "") as DirectoryEntityType;
  return graph.nodes.find((node) => node.id === id && (node.type === singular || node.type === type)) ?? null;
}
