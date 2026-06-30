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

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function userStatePath(fileName: string) {
  return resolve(process.cwd(), "..", "data", "user-state", fileName);
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function appendUserState(fileName: string, entry: Record<string, unknown>) {
  const dir = resolve(process.cwd(), "..", "data", "user-state");
  const filePath = userStatePath(fileName);
  await mkdir(dir, { recursive: true });
  const existing = await readJsonFile<{ items?: Array<Record<string, unknown>> }>(filePath, { items: [] });
  const items = Array.isArray(existing.items) ? existing.items : [];
  await writeFile(filePath, `${JSON.stringify({ items: [entry, ...items].slice(0, 200) }, null, 2)}\n`, "utf8");
}

async function audit(action: string, payload: Record<string, unknown>) {
  await appendUserState(OPERATOR_AUDIT_FILE, {
    id: `operator-${randomUUID()}`,
    action,
    occurredAt: new Date().toISOString(),
    ...payload
  });
}

export async function signInOperator(formData: FormData) {
  const configuredCode = process.env.MYD1_OPERATOR_ACCESS_CODE;
  const submittedCode = value(formData, "accessCode");

  if (!configuredCode) {
    redirect("/operations?status=operator-code-missing");
  }

  if (submittedCode !== configuredCode) {
    await audit("operator-sign-in-failed", { reason: "invalid-code" });
    redirect("/operations?status=operator-denied");
  }

  const cookieStore = await cookies();
  cookieStore.set(OPERATOR_COOKIE, OPERATOR_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/operations",
    maxAge: 60 * 60 * 8
  });

  await audit("operator-sign-in", { result: "success" });
  redirect("/operations?status=operator-ready");
}

export async function signOutOperator() {
  const cookieStore = await cookies();
  cookieStore.delete(OPERATOR_COOKIE);
  await audit("operator-sign-out", { result: "success" });
  redirect("/operations");
}

export async function recordSupportIssue(formData: FormData) {
  const subject = value(formData, "subject");
  const affectedArea = value(formData, "affectedArea");
  const accountType = value(formData, "accountType");
  const detail = value(formData, "detail");
  const severity = value(formData, "severity") || "review";

  await appendUserState(OPERATOR_ISSUES_FILE, {
    id: `issue-${randomUUID()}`,
    subject,
    affectedArea,
    accountType,
    detail,
    severity,
    status: "open",
    createdAt: new Date().toISOString()
  });
  await audit("support-issue-recorded", { subject, affectedArea, accountType, severity });
  redirect("/operations?status=issue-recorded#support");
}

export async function recordInboundMessage(formData: FormData) {
  const senderName = value(formData, "senderName");
  const senderContact = value(formData, "senderContact");
  const source = value(formData, "source") || "email";
  const subject = value(formData, "subject");
  const body = value(formData, "body");

  await appendUserState(OPERATOR_INBOX_FILE, {
    id: `inbound-${randomUUID()}`,
    senderName,
    senderContact,
    source,
    subject,
    body,
    status: "open",
    receivedAt: new Date().toISOString()
  });
  await audit("inbound-message-captured", { source, subject, senderName });
  redirect("/operations?status=inbound-message-recorded#communications");
}

export async function recordViewAsUser(formData: FormData) {
  const userId = value(formData, "userId") || "athlete-jayden-lewis";
  const returnTo = value(formData, "returnTo") || `/athletes/${userId}`;
  await audit("view-as-user", { userId, returnTo });
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}operatorView=1`);
}

export async function recordBuildRoomRequest(formData: FormData) {
  const request = value(formData, "request");
  const area = value(formData, "area");
  await appendUserState(OPERATOR_ISSUES_FILE, {
    id: `build-${randomUUID()}`,
    subject: area || "Build request",
    affectedArea: area,
    accountType: "platform",
    detail: request,
    severity: "build-room",
    status: "open",
    createdAt: new Date().toISOString()
  });
  await audit("build-room-requested", { area });
  redirect("/operations?status=build-request-recorded#build-room");
}
