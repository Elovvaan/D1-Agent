import { getNcesSeedSchoolResults } from "./nces-seed";
import { getOperationsIntakeDirectoryResults, searchOperationsIntakeDirectory } from "./public-intake-search";
import { searchPublicDirectory, type PublicDirectoryResult } from "./services";
import { decodeHtmlEntities } from "@/lib/text";

export type OrgNodeKind = "Country" | "State" | "School" | "Team" | "Person" | "AthleteRole" | "CoachRole" | "Game" | "Season";
export type OrgEdgeKind = "CONTAINS" | "ACTIVE_IN" | "PLAYS_FOR" | "COACHES" | "PARTICIPATED_IN";
export type ReviewState = "resolved" | "pending_review";
export type OrgNode = { id: string; kind: OrgNodeKind; label: string; detail: string; href: string; reviewState: ReviewState; projectionSafe: boolean; sourceTypeLabel?: string; stateCode?: string; raw?: PublicDirectoryResult };
export type OrgEdge = { id: string; kind: OrgEdgeKind; from: string; to: string; seasonId?: string; reviewState: ReviewState };
export type OrganizationGraph = { nodes: OrgNode[]; edges: OrgEdge[] };
export type NavigationTeamNode = { id: string; title: string; detail: string; href: string; athletes: PublicDirectoryResult[]; coaches: PublicDirectoryResult[]; games: PublicDirectoryResult[] };
export type NavigationSchoolNode = { id: string; title: string; detail: string; href: string; teams: NavigationTeamNode[]; athletes: PublicDirectoryResult[]; coaches: PublicDirectoryResult[]; games: PublicDirectoryResult[] };
export type NavigationStateNode = { id: string; code: string; name: string; href: string; schools: NavigationSchoolNode[] };

const stateNames: Record<string, string> = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia" };
function normalizeState(value?: string) { return value?.match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/)?.[1] ?? "US"; }
function isSafe(node: OrgNode | undefined, kind?: OrgNodeKind): node is OrgNode { return !!node && (!kind || node.kind === kind) && node.reviewState === "resolved" && node.projectionSafe; }
function mentions(result: PublicDirectoryResult, node: { label: string; id: string }) { const text = `${result.title} ${result.detail} ${result.href}`.toLowerCase(); return text.includes(node.label.toLowerCase()) || text.includes(node.id.toLowerCase()); }
function resultToNode(result: PublicDirectoryResult, kind: OrgNodeKind, extra: Partial<OrgNode> = {}): OrgNode { return { id: `${kind.toLowerCase()}-${result.id}`, kind, label: decodeHtmlEntities(result.title), detail: decodeHtmlEntities(result.detail), href: result.href, reviewState: "resolved", projectionSafe: true, sourceTypeLabel: result.typeLabel, raw: result, ...extra }; }
function allResults() { const base = ["", "school", "team", "athlete", "coach", "game"].flatMap((query) => searchPublicDirectory(query).flatMap((group) => group.results)); const intake = getOperationsIntakeDirectoryResults(); const seeded = getNcesSeedSchoolResults(); const unique = new Map<string, PublicDirectoryResult>(); for (const item of [...seeded, ...base, ...intake]) unique.set(`${item.group}-${item.id}-${item.href}-${item.sourceUrl ?? ""}`, item); return [...unique.values()]; }

