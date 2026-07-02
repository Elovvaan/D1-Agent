import { getOperationsIntakeDirectoryResults, searchOperationsIntakeDirectory } from "./public-intake-search";
import { searchPublicDirectory, type PublicDirectoryResult } from "./services";

export type OrgNodeKind = "Country" | "State" | "School" | "Team" | "Person" | "AthleteRole" | "CoachRole" | "Game" | "Season";
export type OrgEdgeKind = "CONTAINS" | "LOCATED_IN" | "ACTIVE_IN" | "PLAYS_FOR" | "COACHES" | "PARTICIPATED_IN";
export type ReviewState = "resolved" | "pending_review";

export type OrgNode = {
  id: string;
  kind: OrgNodeKind;
  label: string;
  detail: string;
  href: string;
  reviewState: ReviewState;
  projectionSafe: boolean;
  sourceTypeLabel?: string;
  stateCode?: string;
  raw?: PublicDirectoryResult;
};

export type OrgEdge = {
  id: string;
  kind: OrgEdgeKind;
  from: string;
  to: string;
  seasonId?: string;
  reviewState: ReviewState;
};

export type OrganizationGraph = {
  nodes: OrgNode[];
  edges: OrgEdge[];
};

export type NavigationStateNode = {
  id: string;
  code: string;
  name: string;
  href: string;
  schools: NavigationSchoolNode[];
};

export type NavigationSchoolNode = {
  id: string;
  title: string;
  detail: string;
  href: string;
  teams: NavigationTeamNode[];
  athletes: PublicDirectoryResult[];
  coaches: PublicDirectoryResult[];
  games: PublicDirectoryResult[];
};

export type NavigationTeamNode = {
  id: string;
  title: string;
  detail: string;
  href: string;
  athletes: PublicDirectoryResult[];
  coaches: PublicDirectoryResult[];
  games: PublicDirectoryResult[];
};

const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
};

export function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeState(value?: string) {
  if (!value) return "US";
  const stateMatch = value.match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/);
  return stateMatch?.[1] ?? "US";
}

function publicResults() {
  const base = ["", "school", "team", "athlete", "coach", "game"].flatMap((query) => searchPublicDirectory(query).flatMap((group) => group.results));
  const intake = getOperationsIntakeDirectoryResults();
  const unique = new Map<string, PublicDirectoryResult>();
  for (const result of [...base, ...intake]) unique.set(`${result.group}-${result.id}-${result.href}-${result.sourceUrl ?? ""}`, result);
  return [...unique.values()];
}

function resultMentionsNode(result: PublicDirectoryResult, node: { title: string; id: string }) {
  const haystack = `${result.title} ${result.detail} ${result.href}`.toLowerCase();
  return haystack.includes(node.title.toLowerCase()) || haystack.includes(node.id.toLowerCase());
}

function makeNode(result: PublicDirectoryResult, kind: OrgNodeKind, extra: Partial<OrgNode> = {}): OrgNode {
  return {
    id: `${kind.toLowerCase()}-${result.id}`,
    kind,
    label: result.title,
    detail: result.detail,
    href: result.href,
    reviewState: "resolved",
    projectionSafe: true,
    sourceTypeLabel: result.typeLabel,
    raw: result,
    ...extra
  };
}

