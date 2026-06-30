"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { D1Role } from "@d1/shared";

const sessionDir = resolve(process.cwd(), "..", "data", "session");
const usersPath = resolve(sessionDir, "users.json");
const currentUserPath = resolve(sessionDir, "current-user.json");
const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "media_partner", "admin"]);

type DevUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: D1Role;
  createdAt: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function readUsers(): Promise<DevUser[]> {
  if (!existsSync(usersPath)) return [];
  return JSON.parse(await readFile(usersPath, "utf8")) as DevUser[];
}

function safeNextPath(path: string, role: D1Role) {
  if (path.startsWith("/")) return path;
  if (role === "athlete") return "/onboarding/athlete";
  if (role === "coach") return "/coach";
  if (role === "recruiter") return "/recruiter";
  if (role === "media_partner") return "/media";
  return "/admin/import-school";
}

async function persistSession(user: DevUser) {
  await mkdir(sessionDir, { recursive: true });
  await writeFile(currentUserPath, `${JSON.stringify(user, null, 2)}\n`, "utf8");
  const cookieStore = await cookies();
  cookieStore.set("d1_role", user.role, { path: "/", sameSite: "lax" });
  cookieStore.set("d1_user", user.id, { path: "/", sameSite: "lax" });
}

export async function submitDevAuth(formData: FormData) {
  const intent = value(formData, "intent");
  const firstName = value(formData, "firstName");
  const lastName = value(formData, "lastName");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const role = value(formData, "role") as D1Role;
  const next = value(formData, "next");

  if (!roles.has(role)) redirect(`/sign-in?status=invalid-role`);
  if (!email || !password) redirect(`/sign-in?role=${role}&next=${encodeURIComponent(next)}&status=missing-fields`);

  await mkdir(sessionDir, { recursive: true });
  const users = await readUsers();

  if (intent === "login") {
    const existing = users.find((user) => user.email === email && user.role === role);
    if (!existing) redirect(`/sign-in?role=${role}&next=${encodeURIComponent(next)}&status=login-not-found`);
    await persistSession(existing);
    redirect(safeNextPath(next, existing.role));
  }

  if (!firstName || !lastName) redirect(`/sign-in?role=${role}&next=${encodeURIComponent(next)}&status=missing-name`);
  if (password !== confirmPassword) redirect(`/sign-in?role=${role}&next=${encodeURIComponent(next)}&status=password-mismatch`);
  if (users.some((user) => user.email === email && user.role === role)) redirect(`/sign-in?role=${role}&next=${encodeURIComponent(next)}&status=account-exists`);

  const user: DevUser = {
    id: `dev-user-${randomUUID()}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    role,
    createdAt: new Date().toISOString()
  };

  await writeFile(usersPath, `${JSON.stringify([...users, user], null, 2)}\n`, "utf8");
  await persistSession(user);
  redirect(safeNextPath(next, role));
}