export function getOrganizationGraph(): OrganizationGraph {
  const results = allResults();
  const nodes: OrgNode[] = [{ id: "country-us", kind: "Country", label: "United States", detail: "National MyD1 directory", href: "/schools", reviewState: "resolved", projectionSafe: true }];
  const edges: OrgEdge[] = [];
  const stateIds = new Map<string, string>();
  const schools = new Map<string, OrgNode>();
  const ensureState = (code: string) => { const id = `state-${code.toLowerCase()}`; if (!stateIds.has(code)) { stateIds.set(code, id); nodes.push({ id, kind: "State", label: stateNames[code] ?? (code === "US" ? "National / Unsorted" : code), detail: `${code} state directory`, href: `/schools/${code === "US" ? "national" : code.toLowerCase()}`, reviewState: "resolved", projectionSafe: true, stateCode: code }); edges.push({ id: `country-us-contains-${id}`, kind: "CONTAINS", from: "country-us", to: id, reviewState: "resolved" }); } return id; };

  for (const item of results.filter((result) => result.group === "Schools")) { const code = normalizeState(`${item.title} ${item.detail}`); const stateId = ensureState(code); const school = resultToNode(item, "School", { stateCode: code }); nodes.push(school); edges.push({ id: `${stateId}-contains-${school.id}`, kind: "CONTAINS", from: stateId, to: school.id, reviewState: "resolved" }); schools.set(school.label.toLowerCase(), school); schools.set(item.id, school); }

  const teamNodes: OrgNode[] = [];
  for (const item of results.filter((result) => result.group === "Teams")) { const school = [...schools.values()].find((candidate) => mentions(item, candidate)); if (!school) continue; const team = resultToNode(item, "Team", { stateCode: school.stateCode }); nodes.push(team); teamNodes.push(team); edges.push({ id: `${school.id}-active-${team.id}`, kind: "ACTIVE_IN", from: school.id, to: team.id, seasonId: "current", reviewState: "resolved" }); }

  for (const item of results.filter((result) => result.group === "Athletes" || result.group === "Coaches")) { const isAthlete = item.group === "Athletes"; const team = teamNodes.find((candidate) => mentions(item, candidate)); const school = team ? undefined : [...schools.values()].find((candidate) => mentions(item, candidate)); if (!team && !school) continue; const person = resultToNode(item, "Person", { stateCode: team?.stateCode ?? school?.stateCode }); const role = resultToNode(item, isAthlete ? "AthleteRole" : "CoachRole", { id: `${isAthlete ? "athlete" : "coach"}-role-${item.id}`, stateCode: person.stateCode }); nodes.push(person, role); edges.push({ id: `${person.id}-active-${role.id}`, kind: "ACTIVE_IN", from: person.id, to: role.id, seasonId: "current", reviewState: "resolved" }); edges.push({ id: `${role.id}-${isAthlete ? "plays-for" : "coaches"}-${team?.id ?? school?.id}`, kind: isAthlete ? "PLAYS_FOR" : "COACHES", from: role.id, to: team?.id ?? school!.id, seasonId: "current", reviewState: "resolved" }); }

  for (const item of results.filter((result) => result.group === "Games")) { const game = resultToNode(item, "Game"); const teams = teamNodes.filter((team) => mentions(item, team)).slice(0, 2); if (teams.length !== 2) continue; nodes.push(game); for (const team of teams) edges.push({ id: `${team.id}-participated-${game.id}`, kind: "PARTICIPATED_IN", from: team.id, to: game.id, seasonId: "current", reviewState: "resolved" }); }
  return { nodes, edges };
}

export function getNavigationGraph(): NavigationStateNode[] {
  const graph = getOrganizationGraph();
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const childNodes = (id: string, edgeKind: OrgEdgeKind, kind?: OrgNodeKind) => graph.edges.filter((edge) => edge.from === id && edge.kind === edgeKind).map((edge) => byId.get(edge.to)).filter((node): node is OrgNode => isSafe(node, kind));
  const incoming = (id: string, edgeKind: OrgEdgeKind, kind: OrgNodeKind) => graph.edges.filter((edge) => edge.to === id && edge.kind === edgeKind).map((edge) => byId.get(edge.from)).filter((node): node is OrgNode => isSafe(node, kind));
  const toResult = (node: OrgNode): PublicDirectoryResult => node.raw ?? { id: node.id, title: node.label, detail: node.detail, href: node.href, group: node.kind === "Game" ? "Games" : node.kind === "CoachRole" ? "Coaches" : node.kind === "AthleteRole" ? "Athletes" : "Organizations", typeLabel: node.sourceTypeLabel ?? node.kind, sourceLabel: "Public Record" };
  return childNodes("country-us", "CONTAINS", "State").map((state) => ({ id: state.id, code: state.stateCode ?? "US", name: state.label, href: state.href, schools: childNodes(state.id, "CONTAINS", "School").map((school) => ({ id: school.raw?.id ?? school.id, title: school.label, detail: school.detail, href: school.href, teams: childNodes(school.id, "ACTIVE_IN", "Team").map((team) => ({ id: team.raw?.id ?? team.id, title: team.label, detail: team.detail, href: team.href, athletes: incoming(team.id, "PLAYS_FOR", "AthleteRole").map(toResult), coaches: incoming(team.id, "COACHES", "CoachRole").map(toResult), games: childNodes(team.id, "PARTICIPATED_IN", "Game").map(toResult) })), athletes: incoming(school.id, "PLAYS_FOR", "AthleteRole").map(toResult), coaches: incoming(school.id, "COACHES", "CoachRole").map(toResult), games: [] })) })).filter((state) => state.schools.length > 0).sort((a, b) => a.name.localeCompare(b.name));
}

export function searchNavigation(query: string) { return searchOperationsIntakeDirectory(query); }