export function getOrganizationGraph(): OrganizationGraph {
  const results = publicResults();
  const schools = results.filter((result) => result.group === "Schools");
  const teams = results.filter((result) => result.group === "Teams");
  const athletes = results.filter((result) => result.group === "Athletes");
  const coaches = results.filter((result) => result.group === "Coaches");
  const games = results.filter((result) => result.group === "Games");

  const nodes: OrgNode[] = [{ id: "country-us", kind: "Country", label: "United States", detail: "National MyD1 directory", href: "/schools", reviewState: "resolved", projectionSafe: true }];
  const edges: OrgEdge[] = [];
  const stateNodeIds = new Map<string, string>();

  const ensureState = (code: string) => {
    const normalized = code === "US" ? "US" : code;
    const id = `state-${normalized.toLowerCase()}`;
    if (!stateNodeIds.has(normalized)) {
      stateNodeIds.set(normalized, id);
      nodes.push({ id, kind: "State", label: stateNames[normalized] ?? (normalized === "US" ? "National / Unsorted" : normalized), detail: `${normalized} state directory`, href: `/schools/${normalized === "US" ? "national" : normalized.toLowerCase()}`, reviewState: "resolved", projectionSafe: true, stateCode: normalized });
      edges.push({ id: `country-us-contains-${id}`, kind: "CONTAINS", from: "country-us", to: id, reviewState: "resolved" });
    }
    return id;
  };

  const schoolNodes = new Map<string, OrgNode>();
  for (const school of schools) {
    const code = normalizeState(`${school.title} ${school.detail}`);
    const stateId = ensureState(code);
    const schoolNode = makeNode(school, "School", { stateCode: code });
    nodes.push(schoolNode);
    edges.push({ id: `${stateId}-contains-${schoolNode.id}`, kind: "CONTAINS", from: stateId, to: schoolNode.id, reviewState: "resolved" });
    schoolNodes.set(school.title.toLowerCase(), schoolNode);
    schoolNodes.set(school.id, schoolNode);
  }

  const teamNodes: OrgNode[] = [];
  for (const team of teams) {
    const parentSchool = [...schoolNodes.values()].find((school) => resultMentionsNode(team, { title: school.label, id: school.id }));
    if (!parentSchool) continue;
    const teamNode = makeNode(team, "Team", { stateCode: parentSchool.stateCode });
    nodes.push(teamNode);
    teamNodes.push(teamNode);
    edges.push({ id: `${parentSchool.id}-active-${teamNode.id}`, kind: "ACTIVE_IN", from: parentSchool.id, to: teamNode.id, seasonId: "current", reviewState: "resolved" });
  }

  for (const athlete of athletes) {
    const parentTeam = teamNodes.find((team) => resultMentionsNode(athlete, { title: team.label, id: team.id }));
    const parentSchool = parentTeam ? undefined : [...schoolNodes.values()].find((school) => resultMentionsNode(athlete, { title: school.label, id: school.id }));
    if (!parentTeam && !parentSchool) continue;
    const personNode = makeNode(athlete, "Person", { href: athlete.href, stateCode: parentTeam?.stateCode ?? parentSchool?.stateCode });
    const roleNode: OrgNode = { ...personNode, id: `athlete-role-${athlete.id}`, kind: "AthleteRole", label: athlete.title, detail: athlete.detail };
    nodes.push(personNode, roleNode);
    edges.push({ id: `${personNode.id}-active-${roleNode.id}`, kind: "ACTIVE_IN", from: personNode.id, to: roleNode.id, seasonId: "current", reviewState: "resolved" });
    edges.push({ id: `${roleNode.id}-plays-for-${parentTeam?.id ?? parentSchool?.id}`, kind: "PLAYS_FOR", from: roleNode.id, to: parentTeam?.id ?? parentSchool!.id, seasonId: "current", reviewState: "resolved" });
  }

  for (const coach of coaches) {
    const parentTeam = teamNodes.find((team) => resultMentionsNode(coach, { title: team.label, id: team.id }));
    const parentSchool = parentTeam ? undefined : [...schoolNodes.values()].find((school) => resultMentionsNode(coach, { title: school.label, id: school.id }));
    if (!parentTeam && !parentSchool) continue;
    const personNode = makeNode(coach, "Person", { href: coach.href, stateCode: parentTeam?.stateCode ?? parentSchool?.stateCode });
    const roleNode: OrgNode = { ...personNode, id: `coach-role-${coach.id}`, kind: "CoachRole", label: coach.title, detail: coach.detail };
    nodes.push(personNode, roleNode);
    edges.push({ id: `${personNode.id}-active-${roleNode.id}`, kind: "ACTIVE_IN", from: personNode.id, to: roleNode.id, seasonId: "current", reviewState: "resolved" });
    edges.push({ id: `${roleNode.id}-coaches-${parentTeam?.id ?? parentSchool?.id}`, kind: "COACHES", from: roleNode.id, to: parentTeam?.id ?? parentSchool!.id, seasonId: "current", reviewState: "resolved" });
  }

  for (const game of games) {
    const gameNode = makeNode(game, "Game");
    const matchingTeams = teamNodes.filter((team) => resultMentionsNode(game, { title: team.label, id: team.id })).slice(0, 2);
    if (matchingTeams.length !== 2) continue;
    nodes.push(gameNode);
    for (const team of matchingTeams) edges.push({ id: `${team.id}-participated-${gameNode.id}`, kind: "PARTICIPATED_IN", from: team.id, to: gameNode.id, seasonId: "current", reviewState: "resolved" });
  }

  return { nodes, edges };
}

