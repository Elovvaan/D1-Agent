"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const OPERATOR_SCHOOLS_FILE = "operator-schools.json";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeStateCode(value: string) {
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "US";
}

export async function saveOperatorSchool(formData: FormData) {
  const stateCode = normalizeStateCode(value(formData, "stateCode"));
  const name = value(formData, "name");
  const now = new Date().toISOString();

  if (!name) {
    redirect(`/operations/directory?state=${stateCode}&status=school-name-required`);
  }

  await appendUserState(OPERATOR_SCHOOLS_FILE, {
    id: `operator-school-${randomUUID()}`,
    name,
    stateCode,
    city: value(formData, "city"),
    district: value(formData, "district"),
    type: value(formData, "type") || "School",
    mascot: value(formData, "mascot"),
    website: value(formData, "website"),
    notes: value(formData, "notes"),
    status: "published",
    createdAt: now,
    updatedAt: now
  }, 2000);

  revalidatePath("/operations");
  revalidatePath("/operations/directory");
  revalidatePath("/schools");
  revalidatePath(`/schools/${stateCode.toLowerCase()}`);
  redirect(`/operations/directory?state=${stateCode}&status=school-saved`);
}
