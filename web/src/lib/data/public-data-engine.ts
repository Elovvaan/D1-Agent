import { getPublicDirectoryCounters, searchPublicDirectory, type PublicDirectoryResult } from "./services";
import { getOperationsIntakeDirectoryResults, searchOperationsIntakeDirectory } from "./public-intake-search";

export type { PublicDirectoryResult };

export type PublicStateNode = {
  code: string;
  name: string;
  schools: Array<{
    id: string;
    title: string;
    detail: string;
    href: string;
    typeLabel: string;
    teams: Array<{
      id: string;
      title: string;
      detail: string;
      href: string;
      typeLabel: string;
      coaches: PublicDirectoryResult[];
      athletes: PublicDirectoryResult[];
      games: PublicDirectoryResult[];
    }>;
    coaches: PublicDirectoryResult[];
    athletes: PublicDirectoryResult[];
    games: PublicDirectoryResult[];
  }>;
};

const groupOrder: PublicDirectoryResult["group"][] = ["Athletes", "Schools", "Teams", "Rankings", "Games", "Coaches", "Sources", "Organizations"];
const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
};

function normalizeState(value?: string) {
  if (!value) return "US";
  const stateMatch = value.match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/);
  return stateMatch?.[1] ?? "US";
}

function schoolNameFromDetail(detail: string) {
  return detail.split(" - ")[0]?.trim() || "School not set";
}

function mergeGroups(groups: Array<{ group: PublicDirectoryResult["group"]; results: PublicDirectoryResult[] }>) {
  const buckets = new Map<PublicDirectoryResult["group"], PublicDirectoryResult[]>();
  const seen = new Set<string>();
  for (const group of groups) {
    for (const result of group.results) {
      const key = `${result.group}-${result.id}-${result.href}-${result.sourceUrl ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      buckets.set(result.group, [...(buckets.get(result.group) ?? []), result]);
    }
  }
  return groupOrder.map((group) => ({ group, results: buckets.get(group) ?? [] })).filter((group) => group.results.length > 0);
}

function groupByState(results: PublicDirectoryResult[]) {
  const stateMap = new Map<string, PublicStateNode>();
  const schools = results.filter((result) => result.group === "Schools");
  const teams = results.filter((result) => result.group === "Teams");
  const athletes = results.filter((result) => result.group === "Athletes");
  const coaches = results.filter((result) => result.group === "Coaches");
  const games = results.filter((result) => result.group === "Games");
  const ensureState = (code: string) => {
    if (!stateMap.has(code)) stateMap.set(code, { code, name: stateNames[code] ?? (code === "US" ? "National / Unsorted" : code), schools: [] });
    return stateMap.get(code)!;
  };
  const schoolNodes = new Map<string, PublicStateNode["schools"][number]>();
  for (const school of schools) {
    const code = normalizeState(`${school.title} ${school.detail}`);
    const state = ensureState(code);
    const node = { id: school.id, title: school.title, detail: school.detail, href: school.href, typeLabel: school.typeLabel, teams: [], coaches: [], athletes: [], games: [] };
    state.schools.push(node);
    schoolNodes.set(school.title.toLowerCase(), node);
  }
  const ensureSchool = (name: string, detail: string, fallbackCode: string) => {
    const key = name.toLowerCase();
    const existing = schoolNodes.get(key);
    if (existing) return existing;
    const state = ensureState(fallbackCode);
    const node = { id: `derived-school-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title: name, detail, href: `/directory/school/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, typeLabel: "School", teams: [], coaches: [], athletes: [], games: [] };
    state.schools.push(node);
    schoolNodes.set(key, node);
    return node;
  };
  for (const athlete of athletes) {
    const code = normalizeState(athlete.detail);
    const schoolName = schoolNameFromDetail(athlete.detail);
    ensureSchool(schoolName, athlete.detail, code).athletes.push(athlete);
  }
  for (const coach of coaches) {
    const code = normalizeState(coach.detail);
    const schoolName = schoolNameFromDetail(coach.detail);
    ensureSchool(schoolName, coach.detail, code).coaches.push(coach);
  }
  for (const game of games) {
    const code = normalizeState(game.detail);
    const schoolName = schoolNameFromDetail(game.detail);
    ensureSchool(schoolName, game.detail, code).games.push(game);
  }
  for (const team of teams) {
    const code = normalizeState(team.detail);
    const schoolName = schoolNameFromDetail(team.detail);
    const school = ensureSchool(schoolName, team.detail, code);
    school.teams.push({ id: team.id, title: team.title, detail: team.detail, href: team.href, typeLabel: team.typeLabel, coaches: [], athletes: [], games: [] });
  }
  return [...stateMap.values()].sort((a, b) => a.name.localeCompare(b.name)).map((state) => ({ ...state, schools: state.schools.sort((a, b) => a.title.localeCompare(b.title)) }));
}

export function searchPublicData(query: string) {
  return mergeGroups([...searchPublicDirectory(query), ...searchOperationsIntakeDirectory(query)]);
}

export function getPublicDataCounters() {
  const base = getPublicDirectoryCounters();
  const intake = getOperationsIntakeDirectoryResults();
  const count = (group: PublicDirectoryResult["group"]) => intake.filter((result) => result.group === group).length;
  return {
    schools: base.schools + count("Schools"),
    teams: base.teams + count("Teams"),
    athletes: base.athletes + count("Athletes"),
    coaches: base.coaches + count("Coaches"),
    games: base.games + count("Games"),
    sources: base.sources + count("Sources"),
    recordsImported: base.recordsImported + intake.length,
    pendingReview: base.pendingReview + intake.length
  };
}

export function getPublicSchoolResults(limit = 12) {
  return searchPublicData("school").find((group) => group.group === "Schools")?.results.slice(0, limit) ?? [];
}

export function getPublicSchoolHierarchy() {
  const base = ["", "school", "athlete", "team", "coach", "game"].flatMap((query) => searchPublicDirectory(query).flatMap((group) => group.results));
  const intake = getOperationsIntakeDirectoryResults();
  const unique = new Map<string, PublicDirectoryResult>();
  for (const result of [...base, ...intake]) unique.set(`${result.group}-${result.id}-${result.href}-${result.sourceUrl ?? ""}`, result);
  return groupByState([...unique.values()]);
}
