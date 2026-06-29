"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  ContentPublicationRecord,
  DiscoveredLink,
  DiscoveredSource,
  MediaReviewQueueItem,
  OperatorFieldNote,
  OperatorMediaUpload,
  OperatorStatReport,
  PublicImportResult,
  SchoolDiscoveryType,
  SchoolImportSession
} from "@d1/shared";

const schoolImportsDir = resolve(process.cwd(), "..", "data", "school-imports");
const publicImportsDir = resolve(process.cwd(), "..", "data", "imports");
const operatorDir = resolve(process.cwd(), "..", "data", "operator");
const operatorUploadDir = resolve(process.cwd(), "public", "operator-uploads");

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeFileName(name: string) {
  const ext = extname(name);
  const base = basename(name, ext).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "upload";
  return `${base.slice(0, 42)}${ext.slice(0, 12)}`;
}

function absoluteUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function textBetweenTags(html: string, href: string) {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<a[^>]+href=["']${escaped}["'][^>]*>(.*?)</a>`, "is"));
  return match?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function classifyLink(url: string, title: string): { type: SchoolDiscoveryType; confidence: number; evidence: string[] } {
  const text = `${url} ${title}`.toLowerCase();
  const rules: Array<{ type: SchoolDiscoveryType; confidence: number; terms: string[] }> = [
    { type: "roster", confidence: 0.92, terms: ["roster", "players", "student-athlete"] },
    { type: "schedule", confidence: 0.9, terms: ["schedule", "calendar", "fixtures"] },
    { type: "stats", confidence: 0.88, terms: ["stats", "statistics", "leaders", "boxscore", "box-score"] },
    { type: "coaches", confidence: 0.86, terms: ["coach", "coaches", "staff"] },
    { type: "livestream", confidence: 0.84, terms: ["live", "stream", "broadcast", "watch"] },
    { type: "events", confidence: 0.82, terms: ["event", "tournament", "showcase", "meet"] },
    { type: "camps", confidence: 0.8, terms: ["camp", "clinic"] },
    { type: "team", confidence: 0.74, terms: ["football", "basketball", "baseball", "soccer", "volleyball", "softball", "track", "wrestling", "lacrosse", "tennis", "golf", "swimming"] },
    { type: "school", confidence: 0.72, terms: ["athletics", "school", "academy", "university", "college"] }
  ];
  const rule = rules.find((item) => item.terms.some((term) => text.includes(term)));
  if (!rule) return { type: "unknown", confidence: 0.35, evidence: ["No strong athletics page pattern found."] };
  return { type: rule.type, confidence: rule.confidence, evidence: rule.terms.filter((term) => text.includes(term)).map((term) => `Matched "${term}".`) };
}

async function robotsAllows(url: URL) {
  try {
    const robotsUrl = new URL("/robots.txt", url.origin);
    const response = await fetch(robotsUrl, { cache: "no-store" });
    if (!response.ok) return true;
    const robots = await response.text();
    const globalBlock = robots.match(/user-agent:\s*\*\s+disallow:\s*\/\s*$/im);
    if (globalBlock) return false;
    const disallowLines = [...robots.matchAll(/disallow:\s*(\S+)/gi)].map((match) => match[1]).filter(Boolean);
    return !disallowLines.some((path) => path !== "/" && url.pathname.startsWith(path));
  } catch {
    return true;
  }
}

export async function discoverSchoolImportSource(formData: FormData) {
  const sourceUrl = value(formData, "sourceUrl");
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    redirect("/admin/import-school?status=invalid-url");
  }

  await mkdir(schoolImportsDir, { recursive: true });
  const now = new Date().toISOString();
  const sourceId = `source-${randomUUID()}`;
  const allowed = await robotsAllows(url);
  if (!allowed) {
    const blocked: DiscoveredSource = { id: sourceId, sourceUrl: url.toString(), fetchedAt: now, robotsAllowed: false, status: "blocked", message: "robots.txt blocks public discovery for this path." };
    await writeFile(resolve(schoolImportsDir, `${sourceId}.json`), `${JSON.stringify(blocked, null, 2)}\n`, "utf8");
    revalidatePath("/admin/import-school");
    redirect("/admin/import-school?status=robots-blocked");
  }

  try {
    const response = await fetch(url, { cache: "no-store", redirect: "follow" });
    const html = await response.text();
    const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim();
    const source: DiscoveredSource = {
      id: sourceId,
      sourceUrl: url.toString(),
      fetchedAt: now,
      schoolName: title,
      athleticsHomepage: url.origin,
      robotsAllowed: true,
      status: "discovered"
    };
    await writeFile(resolve(schoolImportsDir, `${sourceId}.json`), `${JSON.stringify(source, null, 2)}\n`, "utf8");

    const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)]
      .map((match) => absoluteUrl(match[1], url.toString()))
      .filter((href) => href && href.startsWith(url.origin))
      .filter((href, index, list) => list.indexOf(href) === index)
      .slice(0, 80);

    const linkRecords: DiscoveredLink[] = hrefs.map((href) => {
      const linkId = `link-${randomUUID()}`;
      const linkTitle = textBetweenTags(html, href.replace(url.origin, "")) || textBetweenTags(html, href) || new URL(href).pathname.split("/").filter(Boolean).join(" / ") || href;
      const classification = classifyLink(href, linkTitle);
      return {
        id: linkId,
        sourceId,
        url: href,
        title: linkTitle,
        type: classification.type,
        confidence: classification.confidence,
        evidence: classification.evidence,
        fetchedAt: now
      };
    });

    await Promise.all(linkRecords.map((link) => writeFile(resolve(schoolImportsDir, `${link.id}.json`), `${JSON.stringify(link, null, 2)}\n`, "utf8")));
    revalidatePath("/admin/import-school");
    redirect("/admin/import-school?status=discovered");
  } catch {
    const failed: DiscoveredSource = { id: sourceId, sourceUrl: url.toString(), fetchedAt: now, robotsAllowed: true, status: "failed", message: "The public URL could not be fetched." };
    await writeFile(resolve(schoolImportsDir, `${sourceId}.json`), `${JSON.stringify(failed, null, 2)}\n`, "utf8");
    revalidatePath("/admin/import-school");
    redirect("/admin/import-school?status=fetch-failed");
  }
}

