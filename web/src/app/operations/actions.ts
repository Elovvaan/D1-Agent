"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ncesCcdAdapter } from "@/lib/data/adapters/nces-ccd-adapter";
import type { RawInput } from "@/lib/data/adapters/types";
import { appendUserState } from "@/lib/data/platform-storage";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";
const OPERATOR_AUDIT_FILE = "operator-audit.json";
const OPERATOR_ISSUES_FILE = "operator-issues.json";
const OPERATOR_INBOX_FILE = "operator-inbox.json";
const OPERATOR_DATA_INTAKE_FILE = "operator-data-intake.json";
const OPERATOR_NCES_RUNS_FILE = "operator-nces-runs.json";
const STATE_PROFILES_FILE = "state-profiles.json";

type ExtractedAthlete = { name: string; school: string; city?: string; state?: string };
type ExtractedCoach = { name: string; roles: string[]; school?: string; sport?: string; state?: string };

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
async function audit(action: string, payload: Record<string, unknown>) { await appendUserState(OPERATOR_AUDIT_FILE, { id: `operator-${randomUUID()}`, action, occurredAt: new Date().toISOString(), ...payload }); }

function stripHtml(html: string) { return html.replace(/<script[\s\S]*?<\/script>/gi, "\n").replace(/<style[\s\S]*?<\/style>/gi, "\n").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n"); }
function titleCaseName(name: string) { return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\bJr\b/g, "Jr").replace(/\bIi\b/g, "II").replace(/\bIii\b/g, "III").replace(/\bIv\b/g, "IV"); }
function linesFromText(text: string) { return text.split(/\n+/).map((line) => line.trim()).filter(Boolean); }
function isLikelyName(line: string) { return /^[A-Za-z][A-Za-z.'\-" ]{2,60}$/.test(line) && /\s/.test(line) && !/(High School|Athletes|Latest|Videos|Sign In|Football|Basketball|Baseball|Volleyball|Rankings|Scores|Photos|Playoffs|News|States|Sports|Home|Schools|Welcome Back|Great Day|Eagle)$/i.test(line); }
function parseLocation(line: string) { const cityMatch = line.match(/^(.+?)\s*\((.+?),\s*([A-Z]{2})\)$/); if (cityMatch) return { school: cityMatch[1].trim(), city: cityMatch[2].trim(), state: cityMatch[3].trim() }; const stateOnlyMatch = line.match(/^(.+?)\s*\(([A-Z]{2})\)$/); if (stateOnlyMatch) return { school: stateOnlyMatch[1].trim(), state: stateOnlyMatch[2].trim() }; return { school: line.trim() }; }
function extractAthletesFromText(text: string) { const lines = linesFromText(text); const athletes: ExtractedAthlete[] = []; const seen = new Set<string>(); for (let index = 0; index < lines.length - 1; index += 1) { const nameLine = lines[index]; const nextLine = lines[index + 1]; const normalizedName = titleCaseName(nameLine); if (!isLikelyName(nameLine) && !isLikelyName(normalizedName)) continue; if (!/\([^)]+,\s*[A-Z]{2}\)$|\([A-Z]{2}\)$/.test(nextLine)) continue; const parsed = parseLocation(nextLine); const key = `${normalizedName}|${parsed.school}`.toLowerCase(); if (seen.has(key)) continue; seen.add(key); athletes.push({ name: normalizedName, ...parsed }); } return athletes.slice(0, 500); }
function roleToSport(role: string) { const lower = role.toLowerCase(); if (lower.includes("football")) return "Football"; if (lower.includes("basketball")) return "Basketball"; if (lower.includes("powerlifting")) return "Powerlifting"; if (lower.includes("baseball")) return "Baseball"; if (lower.includes("volleyball")) return "Volleyball"; if (lower.includes("track")) return "Track & Field"; if (lower.includes("soccer")) return "Soccer"; return ""; }
function extractCoachesFromText(text: string, fallback: { school?: string; sport?: string; state?: string }) { const lines = linesFromText(text); const roleLines = lines.filter((line) => /coach/i.test(line)).map((line) => titleCaseName(line.replace(/[^A-Za-z\s/&-]/g, " ").replace(/\s+/g, " ").trim())); if (!roleLines.length) return [] as ExtractedCoach[]; const nameCandidates = lines.map((line) => titleCaseName(line.replace(/[^A-Za-z.'\-"\s]/g, " ").replace(/\s+/g, " ").trim())).filter((line) => isLikelyName(line) && !/coach/i.test(line)); const name = nameCandidates[nameCandidates.length - 1]; if (!name) return [] as ExtractedCoach[]; const sport = fallback.sport || roleLines.map(roleToSport).find(Boolean) || undefined; return [{ name, roles: [...new Set(roleLines)], school: fallback.school, sport, state: fallback.state }]; }
async function fetchSourceText(sourceUrl: string) { if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return ""; try { const response = await fetch(sourceUrl, { headers: { "user-agent": "Mozilla/5.0 (compatible; MyD1Bot/1.0; +https://myd1sports.pro)" }, cache: "no-store", signal: AbortSignal.timeout(12000) }); if (!response.ok) return ""; const text = await response.text(); return stripHtml(text).slice(0, 200000); } catch { return ""; } }

export async function signInOperator(formData: FormData) { const configuredCode = process.env.MYD1_OPERATOR_ACCESS_CODE; const submittedCode = value(formData, "accessCode"); if (!configuredCode) redirect("/operations?status=operator-code-missing"); if (submittedCode !== configuredCode) { await audit("operator-sign-in-failed", { reason: "invalid-code" }); redirect("/operations?status=operator-denied"); } const cookieStore = await cookies(); cookieStore.set(OPERATOR_COOKIE, OPERATOR_COOKIE_VALUE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/operations", maxAge: 60 * 60 * 8 }); await audit("operator-sign-in", { result: "success" }); redirect("/operations?status=operator-ready"); }
export async function signOutOperator() { const cookieStore = await cookies(); cookieStore.delete(OPERATOR_COOKIE); await audit("operator-sign-out", { result: "success" }); redirect("/operations"); }
export async function recordSupportIssue(formData: FormData) { const subject = value(formData, "subject"); const affectedArea = value(formData, "affectedArea"); const accountType = value(formData, "accountType"); const detail = value(formData, "detail"); const severity = value(formData, "severity") || "review"; await appendUserState(OPERATOR_ISSUES_FILE, { id: `issue-${randomUUID()}`, subject, affectedArea, accountType, detail, severity, status: "open", createdAt: new Date().toISOString() }); await audit("support-issue-recorded", { subject, affectedArea, accountType, severity }); redirect("/operations?status=issue-recorded#support"); }
export async function recordInboundMessage(formData: FormData) { const senderName = value(formData, "senderName"); const senderContact = value(formData, "senderContact"); const source = value(formData, "source") || "email"; const subject = value(formData, "subject"); const body = value(formData, "body"); await appendUserState(OPERATOR_INBOX_FILE, { id: `inbound-${randomUUID()}`, senderName, senderContact, source, subject, body, status: "open", receivedAt: new Date().toISOString() }); await audit("inbound-message-captured", { source, subject, senderName }); redirect("/operations?status=inbound-message-recorded#communications"); }
export async function recordViewAsUser(formData: FormData) { const userId = value(formData, "userId") || "athlete-current"; const returnTo = value(formData, "returnTo") || `/athletes/${userId}`; await audit("view-as-user", { userId, returnTo }); redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}operatorView=1`); }
export async function recordBuildRoomRequest(formData: FormData) { const request = value(formData, "request"); const area = value(formData, "area"); await appendUserState(OPERATOR_ISSUES_FILE, { id: `build-${randomUUID()}`, subject: area || "Build request", affectedArea: area, accountType: "platform", detail: request, severity: "build-room", status: "open", createdAt: new Date().toISOString() }); await audit("build-room-requested", { area }); redirect("/operations?status=build-request-recorded#build-room"); }

export async function saveStateProfile(formData: FormData) {
  const stateCode = value(formData, "stateCode").toUpperCase();
  if (!stateCode) redirect("/operations/profile-manager?status=missing-state");
  await appendUserState(STATE_PROFILES_FILE, { id: `state-profile-${stateCode}-${randomUUID()}`, stateCode, displayName: value(formData, "displayName"), tagline: value(formData, "tagline"), bio: value(formData, "bio"), coverImageUrl: value(formData, "coverImageUrl"), badgeImageUrl: value(formData, "badgeImageUrl"), featureVideoUrl: value(formData, "featureVideoUrl"), primarySport: value(formData, "primarySport"), updatedAt: new Date().toISOString() });
  await audit("state-profile-saved", { stateCode });
  revalidatePath("/schools");
  revalidatePath(`/schools/${stateCode.toLowerCase()}`);
  revalidatePath("/operations/profile-manager");
  redirect(`/operations/profile-manager?state=${stateCode}&status=state-profile-saved`);
}

export async function recordDataIntake(formData: FormData) {
  const sourceType = value(formData, "sourceType") || "manual";
  const state = value(formData, "state");
  const district = value(formData, "district");
  const school = value(formData, "school");
  const sport = value(formData, "sport");
  const classYear = value(formData, "classYear");
  const sourceUrl = value(formData, "sourceUrl");
  const sourceName = value(formData, "sourceName");
  const notes = value(formData, "notes");
  const pastedAthleteText = value(formData, "athleteText");
  const fetchedText = pastedAthleteText ? "" : await fetchSourceText(sourceUrl);
  const athleteText = pastedAthleteText || fetchedText;
  const extractedAthletes = extractAthletesFromText(athleteText);
  const extractedCoaches = extractCoachesFromText(athleteText, { school, sport, state });
  const pdf = formData.get("pdfFile");
  const pdfMeta = pdf instanceof File && pdf.size > 0 ? { name: pdf.name, size: pdf.size, type: pdf.type || "application/pdf" } : undefined;
  await appendUserState(OPERATOR_DATA_INTAKE_FILE, { id: `intake-${randomUUID()}`, sourceType, state, district, school, sport, classYear, sourceUrl, sourceName, notes, athleteText: athleteText.slice(0, 200000), sourceFetchStatus: sourceUrl ? (fetchedText ? "fetched" : pastedAthleteText ? "pasted_text_used" : "fetch_failed_or_blocked") : "manual", extractedAthletes, extractedCoaches, extractedCount: extractedAthletes.length, extractedCoachCount: extractedCoaches.length, pdf: pdfMeta, status: "queued_for_review", createdAt: new Date().toISOString() });
  await audit("data-intake-recorded", { sourceType, state, district, school, sport, sourceUrl, pdfName: pdfMeta?.name, extractedCount: extractedAthletes.length, extractedCoachCount: extractedCoaches.length });
  redirect("/operations?status=data-intake-recorded&tab=data-intake");
}

export async function ingestNcesCcdCsv(formData: FormData) {
  const uploaded = formData.get("ncesFile");
  const sourceName = value(formData, "sourceName") || "NCES CCD CSV";
  if (!(uploaded instanceof File) || uploaded.size === 0) redirect("/operations/nces?status=nces-file-missing");
  const text = Buffer.from(await uploaded.arrayBuffer()).toString("utf8");
  const runId = `nces-${randomUUID()}`;
  const input: RawInput = { medium: "csv", uri: `upload://operations/${uploaded.name}`, fetchedAt: new Date().toISOString(), body: text, headers: { "content-type": uploaded.type || "text/csv" } };
  const detection = ncesCcdAdapter.detect(input);
  const extraction = ncesCcdAdapter.extract(input, { rawArchiveRef: `operations:nces:${runId}` });
  const autoSeeded = extraction.proposals.filter((proposal) => proposal.kind === "SchoolProposal" && proposal.confidence >= 0.75).length;
  await appendUserState(OPERATOR_NCES_RUNS_FILE, { id: runId, sourceName, fileName: uploaded.name, fileSize: uploaded.size, detection, envelope: extraction.envelope, diagnostics: extraction.diagnostics, proposalCount: extraction.proposals.length, autoSeeded, status: detection.handled ? "extracted_for_resolution" : "unclassified", createdAt: new Date().toISOString() });
  await appendUserState(OPERATOR_DATA_INTAKE_FILE, { id: `intake-${runId}`, sourceType: "nces-ccd", sourceName, sourceUrl: extraction.envelope.uri, notes: "NCES CCD adapter run. T0 canonical school proposals routed through Operations.", extractedCount: autoSeeded, status: detection.handled ? "extracted_for_resolution" : "unclassified_input", createdAt: new Date().toISOString() });
  await audit("nces-ccd-ingested", { runId, sourceName, fileName: uploaded.name, proposalCount: extraction.proposals.length, autoSeeded, handled: detection.handled, confidence: detection.confidence });
  revalidatePath("/operations");
  revalidatePath("/operations/nces");
  revalidatePath("/schools");
  redirect("/operations/nces?status=nces-ingested");
}
