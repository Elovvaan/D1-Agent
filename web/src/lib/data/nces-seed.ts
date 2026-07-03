import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ncesCcdAdapter } from "./adapters/nces-ccd-adapter";
import type { CanonicalProposal, RawInput } from "./adapters/types";
import type { PublicDirectoryResult } from "./services";

const demoNcesCsv = `NCESSCH,SCHOOL_NAME,CITY,STATE,LEAID,LEA_NAME
490069000452,Ogden High,Ogden,UT,4900690,Ogden City District
490042000215,Ben Lomond High,Ogden,UT,4900420,Weber District
040775000854,Chandler High School,Chandler,AZ,0407750,Chandler Unified District
062271003197,Long Beach Poly High,Long Beach,CA,0622710,Long Beach Unified
080336000194,Denver East High School,Denver,CO,0803360,Denver County 1
`;

type RuntimeNcesSchool = { id: string; ncesId?: string; name: string; city?: string; state: string; districtId?: string; districtName?: string; sourceUrl?: string; importedAt?: string; confidence?: number };

function fieldValue(proposal: CanonicalProposal, key: string) {
  const value = proposal.fields[key]?.value;
  return typeof value === "string" ? value : "";
}

function schoolHref(name: string, state: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `/directory/school/nces-${state.toLowerCase()}-${slug}`;
}

function readRuntimeSchools() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "nces-schools.json");
    if (!existsSync(filePath)) return [] as RuntimeNcesSchool[];
    const data = JSON.parse(readFileSync(filePath, "utf8")) as { items?: RuntimeNcesSchool[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [] as RuntimeNcesSchool[];
  }
}

export function getNcesSeedExtraction() {
  const input: RawInput = {
    medium: "csv",
    uri: "seed://nces/ccd/demo-schools.csv",
    fetchedAt: "2026-07-02T00:00:00.000Z",
    body: demoNcesCsv
  };
  return ncesCcdAdapter.extract(input, { rawArchiveRef: "seed:nces:ccd:demo-schools" });
}

function runtimeSchoolToResult(school: RuntimeNcesSchool): PublicDirectoryResult {
  return {
    id: school.id,
    title: school.name,
    detail: [school.city, school.state, school.districtName].filter(Boolean).join(" - "),
    href: schoolHref(school.name, school.state),
    group: "Schools" as const,
    typeLabel: "NCES School",
    sourceLabel: "Public Record" as const,
    sourceUrl: school.sourceUrl || "NCES CCD",
    importedAt: school.importedAt,
    confidence: school.confidence ?? 0.95
  };
}

export function getNcesSeedSchoolResults(): PublicDirectoryResult[] {
  const runtimeSchools = readRuntimeSchools();
  if (runtimeSchools.length) return runtimeSchools.map(runtimeSchoolToResult);

  const extraction = getNcesSeedExtraction();
  return extraction.proposals
    .filter((proposal) => proposal.kind === "SchoolProposal" && proposal.confidence >= 0.75)
    .map((proposal) => {
      const ncesId = fieldValue(proposal, "ncesId");
      const name = fieldValue(proposal, "name") || "Unresolved school";
      const city = fieldValue(proposal, "city") || "City unresolved";
      const state = fieldValue(proposal, "state") || "US";
      const districtName = fieldValue(proposal, "districtName");
      return {
        id: `nces-${ncesId || proposal.proposalId}`,
        title: name,
        detail: [city, state, districtName].filter(Boolean).join(" - "),
        href: schoolHref(name, state),
        group: "Schools" as const,
        typeLabel: "NCES School",
        sourceLabel: "Public Record" as const,
        sourceUrl: extraction.envelope.uri,
        importedAt: extraction.envelope.extractedAt,
        confidence: proposal.confidence
      };
    });
}
