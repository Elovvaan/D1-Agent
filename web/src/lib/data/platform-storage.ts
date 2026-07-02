import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export function platformDataRoot() {
  return process.env.MYD1_DATA_DIR || resolve(process.cwd(), "..", "data");
}

export function platformDataPath(...parts: string[]) {
  return resolve(platformDataRoot(), ...parts);
}

export function userStatePath(fileName: string) {
  return platformDataPath("user-state", fileName);
}

export function publicActionsPath(fileName?: string) {
  return fileName ? platformDataPath("public-actions", fileName) : platformDataPath("public-actions");
}

export function importsPath(fileName?: string) {
  return fileName ? platformDataPath("imports", fileName) : platformDataPath("imports");
}

export function readJsonSync<T>(filePath: string, fallback: T): T {
  try {
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function hasFile(filePath: string) {
  return existsSync(filePath);
}

export function listFilesSync(dirPath: string) {
  try {
    if (!existsSync(dirPath)) return [] as string[];
    return readdirSync(dirPath);
  } catch {
    return [] as string[];
  }
}

export async function appendUserState(fileName: string, entry: Record<string, unknown>, limit = 300) {
  const dir = platformDataPath("user-state");
  const filePath = userStatePath(fileName);
  await mkdir(dir, { recursive: true });
  const existing = await readJson<{ items?: Array<Record<string, unknown>> }>(filePath, { items: [] });
  const items = Array.isArray(existing.items) ? existing.items : [];
  await writeFile(filePath, `${JSON.stringify({ items: [entry, ...items].slice(0, limit) }, null, 2)}\n`, "utf8");
}

export async function writePublicAction(id: string, payload: Record<string, unknown>) {
  const dir = publicActionsPath();
  await mkdir(dir, { recursive: true });
  await writeFile(publicActionsPath(`${id}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function directorySizeSync(relativeOrAbsolutePath: string) {
  try {
    const dir = relativeOrAbsolutePath.startsWith("/") ? relativeOrAbsolutePath : resolve(process.cwd(), relativeOrAbsolutePath);
    if (!existsSync(dir)) return 0;
    return readdirSync(dir).reduce((total, file) => total + statSync(resolve(dir, file)).size, 0);
  } catch {
    return 0;
  }
}
