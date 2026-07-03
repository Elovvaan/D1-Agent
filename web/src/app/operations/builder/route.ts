import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendUserState } from "@/lib/data/platform-storage";

function v(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = v(formData, "name");
  const purpose = v(formData, "purpose");
  if (!name || !purpose) return NextResponse.redirect(new URL("/operations/ai-builder?status=missing-required", request.url));

  await appendUserState("builder-items.json", {
    id: `builder-${randomUUID()}`,
    name,
    purpose,
    status: v(formData, "status") || "draft",
    runWhen: v(formData, "runWhen"),
    inputs: v(formData, "inputs"),
    steps: v(formData, "steps"),
    output: v(formData, "output"),
    notes: v(formData, "rules"),
    createdAt: new Date().toISOString()
  }, 100);

  return NextResponse.redirect(new URL("/operations/ai-builder?status=saved", request.url));
}
