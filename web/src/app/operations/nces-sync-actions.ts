"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ncesCcdAdapter } from "@/lib/data/adapters/nces-ccd-adapter";
import type { CanonicalProposal, RawInput } from "@/lib/data/adapters/types";
import { appendUserState } from "@/lib/data/platform-storage";

const OPERATOR_NCES_RUNS_FILE = "operator-nces-runs.json";
const OPERATOR_AUDIT_FILE = "operator-audit.json";
const NCES_SCHOOLS_FILE = "nces-schools.json";
const MAX_BYTES = 35 * 1024 * 1024;

type RuntimeNcesSchool = {
  id: string;
  ncesId: string;
  name: string;
  city: string;
  state: string;
  districtId: string;
  districtName: string;
  sourceUrl: string;
  importedAt: string;
  confidence: number;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fieldValue(proposal: CanonicalProposal, key: string) {
  const raw = proposal.fields[key]?.value;
  return typeof raw === "string" ? raw.trim() : "";
}

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "school";
}

function toSchool(proposal: CanonicalProposal, sourceUrl: string, importedAt: string): RuntimeNcesSchool | null {
  if (proposal.kind !== "SchoolProposal" || proposal.confidence < 0.75) return null;
  const ncesId = fieldValue(proposal, "ncesId");
  const name = fieldValue(proposal, "name");
  const city = fieldValue(proposal, "city");
  const state = fieldValue(proposal, "state").toUpperCase();
  if (!name || !state) return null;
  return {
    id: `nces-${ncesId || `${state}-${slug(name)}-${slug(city)}`}`,
    ncesId,
    name,
    city,
    state,
    districtId: fieldValue(proposal, "districtId"),
    districtName: fieldValue(proposal, "districtName"),
    sourceUrl,
    importedAt,
    confidence: proposal.confidence
  };
}

async function readRuntimeSchools() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", NCES_SCHOOLS_FILE);
    const data = JSON.parse(await readFile(filePath, "utf8")) as { items?: RuntimeNcesSchool[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [] as RuntimeNcesSchool[];
  }
}

async function writeRuntimeSchools(incoming: RuntimeNcesSchool[]) {
  const root = resolve(process.cwd(), "..", "data", "user-state");
  await mkdir(root, { recursive: true });
  const existing = await readRuntimeSchools();
  const merged = new Map<string, RuntimeNcesSchool>();
  for (const school of existing) merged.set(school.id, school);
  for (const school of incoming) merged.set(school.id, school);
  await writeFile(resolve(root, NCES_SCHOOLS_FILE), `${JSON.stringify({ items: [...merged.values()] }, null, 2)}\n`, "utf8");
}

async function audit(action: string, payload: Record<string, unknown>) {
  await appendUserState(OPERATOR_AUDIT_FILE, { id: `operator-${randomUUID()}`, action, occurredAt: new Date().toISOString(), ...payload });
}

export async function syncNcesCcdFromSource(formData: FormData) {
  const sourceUrl = value(formData, "sourceUrl") || process.env.MYD1_NCES_CCD_CSV_URL || "";
  const sourceName = value(formData, "sourceName") || "NCES CCD Source Sync";
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) redirect("/operations/nces?status=nces-source-missing");

  const response = await fetch(sourceUrl, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; MyD1Bot/1.0; +https://myd1sports.pro)" },
    cache: "no-store",
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) redirect(`/operations/nces?status=nces-fetch-failed&code=${response.status}`);
  const body = await response.text();
  if (Buffer.byteLength(body, "utf8") > MAX_BYTES) redirect("/operations/nces?status=nces-file-too-large");

  const runId = `nces-sync-${randomUUID()}`;
  const input: RawInput = {
    medium: "csv",
    uri: sourceUrl,
    fetchedAt: new Date().toISOString(),
    body,
    headers: { "content-type": response.headers.get("content-type") || "text/csv" }
  };
  const detection = ncesCcdAdapter.detect(input);
  const extraction = ncesCcdAdapter.extract(input, { rawArchiveRef: `operations:nces:${runId}` });
  const importedAt = extraction.envelope.extractedAt;
  const schools = extraction.proposals.map((proposal) => toSchool(proposal, sourceUrl, importedAt)).filter((school): school is RuntimeNcesSchool => Boolean(school));

  await writeRuntimeSchools(schools);
  await appendUserState(OPERATOR_NCES_RUNS_FILE, {
    id: runId,
    sourceName,
    sourceUrl,
    detection,
    envelope: extraction.envelope,
    diagnostics: extraction.diagnostics,
    proposalCount: extraction.proposals.length,
    autoSeeded: schools.length,
    status: detection.handled ? "synced_from_source_url" : "source_detected_but_unclassified",
    createdAt: new Date().toISOString()
  });
  await audit("nces-source-synced", { sourceName, sourceUrl, proposalCount: extraction.proposals.length, autoSeeded: schools.length, handled: detection.handled });

  revalidatePath("/operations/nces");
  revalidatePath("/operations");
  revalidatePath("/schools");
  revalidatePath("/search");
  redirect(`/operations/nces?status=nces-source-synced&count=${schools.length}`);
}
