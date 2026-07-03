"use server";

import { randomUUID } from "node:crypto";
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

async function saveUpload(file: File | null, ownerKey: string, kind: "thumbnail" | "video") {
  if (!(file instanceof File) || file.size === 0) return "";
  const isVideo = kind === "video";
  if (isVideo && !file.type.startsWith("video/")) return "";
  if (!isVideo && !file.type.startsWith("image/")) return "";
  if (isVideo && file.size > MAX_VIDEO_BYTES) return "";
  if (!isVideo && file.size > MAX_IMAGE_BYTES) return "";

  const safeName = `${ownerKey}-${kind}-${Date.now()}-${cleanFileName(file.name)}`;
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
    createdAt: now,
    updatedAt: now
  };

  const root = resolve(process.cwd(), "..", "data", "user-state");
  await mkdir(root, { recursive: true });
  const existing = await readGames();
  await writeFile(resolve(root, "games.json"), `${JSON.stringify({ items: [record, ...(existing.items ?? [])] }, null, 2)}\n`, "utf8");

  revalidatePath("/games");
  revalidatePath(`/games/${id}`);
  revalidatePath("/operations");
  redirect(`/operations?tab=games&status=game-saved&game=${encodeURIComponent(id)}`);
}
