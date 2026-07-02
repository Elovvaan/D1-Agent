import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PublicDirectoryResult } from "./services";

type ExtractedAthlete = { name?: string; school?: string; city?: string; state?: string };
type ExtractedCoach = { name?: string; roles?: string[]; school?: string; sport?: string; state?: string };
type IntakeRecord = { id: string; sourceType?: string; state?: string; district?: string; school?: string; sport?: string; classYear?: string; sourceUrl?: string; sourceName?: string; notes?: string; athleteText?: string; extractedAthletes?: ExtractedAthlete[]; extractedCoaches?: ExtractedCoach[]; extractedCount?: number; extractedCoachCount?: number; sourceFetchStatus?: string; status?: string; createdAt?: string; pdf?: { name?: string; type?: string; size?: number } };

function readOperatorIntake() { try { const filePath = resolve(process.cwd(), "..", "data", "user-state", "operator-data-intake.json"); if (!existsSync(filePath)) return [] as IntakeRecord[]; const data = JSON.parse(readFileSync(filePath, "utf8")) as { items?: IntakeRecord[] }; return Array.isArray(data.items) ? data.items : []; } catch { return [] as IntakeRecord[]; } }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "record"; }
function cleanName(value: string) { return value.replace(/^[-*•#\d.\s]+/, "").replace(/\s+/g, " ").trim(); }
function extractAthleteNames(text?: string) { if (!text) return [] as string[]; const candidates = text.split(/[\n;]+/).map((line) => cleanName(line.split(/\s[-–—|]\s/)[0] ?? line)).map((line) => line.replace(/\b(class|grade|position|school|sport|source|url|notes?)\b.*$/i, "").trim()).filter((line) => line.length >= 5 && /[a-z]/i.test(line) && !/^https?:/i.test(line)); return [...new Set(candidates)].slice(0, 80); }
function sourceTitle(item: IntakeRecord) { return item.sourceName || item.pdf?.name || item.sourceUrl || "Operator intake source"; }
function addResult(results: PublicDirectoryResult[], result: PublicDirectoryResult) { results.push(result); }
function athleteDetail(item: IntakeRecord, athlete: ExtractedAthlete) { const schoolLine = [athlete.school, athlete.city && athlete.state ? `${athlete.city}, ${athlete.state}` : athlete.state].filter(Boolean).join(" - "); return [schoolLine, item.sport, item.classYear ? `Class ${item.classYear}` : "", "Extracted from Operations source"].filter(Boolean).join(" - "); }
function coachDetail(item: IntakeRecord, coach: ExtractedCoach) { return [coach.school || item.school, coach.roles?.join(" / "), coach.sport || item.sport, coach.state || item.state, "Extracted from Operations source"].filter(Boolean).join(" - "); }

function intakeToResults(item: IntakeRecord) {
  const results: PublicDirectoryResult[] = [];
  const title = sourceTitle(item);
  const baseDetail = [item.school, item.district, item.state, item.sport, item.classYear ? `Class ${item.classYear}` : ""].filter(Boolean).join(" - ");
  const athleteCount = item.extractedCount ?? item.extractedAthletes?.length ?? 0;
  const coachCount = item.extractedCoachCount ?? item.extractedCoaches?.length ?? 0;
  addResult(results, { id: `intake-source-${slug(item.id)}`, title, detail: `${baseDetail || "Operations intake"} - ${athleteCount} athletes / ${coachCount} coaches extracted - ${item.sourceFetchStatus || "saved"}`, href: `/directory/sources/intake-${slug(item.id)}`, group: "Sources", typeLabel: item.sourceType ? `${item.sourceType} source` : "Intake Source", sourceLabel: "Public Record", sourceUrl: item.sourceUrl, importedAt: item.createdAt });
  if (item.school) addResult(results, { id: `intake-school-${slug(item.school)}`, title: item.school, detail: [item.district, item.state, item.sport, "Imported from Operations intake"].filter(Boolean).join(" - "), href: `/directory/school/intake-${slug(item.school)}`, group: "Schools", typeLabel: "School", sourceLabel: "Public Record", sourceUrl: item.sourceUrl, importedAt: item.createdAt });
  const extractedAthletes = Array.isArray(item.extractedAthletes) ? item.extractedAthletes : [];
  for (const athlete of extractedAthletes) if (athlete.name) addResult(results, { id: `intake-athlete-${slug(athlete.name)}-${slug(item.id)}`, title: athlete.name, detail: athleteDetail(item, athlete), href: `/athletes/intake-${slug(athlete.name)}`, group: "Athletes", typeLabel: "Extracted Athlete", sourceLabel: "Public Record", sourceUrl: item.sourceUrl, importedAt: item.createdAt, confidence: 0.82 });
  if (!extractedAthletes.length) for (const athlete of extractAthleteNames(item.athleteText)) addResult(results, { id: `intake-athlete-${slug(athlete)}-${slug(item.id)}`, title: athlete, detail: [item.sport, item.school, item.state, item.classYear ? `Class ${item.classYear}` : "", "Claimable profile pending review"].filter(Boolean).join(" - "), href: `/athletes/intake-${slug(athlete)}`, group: "Athletes", typeLabel: "Claimable Athlete", sourceLabel: "Public Record", sourceUrl: item.sourceUrl, importedAt: item.createdAt, confidence: 0.7 });
  const extractedCoaches = Array.isArray(item.extractedCoaches) ? item.extractedCoaches : [];
  for (const coach of extractedCoaches) if (coach.name) addResult(results, { id: `intake-coach-${slug(coach.name)}-${slug(item.id)}`, title: coach.name, detail: coachDetail(item, coach), href: `/coaches/intake-${slug(coach.name)}`, group: "Coaches", typeLabel: "Extracted Coach", sourceLabel: "Public Record", sourceUrl: item.sourceUrl, importedAt: item.createdAt, confidence: 0.78 });
  return results;
}

function matches(result: PublicDirectoryResult, query: string) { return !query || [result.title, result.detail, result.group, result.typeLabel, result.sourceLabel, result.sourceUrl ?? ""].join(" ").toLowerCase().includes(query); }
export function getOperationsIntakeDirectoryResults() { return readOperatorIntake().flatMap(intakeToResults); }
export function searchOperationsIntakeDirectory(query: string) { const normalized = query.trim().toLowerCase(); const allResults = getOperationsIntakeDirectoryResults().filter((result) => matches(result, normalized)); const grouped = new Map<PublicDirectoryResult["group"], PublicDirectoryResult[]>(); for (const result of allResults) grouped.set(result.group, [...(grouped.get(result.group) ?? []), result]); return ["Athletes", "Schools", "Teams", "Rankings", "Games", "Organizations", "Sources", "Coaches"].map((group) => ({ group: group as PublicDirectoryResult["group"], results: grouped.get(group as PublicDirectoryResult["group"]) ?? [] })).filter((group) => group.results.length); }
