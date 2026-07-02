import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

const allowedRoles = new Set(["athlete", "family", "coach", "recruiter", "media", "organization", "admin"]);

async function readRoleWorkspaceState(role: string) {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "role-workspaces.json");
    const data = JSON.parse(await readFile(filePath, "utf8")) as Record<string, Record<string, unknown>>;
    return data[role] ?? {};
  } catch {
    return {};
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: "Unknown role" }, { status: 404 });
  }

  const state = await readRoleWorkspaceState(role);
  return NextResponse.json({ role, ...state });
}