export function getNavigationGraph(): NavigationStateNode[] {
  const graph = getOrganizationGraph();
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const childrenOf = (id: string, kind?: OrgNodeKind) => graph.edges.filter((edge) => edge.from === id && edge.kind === "CONTAINS").map((edge) => byId.get(edge.to)).filter((node): node is OrgNode => Boolean(node) && (!kind || node.kind === kind) && node.reviewState === "resolved" && node.projectionSafe);
  const activeChildrenOf = (id: string, kind: OrgNodeKind) => graph.edges.filter((edge) => edge.from === id && edge.kind === "ACTIVE_IN").map((edge) => byId.get(edge.to)).filter((node): node is OrgNode => Boolean(node) && node.kind === kind && node.reviewState === "resolved" && node.projectionSafe);
  const incomingTo = (id: string, edgeKind: OrgEdgeKind, roleKind: OrgNodeKind) => graph.edges.filter((edge) => edge.to === id && edge.kind === edgeKind).map((edge) => byId.get(edge.from)).filter((node): node is OrgNode => Boolean(node) && node.kind === roleKind && node.reviewState === "resolved" && node.projectionSafe);
  const toResult = (node: OrgNode): PublicDirectoryResult => node.raw ?? { id: node.id, title: node.label, detail: node.detail, href: node.href, group: node.kind === "Game" ? "Games" : node.kind === "CoachRole" ? "Coaches" : node.kind === "AthleteRole" ? "Athletes" : "Organizations", typeLabel: node.sourceTypeLabel ?? node.kind, sourceLabel: "Public Record" };

  return childrenOf("country-us", "State").map((state) => {
    const schools = childrenOf(state.id, "School").map((school) => {
      const teamNodes = activeChildrenOf(school.id, "Team");
      const teams = teamNodes.map((team) => ({ id: team.raw?.id ?? team.id, title: team.label, detail: team.detail, href: team.href, athletes: incomingTo(team.id, "PLAYS_FOR", "AthleteRole").map(toResult), coaches: incomingTo(team.id, "COACHES", "CoachRole").map(toResult), games: graph.edges.filter((edge) => edge.from === team.id && edge.kind === "PARTICIPATED_IN").map((edge) => byId.get(edge.to)).filter((node): node is OrgNode => Boolean(node) && node.kind === "Game").map(toResult) }));
      return {
        id: school.raw?.id ?? school.id,
        title: school.label,
        detail: school.detail,
        href: school.href,
        teams,
        athletes: incomingTo(school.id, "PLAYS_FOR", "AthleteRole").map(toResult),
        coaches: incomingTo(school.id, "COACHES", "CoachRole").map(toResult),
        games: []
      };
    });
    return { id: state.id, code: state.stateCode ?? "US", name: state.label, href: state.href, schools };
  }).filter((state) => state.schools.length > 0).sort((a, b) => a.name.localeCompare(b.name));
}

export function searchNavigation(query: string) {
  return searchOperationsIntakeDirectory(query);
}
