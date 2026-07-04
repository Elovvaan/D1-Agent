"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const APP_COOKIE = "myd1_app_session";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function setAppCookiePayload(payload: Record<string, string>) {
  return { ...payload, signedInAt: new Date().toISOString() };
}

export async function signInAppUser(formData: FormData) {
  const fullName = text(formData, "fullName") || "MYD1 Athlete";
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const city = text(formData, "city");
  const now = new Date().toISOString();
  const athlete = { id: `app-athlete-${Date.now()}`, fullName, email, phone, city, role: "athlete", accountMode: "quick-sign-in", createdAt: now, updatedAt: now };
  await appendUserState("app-athletes.json", athlete, 1000);
  const cookieStore = await cookies();
  cookieStore.set(APP_COOKIE, JSON.stringify(setAppCookiePayload({ fullName, email, phone, city, role: "athlete" })), { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  redirect("/app");
}

export async function signUpAthlete(formData: FormData) {
  const now = new Date().toISOString();
  const fullName = text(formData, "fullName") || "MYD1 Athlete";
  const displayName = text(formData, "displayName") || fullName;
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const city = text(formData, "city");
  const ageGroup = text(formData, "ageGroup");
  const sport = text(formData, "sport");
  const position = text(formData, "position");
  const height = text(formData, "height");
  const dominantSide = text(formData, "dominantSide");
  const playStyle = text(formData, "playStyle");
  const lookingForTeam = text(formData, "lookingForTeam");
  const athlete = {
    id: `app-athlete-${Date.now()}`,
    fullName,
    displayName,
    email,
    phone,
    city,
    ageGroup,
    sport,
    position,
    height,
    dominantSide,
    playStyle,
    lookingForTeam,
    role: "athlete",
    accountMode: "athlete-sign-up",
    profileStatus: "active",
    createdAt: now,
    updatedAt: now
  };
  await appendUserState("app-athletes.json", athlete, 1000);
  const cookieStore = await cookies();
  cookieStore.set(APP_COOKIE, JSON.stringify(setAppCookiePayload({ fullName, displayName, email, phone, city, sport, position, role: "athlete" })), { path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  redirect("/app");
}

export async function signOutAppUser() {
  const cookieStore = await cookies();
  cookieStore.delete(APP_COOKIE);
  redirect("/app/sign-in");
}
