"use server";

import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_VIDEO_BYTES = 250 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type GameRecord = {
  id: string;
  state: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  school: string;
  venue: string;
  gameDate: string;
  gameTime: string;
  status: string;
  homeScore: string;
  awayScore: string;
  title: string;
  notes: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishTo: string[];
  createdAt: string;
  updatedAt: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "game";
}

async function readGames() {
  const filePath = resolve(process.cwd(), "..", "data", "user-state", "games.json");
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as { items?: GameRecord[] };
  } catch {
    return { items: [] as GameRecord[] };
  }
}

function hasRailwayR2Config() {
  return Boolean(process.env.RAILWAY_R2_ENDPOINT && process.env.RAILWAY_R2_ACCESS_KEY_ID && process.env.RAILWAY_R2_SECRET_ACCESS_KEY && process.env.RAILWAY_R2_BUCKET && process.env.RAILWAY_R2_PUBLIC_URL);
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function sha256Hex(value: Buffer | string) { return createHash("sha256").update(value).digest("hex"); }
function hmac(key: Buffer | string, value: string) { return createHmac("sha256", key).update(value).digest(); }
function hmacHex(key: Buffer | string, value: string) { return createHmac("sha256", key).update(value).digest("hex"); }
function signingKey(secret: string, dateStamp: string, region: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

async function saveRailwayR2Upload(file: File, safeName: string) {
  const endpoint = String(process.env.RAILWAY_R2_ENDPOINT || "").replace(/\/$/, "");
  const accessKeyId = String(process.env.RAILWAY_R2_ACCESS_KEY_ID || "");
  const secretAccessKey = String(process.env.RAILWAY_R2_SECRET_ACCESS_KEY || "");
  const bucket = String(process.env.RAILWAY_R2_BUCKET || "");
  const publicBase = String(process.env.RAILWAY_R2_PUBLIC_URL || "").replace(/\/$/, "");
  const region = String(process.env.RAILWAY_R2_REGION || "auto");
  const key = `game-media/${safeName}`;
  const body = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const endpointUrl = new URL(endpoint);
  const canonicalUri = `/${encodePathSegment(bucket)}/${key.split("/").map(encodePathSegment).join("/")}`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = `content-type:${contentType}\nhost:${endpointUrl.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = hmacHex(signingKey(secretAccessKey, dateStamp, region), stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(`${endpoint}${canonicalUri}`, { method: "PUT", headers: { Authorization: authorization, "Content-Type": contentType, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate, "Cache-Control": "public, max-age=31536000, immutable" }, body });
  if (!response.ok) throw new Error(`Railway R2 game upload failed (${response.status}). ${await response.text().catch(() => "")}`.trim());
  return `${publicBase}/${key.split("/").map(encodePathSegment).join("/")}`;
}

async function saveUpload(file: File | null, ownerKey: string, kind: "thumbnail" | "video") {
  if (!(file instanceof File) || file.size === 0) return "";
  const isVideo = kind === "video";
  if (isVideo && !file.type.startsWith("video/")) throw new Error("Game video must be a video file.");
  if (!isVideo && !file.type.startsWith("image/")) throw new Error("Game thumbnail must be an image file.");
  if (isVideo && file.size > MAX_VIDEO_BYTES) throw new Error("Game video must be 250 MB or smaller.");
  if (!isVideo && file.size > MAX_IMAGE_BYTES) throw new Error("Game thumbnail must be 10 MB or smaller.");

  const safeName = `${ownerKey}-${kind}-${Date.now()}-${cleanFileName(file.name)}`;
  if (hasRailwayR2Config()) return saveRailwayR2Upload(file, safeName);

  const dir = resolve(process.cwd(), "..", "data", "user-state", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, safeName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${safeName}`;
}

export async function saveGameIntake(formData: FormData) {
  const state = value(formData, "state").toUpperCase();
  const sport = value(formData, "sport");
  const homeTeam = value(formData, "homeTeam");
  const awayTeam = value(formData, "awayTeam");
  const gameDate = value(formData, "gameDate");
  if (!state || !sport || !homeTeam || !awayTeam || !gameDate) {
    redirect("/operations?tab=games&status=game-missing-required");
  }

  const id = `game-${state.toLowerCase()}-${slug(homeTeam)}-vs-${slug(awayTeam)}-${Date.now()}`;
  const ownerKey = id;
  const thumbnailUrl = await saveUpload(formData.get("thumbnailFile") as File | null, ownerKey, "thumbnail");
  const videoUrl = await saveUpload(formData.get("videoFile") as File | null, ownerKey, "video");
  const now = new Date().toISOString();
  const record: GameRecord = {
    id,
    state,
    sport,
    homeTeam,
    awayTeam,
    school: value(formData, "school"),
    venue: value(formData, "venue"),
    gameDate,
    gameTime: value(formData, "gameTime"),
    status: value(formData, "status") || "scheduled",
    homeScore: value(formData, "homeScore"),
    awayScore: value(formData, "awayScore"),
    title: value(formData, "title") || `${homeTeam} vs ${awayTeam}`,
    notes: value(formData, "notes"),
    thumbnailUrl,
    videoUrl,
    publishTo: ["games", ...formData.getAll("publishTo").map(String).filter(Boolean)],
    createdAt: now,
    updatedAt: now
  };

  const root = resolve(process.cwd(), "..", "data", "user-state");
  await mkdir(root, { recursive: true });
  const existing = await readGames();
  await writeFile(resolve(root, "games.json"), `${JSON.stringify({ items: [record, ...(existing.items ?? [])] }, null, 2)}\n`, "utf8");

  revalidatePath("/games");
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/sports");
  revalidatePath("/events");
  revalidatePath("/locked-in");
  revalidatePath(`/games/${id}`);
  revalidatePath("/operations");
  redirect(`/operations?tab=games&status=game-saved&game=${encodeURIComponent(id)}`);
}
