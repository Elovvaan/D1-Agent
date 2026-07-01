"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";
const OPERATOR_AUDIT_FILE = "operator-audit.json";
const OPERATOR_ISSUES_FILE = "operator-issues.json";
const OPERATOR_INBOX_FILE = "operator-inbox.json";
const OPERATOR_DATA_INTAKE_FILE = "operator-data-intake.json";

type ExtractedAthlete = { name: string; school: string; city?: string; state?: string };

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function userStatePath(fileName: string) { return resolve(process.cwd(), "..", "data", "user-state", fileName); }
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> { try { return JSON.parse(await readFile(filePath, "utf8")) as T; } catch { return fallback; } }
async function appendUserState(fileName: string, entry: Record<string, unknown>) { const dir = resolve(process.cwd(), "..", "data", "user-state"); const filePath = userStatePath(fileName); await mkdir(dir, { recursive: true }); const existing = await readJsonFile<{ items?: Array<Record<string, unknown>> }>(filePath, { items: [] }); const items = Array.isArray(existing.items) ? existing.items : []; await writeFile(filePath, `${JSON.stringify({ items: [entry, ...items].slice(0, 300) }, null, 2)}\n`, "utf8"); }
async function audit(action: string, payload: Record<string, unknown>) { await appendUserState(OPERATOR_AUDIT_FILE, { id: `operator-${randomUUID()}`, action, occurredAt: new Date().toISOString(), ...payload }); }

function stripHtml(html: string) { return html.replace(/<script[\s\S]*?<\/script>/gi, "\n").replace(/<style[\s\S]*?<\/style>/gi, "\n").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n"); }
function titleCaseName(name: string) { return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\bJr\b/g, "Jr").replace(/\bIi\b/g, "II").replace(/\bIii\b/g, "III").replace(/\bIv\b/g, "IV"); }
function isLikelyName(line: string) { return /^[A-Za-z][A-Za-z.'\-" ]{2,60}$/.test(line) && /\s/.test(line) && !/(High School|Athletes|Latest|Videos|Sign In|Football|Basketball|Baseball|Volleyball|Rankings|Scores|Photos|Playoffs|News|States|Sports|Home|Schools)$/i.test(line); }
function parseLocation(line: string) { const match = line.match(/^(.+?)\s*\((.+?),\s*([A-Z]{2})\)$/); if (!match) return { school: line.trim() }; return { school: match[1].trim(), city: match[2].trim(), state: match[3].trim() }; }
function extractAthletesFromText(text: string) { const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean); const athletes: ExtractedAthlete[] = []; const seen = new Set<string>(); for (let index = 0; index < lines.length - 1; index += 1) { const nameLine = lines[index]; const nextLine = lines[index + 1]; const normalizedName = titleCaseName(nameLine); if (!isLikelyName(nameLine) && !isLikelyName(normalizedName)) continue; if (!/\([^)]+,\s*[A-Z]{2}\)$|\([A-Z]{2}\)$/.test(nextLine)) continue; const parsed = parseLocation(nextLine); const key = `${normalizedName}|${parsed.school}`.toLowerCase(); if (seen.has(key)) continue; seen.add(key); athletes.push({ name: normalizedName, ...parsed }); } return athletes.slice(0, 500); }
async function fetchSourceText(sourceUrl: string) { if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return ""; try { const response = await fetch(sourceUrl, { headers: { "user-agent": "Mozilla/5.0 MyD1Bot/1.0" }, cache: "no-store", signal: AbortSignal.timeout(10000) }); if (!response.ok) return ""; const text = await response.text(); return stripHtml(text).slice(0, 200000); } catch { return ""; } }

export async function signInOperator(formData: FormData) { const configuredCode = process.env.MYD1_OPERATOR_ACCESS_CODE; const submittedCode = value(formData, "accessCode"); if (!configuredCode) redirect("/operations?status=operator-code-missing"); if (submittedCode !== configuredCode) { await audit("operator-sign-in-failed", { reason: "invalid-code" }); redirect("/operations?status=operator-denied"); } const cookieStore = await cookies(); cookieStore.set(OPERATOR_COOKIE, OPERATOR_COOKIE_VALUE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/operations", maxAge: 60 * 60 * 8 }); await audit("operator-sign-in", { result: "success" }); redirect("/operations?status=operator-ready"); }
export async function signOutOperator() { const cookieStore = await cookies(); cookieStore.delete(OPERATOR_COOKIE); await audit("operator-sign-out", { result: "success" }); redirect("/operations"); }
export async function recordSupportIssue(formData: FormData) { const subject = value(formData, "subject"); const affectedArea = value(formData, "affectedArea"); const accountType = value(formData, "accountType"); const detail = value(formData, "detail"); const severity = value(formData, "severity") || "review"; await appendUserState(OPERATOR_ISSUES_FILE, { id: `issue-${randomUUID()}`, subject, affectedArea, accountType, detail, severity, status: "open", createdAt: new Date().toISOString() }); await audit("support-issue-recorded", { subject, affectedArea, accountType, severity }); redirect("/operations?status=issue-recorded#support"); }
export async function recordInboundMessage(formData: FormData) { const senderName = value(formData, "senderName"); const senderContact = value(formData, "senderContact"); const source = value(formData, "source") || "email"; const subject = value(formData, "subject"); const body = value(formData, "body"); await appendUserState(OPERATOR_INBOX_FILE, { id: `inbound-${randomUUID()}`, senderName, senderContact, source, subject, body, status: "open", receivedAt: new Date().toISOString() }); await audit("inbound-message-captured", { source, subject, senderName }); redirect("/operations?status=inbound-message-recorded#communications"); }
export async function recordViewAsUser(formData: FormData) { const userId = value(formData, "userId") || "athlete-current"; const returnTo = value(formData, "returnTo") || `/athletes/${userId}`; await audit("view-as-user", { userId, returnTo }); redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}operatorView=1`); }
export async function recordBuildRoomRequest(formData: FormData) { const request = value(formData, "request"); const area = value(formData, "area"); await appendUserState(OPERATOR_ISSUES_FILE, { id: `build-${randomUUID()}`, subject: area || "Build request", affectedArea: area, accountType: "platform", detail: request, severity: "build-room", status: "open", createdAt: new Date().toISOString() }); await audit("build-room-requested", { area }); redirect("/operations?status=build-request-recorded#build-room"); }

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
  const pdf = formData.get("pdfFile");
  const pdfMeta = pdf instanceof File && pdf.size > 0 ? { name: pdf.name, size: pdf.size, type: pdf.type || "application/pdf" } : undefined;
  await appendUserState(OPERATOR_DATA_INTAKE_FILE, { id: `intake-${randomUUID()}`, sourceType, state, district, school, sport, classYear, sourceUrl, sourceName, notes, athleteText: athleteText.slice(0, 200000), extractedAthletes, extractedCount: extractedAthletes.length, pdf: pdfMeta, status: "queued_for_review", createdAt: new Date().toISOString() });
  await audit("data-intake-recorded", { sourceType, state, district, school, sport, sourceUrl, pdfName: pdfMeta?.name, extractedCount: extractedAthletes.length });
  redirect("/operations?status=data-intake-recorded#data-intake");
}
