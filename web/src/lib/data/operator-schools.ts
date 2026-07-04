import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import type { PublicDirectoryResult } from "./services";

export type OperatorSchoolRecord = {
  id?: string;
  name?: string;
  stateCode?: string;
  city?: string;
  district?: string;
  type?: string;
  mascot?: string;
  website?: string;
  notes?: string;
  status?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "school";
}

function normalizeStateCode(value?: string) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : undefined;
}

export function getOperatorSchoolRecords() {
  return readJsonSync<{ items?: OperatorSchoolRecord[] }>(userStatePath("operator-schools.json"), { items: [] }).items ?? [];
}

export function getOperatorSchoolResults(): PublicDirectoryResult[] {
  return getOperatorSchoolRecords()
    .filter((school) => school.status !== "archived" && school.name && normalizeStateCode(school.stateCode))
    .map((school) => {
      const stateCode = normalizeStateCode(school.stateCode)!;
      const id = school.id || `operator-school-${slug(`${stateCode}-${school.name}`)}`;
      return {
        id,
        title: school.name || "School",
        detail: [school.city, stateCode, school.district, school.type || "Operator school record"].filter(Boolean).join(" - "),
        href: `/directory/school/${id}`,
        group: "Schools",
        typeLabel: school.type || "School",
        sourceLabel: "Public Record",
        importedAt: school.updatedAt || school.createdAt,
        stateCode
      };
    });
}
