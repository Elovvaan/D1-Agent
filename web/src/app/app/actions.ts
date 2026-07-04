"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const APP_COOKIE = "myd1_app_session";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAppUser(formData: FormData) {
  const fullName = text(formData, "fullName") || "MYD1 Athlete";
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const city = text(formData, "city");
  const now = new Date().toISOString();
  const athlete = { id: `app-athlete-${Date.now()}`, fullName, email, phone, city, createdAt: now, updatedAt: now };
  await appendUserState("app-athletes.json", athlete, 1000);
  const cookieStore = await cookies();
  cookieStore.set(APP_COOKIE, JSON.stringify({ fullName, email, phone, city, signedInAt: now }), { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  redirect("/app");
}

export async function signOutAppUser() {
  const cookieStore = await cookies();
  cookieStore.delete(APP_COOKIE);
  redirect("/app/sign-in");
}
