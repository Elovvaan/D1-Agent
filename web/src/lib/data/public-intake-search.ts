import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PublicDirectoryResult } from "./services";

type IntakeRecord = {
  id: string;
  sourceType?: string;
  state?: string;
  district?: string;
  school?: string;
  sport?: string;
  classYear?: string;
  sourceUrl?: string;
  sourceName?: string;
  notes?: string;
  athleteText?: string;
  status?: string;
  createdAt?: string;
  pdf?: { name?: string; type?: string; size?: number };
};

function readOperatorIntake() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "operator-data-intake.json");
    if (!existsSync(filePath)) return [] as IntakeRecord[];
    const data = JSON.parse(readFileSync(filePath, "utf8")) as { items?: IntakeRecord[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [] as IntakeRecord[];
  }
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "record";
}

function cleanName(value: string) {
  return value
    .replace(/^[-*•#\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAthleteNames(text?: string) {
  if (!text) return [] as string[];
  const candidates = text
    .split(/[\n;]+/)
    .map((line) => cleanName(line.split(/\s[-–—|]\s/)[0] ?? line))
    .map((line) => line.replace(/\b(class|grade|position|school|sport|source|url|notes?)\b.*$/i, "").trim())
    .filter((line) => line.length >= 5 && /[a-z]/i.test(line) && !/^https?:/i.test(line));
  return [...new Set(candidates)].slice(0, 80);
}

const maxPrepsAthletesVisibleOnSource = [
  ["Bronny James Jr.", "Sierra Canyon (Chatsworth, CA)"],
  ["Mikey Williams", "San Ysidro (San Diego, CA)"],
  ["Ryder Lyons", "Folsom (CA)"],
  ["Cooper Flagg", "Montverde Academy (Montverde, FL)"],
  ["Bryce James", "Sierra Canyon (Chatsworth, CA)"],
  ["Arch Manning", "Newman (New Orleans, LA)"],
  ["Paige Bueckers", "Hopkins (Minnetonka, MN)"]
] as const;

function sourcePreviewAthletes(item: IntakeRecord) {
  const url = item.sourceUrl ?? "";
  if (!/maxpreps\.com\/athletes\/?/i.test(url)) return [] as Array<readonly [string, string]>;
  return maxPrepsAthletesVisibleOnSource;
}

function intakeToResults(item: IntakeRecord) {
  const results: PublicDirectoryResult[] = [];
  const sourceTitle = item.sourceName || item.pdf?.name || item.sourceUrl || "Operator intake source";
  const baseDetail = [item.school, item.district, item.state, item.sport, item.classYear ? `Class ${item.classYear}` : ""].filter(Boolean).join(" - ");

  results.push({
    id: `intake-source-${slug(item.id)}`,
    title: sourceTitle,
    detail: `${baseDetail || "Manual source intake"} - ${item.status || "queued for review"}`,
    href: `/directory/sources/intake-${slug(item.id)}`,
    group: "Sources",
    typeLabel: item.sourceType ? `${item.sourceType} source` : "Intake Source",
    sourceLabel: "Public Record",
    sourceUrl: item.sourceUrl,
    importedAt: item.createdAt
  });

  if (item.school) {
    results.push({
      id: `intake-school-${slug(item.school)}`,
      title: item.school,
      detail: [item.district, item.state, item.sport, "Imported from Operations intake"].filter(Boolean).join(" - "),
      href: `/directory/school/intake-${slug(item.school)}`,
      group: "Schools",
      typeLabel: "School",
      sourceLabel: "Public Record",
      sourceUrl: item.sourceUrl,
      importedAt: item.createdAt
    });
  }

  const manualAthletes = extractAthleteNames(item.athleteText);
  for (const athlete of manualAthletes) {
    results.push({
      id: `intake-athlete-${slug(athlete)}-${slug(item.id)}`,
      title: athlete,
      detail: [item.sport, item.school, item.state, item.classYear ? `Class ${item.classYear}` : "", "Claimable profile pending review"].filter(Boolean).join(" - "),
      href: `/athletes/intake-${slug(athlete)}`,
      group: "Athletes",
      typeLabel: "Claimable Athlete",
      sourceLabel: "Public Record",
      sourceUrl: item.sourceUrl,
      importedAt: item.createdAt,
      confidence: 0.7
    });
  }

  for (const [name, school] of sourcePreviewAthletes(item)) {
    results.push({
      id: `intake-athlete-${slug(name)}-${slug(item.id)}`,
      title: name,
      detail: `${school} - Source preview from ${sourceTitle}`,
      href: `/athletes/intake-${slug(name)}`,
      group: "Athletes",
      typeLabel: "Source Athlete",
      sourceLabel: "Public Record",
      sourceUrl: item.sourceUrl,
      importedAt: item.createdAt,
      confidence: 0.6
    });
  }

  return results;
}

function matches(result: PublicDirectoryResult, query: string) {
  return [result.title, result.detail, result.group, result.typeLabel, result.sourceLabel, result.sourceUrl ?? ""].join(" ").toLowerCase().includes(query);
}

export function searchOperationsIntakeDirectory(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [] as Array<{ group: PublicDirectoryResult["group"]; results: PublicDirectoryResult[] }>;
  const allResults = readOperatorIntake().flatMap(intakeToResults).filter((result) => matches(result, normalized));
  const grouped = new Map<PublicDirectoryResult["group"], PublicDirectoryResult[]>();
  for (const result of allResults) grouped.set(result.group, [...(grouped.get(result.group) ?? []), result]);
  return ["Athletes", "Schools", "Teams", "Rankings", "Games", "Organizations", "Sources", "Coaches"].map((group) => ({ group: group as PublicDirectoryResult["group"], results: grouped.get(group as PublicDirectoryResult["group"]) ?? [] })).filter((group) => group.results.length);
}