export async function importSelectedSchoolLinks(formData: FormData) {
  const selectedLinkIds = formData.getAll("selectedLinkIds").map(String);
  await mkdir(schoolImportsDir, { recursive: true });
  await mkdir(publicImportsDir, { recursive: true });
  const now = new Date().toISOString();
  const links = selectedLinkIds
    .map((id) => {
      const path = resolve(schoolImportsDir, `${id}.json`);
      return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) as DiscoveredLink : null;
    })
    .filter(Boolean) as DiscoveredLink[];

  const runId = `school-import-${randomUUID()}`;
  const result: PublicImportResult = {
    runId,
    sourceUrl: links[0]?.url ?? "selected discovered links",
    fetchedAt: now,
    sourceTitle: "School Import Wizard selected links",
    entities: links.map((link) => ({
      id: `discovered-${link.id}`,
      type: link.type === "roster" ? "player" : link.type === "livestream" ? "stream" : link.type === "schedule" ? "game" : link.type === "coaches" ? "coach" : link.type === "stats" ? "stat" : link.type === "team" ? "team" : "school",
      sourceUrl: link.url,
      sourceRef: link.type,
      fields: [
        { name: "name", value: link.title, attribution: { sourceUrl: link.url, fetchedAt: now, parser: "school-import-wizard-v1", rawSnippet: link.title } },
        { name: "profileUrl", value: link.url, attribution: { sourceUrl: link.url, fetchedAt: now, parser: "school-import-wizard-v1" } }
      ],
      raw: { discoveryType: link.type, confidence: link.confidence, evidence: link.evidence }
    })),
    matches: [],
    reviewQueue: links
      .filter((link) => link.confidence < 0.92)
      .map((link) => ({
        id: `review-${link.id}`,
        importedEntityId: `discovered-${link.id}`,
        reason: "Discovered public page requires admin review before merge or verification.",
        priority: link.confidence < 0.6 ? "high" : "medium",
        decision: "pending_review",
        evidence: { confidence: link.confidence, type: link.type, sourceUrl: link.url }
      })),
    claimRequests: [],
    coachVerificationRequests: []
  };
  await writeFile(resolve(publicImportsDir, `${runId}.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  const session: SchoolImportSession = {
    id: `session-${randomUUID()}`,
    sourceUrl: result.sourceUrl,
    fetchedAt: now,
    selectedLinkIds,
    importedRecords: result.entities.length,
    reviewRecords: result.reviewQueue.length,
    status: "imported"
  };
  await writeFile(resolve(schoolImportsDir, `${session.id}.json`), `${JSON.stringify(session, null, 2)}\n`, "utf8");
  revalidatePath("/admin/import-school");
  revalidatePath("/admin/public-data");
  redirect("/admin/import-school?status=imported");
}

async function writeOperatorReview(item: MediaReviewQueueItem) {
  await writeFile(resolve(operatorDir, `${item.id}.json`), `${JSON.stringify(item, null, 2)}\n`, "utf8");
}

export async function submitOperatorMedia(formData: FormData) {
  await mkdir(operatorDir, { recursive: true });
  await mkdir(operatorUploadDir, { recursive: true });
  const file = formData.get("mediaFile");
  const now = new Date().toISOString();
  let fileName = "";
  let fileUrl = "";
  if (file instanceof File && file.size > 0) {
    if (file.size > 900_000) redirect("/admin/operator?status=upload-too-large");
    fileName = `${randomUUID()}-${safeFileName(file.name)}`;
    await writeFile(resolve(operatorUploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    fileUrl = `/operator-uploads/${fileName}`;
  }
  const media: OperatorMediaUpload = {
    id: `media-${randomUUID()}`,
    title: value(formData, "title"),
    mediaType: value(formData, "mediaType") as OperatorMediaUpload["mediaType"],
    fileName,
    fileUrl,
    attachedToType: value(formData, "attachedToType") as OperatorMediaUpload["attachedToType"],
    attachedToName: value(formData, "attachedToName"),
    visibility: value(formData, "visibility") as OperatorMediaUpload["visibility"],
    sourceLabel: "MyD1 Field Media",
    reviewStatus: "pending_review",
    submittedAt: now,
    tags: value(formData, "tags").split(",").map((tag) => tag.trim()).filter(Boolean)
  };
  await writeFile(resolve(operatorDir, `${media.id}.json`), `${JSON.stringify(media, null, 2)}\n`, "utf8");
  await writeOperatorReview({ id: `review-${media.id}`, itemType: "media", itemId: media.id, title: media.title, sourceLabel: media.sourceLabel, reviewStatus: "pending_review", submittedAt: now });
  revalidatePath("/admin/operator");
  redirect("/admin/operator?status=media-queued");
}

export async function submitOperatorFieldNote(formData: FormData) {
  await mkdir(operatorDir, { recursive: true });
  const now = new Date().toISOString();
  const note: OperatorFieldNote = {
    id: `note-${randomUUID()}`,
    subject: value(formData, "subject"),
    note: value(formData, "note"),
    relatedEntity: value(formData, "relatedEntity"),
    sourceLabel: "MyD1 Field Media",
    reviewStatus: "pending_review",
    submittedAt: now
  };
  await writeFile(resolve(operatorDir, `${note.id}.json`), `${JSON.stringify(note, null, 2)}\n`, "utf8");
  await writeOperatorReview({ id: `review-${note.id}`, itemType: "field_note", itemId: note.id, title: note.subject, sourceLabel: note.sourceLabel, reviewStatus: "pending_review", submittedAt: now });
  revalidatePath("/admin/operator");
  redirect("/admin/operator?status=note-queued");
}

export async function submitOperatorGameUpdate(formData: FormData) {
  await mkdir(operatorDir, { recursive: true });
  const now = new Date().toISOString();
  const game = {
    id: `game-update-${randomUUID()}`,
    gameName: value(formData, "gameName"),
    opponent: value(formData, "opponent"),
    gameDate: value(formData, "gameDate"),
    location: value(formData, "location"),
    status: value(formData, "gameStatus"),
    note: value(formData, "note"),
    sourceLabel: "Field Reported / Pending Review",
    reviewStatus: "pending_review",
    submittedAt: now
  };
  await writeFile(resolve(operatorDir, `${game.id}.json`), `${JSON.stringify(game, null, 2)}\n`, "utf8");
  await writeOperatorReview({ id: `review-${game.id}`, itemType: "field_note", itemId: game.id, title: game.gameName || game.opponent, sourceLabel: "Field Reported / Pending Review", reviewStatus: "pending_review", submittedAt: now });
  revalidatePath("/admin/operator");
  redirect("/admin/operator?status=game-queued");
}

export async function submitOperatorStatReport(formData: FormData) {
  await mkdir(operatorDir, { recursive: true });
  const now = new Date().toISOString();
  const stat: OperatorStatReport = {
    id: `stat-${randomUUID()}`,
    playerName: value(formData, "playerName"),
    gameName: value(formData, "gameName"),
    metric: value(formData, "metric"),
    value: value(formData, "statValue"),
    note: value(formData, "note"),
    sourceLabel: "Field Reported / Pending Review",
    reviewStatus: "pending_review",
    submittedAt: now
  };
  await writeFile(resolve(operatorDir, `${stat.id}.json`), `${JSON.stringify(stat, null, 2)}\n`, "utf8");
  await writeOperatorReview({ id: `review-${stat.id}`, itemType: "stat_report", itemId: stat.id, title: `${stat.playerName} - ${stat.metric}`, sourceLabel: stat.sourceLabel, reviewStatus: "pending_review", submittedAt: now });
  revalidatePath("/admin/operator");
  redirect("/admin/operator?status=stat-queued");
}

export async function recordOperatorReviewDecision(formData: FormData) {
  await mkdir(operatorDir, { recursive: true });
  const now = new Date().toISOString();
  const publication: ContentPublicationRecord = {
    id: `publication-${randomUUID()}`,
    itemId: value(formData, "itemId"),
    itemType: value(formData, "itemType") as ContentPublicationRecord["itemType"],
    publishedTo: value(formData, "publishedTo") as ContentPublicationRecord["publishedTo"],
    status: value(formData, "action") === "approve" ? "published" : "rejected",
    actionLog: [{ action: value(formData, "action"), actor: "admin", occurredAt: now, note: value(formData, "note") }]
  };
  await writeFile(resolve(operatorDir, `${publication.id}.json`), `${JSON.stringify(publication, null, 2)}\n`, "utf8");
  revalidatePath("/admin/operator");
  redirect("/admin/operator?status=review-recorded");
}
