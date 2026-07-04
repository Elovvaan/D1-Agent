"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendUserState } from "@/lib/data/platform-storage";

const LOCKED_IN_EVENTS_FILE = "locked-in-events.json";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function eventPayload(formData: FormData, fallbackStatus?: string) {
  const now = new Date().toISOString();
  const id = value(formData, "eventId") || `locked-event-${randomUUID()}`;
  return {
    id,
    title: value(formData, "title"),
    sport: value(formData, "sport"),
    format: value(formData, "format"),
    season: value(formData, "season"),
    organizer: value(formData, "organizer"),
    description: value(formData, "description"),
    dateLabel: value(formData, "dateLabel"),
    startTime: value(formData, "startTime"),
    endTime: value(formData, "endTime"),
    registrationDeadline: value(formData, "registrationDeadline"),
    checkInTime: value(formData, "checkInTime"),
    venue: value(formData, "venue"),
    court: value(formData, "court"),
    address: value(formData, "address"),
    mapUrl: value(formData, "mapUrl"),
    environment: value(formData, "environment"),
    teamLimit: numberValue(formData, "teamLimit"),
    waitlistLimit: numberValue(formData, "waitlistLimit"),
    entryFee: numberValue(formData, "entryFee"),
    registrationStatus: value(formData, "registrationStatus") || "open",
    visibility: value(formData, "visibility") || "public",
    prizePool: numberValue(formData, "prizePool"),
    prizeBreakdown: value(formData, "prizeBreakdown"),
    sponsorContribution: numberValue(formData, "sponsorContribution"),
    addedMoney: numberValue(formData, "addedMoney"),
    awards: value(formData, "awards"),
    primaryColor: value(formData, "primaryColor") || "#000000",
    secondaryColor: value(formData, "secondaryColor") || "#8CFF00",
    accentColor: value(formData, "accentColor") || "#F2C200",
    rules: value(formData, "rules"),
    status: value(formData, "status") || fallbackStatus || "draft",
    updatedAt: now
  };
}

export async function saveLockedInEvent(formData: FormData) {
  const payload = eventPayload(formData);
  await appendUserState(LOCKED_IN_EVENTS_FILE, payload, 1000);
  revalidatePath("/operations/events");
  revalidatePath("/locked-in");
  revalidatePath("/locked-in/register");
  redirect(`/operations/events?event=${payload.id}&status=event-saved`);
}

export async function publishLockedInEvent(formData: FormData) {
  const payload = eventPayload(formData, "published");
  await appendUserState(LOCKED_IN_EVENTS_FILE, { ...payload, status: "published" }, 1000);
  revalidatePath("/operations/events");
  revalidatePath("/locked-in");
  revalidatePath("/locked-in/register");
  redirect(`/operations/events?event=${payload.id}&status=event-published`);
}

export async function archiveLockedInEvent(formData: FormData) {
  const id = value(formData, "eventId");
  if (!id) redirect("/operations/events?status=missing-event");
  await appendUserState(LOCKED_IN_EVENTS_FILE, { id, status: "archived", updatedAt: new Date().toISOString() }, 1000);
  revalidatePath("/operations/events");
  revalidatePath("/locked-in");
  revalidatePath("/locked-in/register");
  redirect("/operations/events?status=event-archived");
}

export async function duplicateLockedInEvent(formData: FormData) {
  const payload = eventPayload(formData, "draft");
  const id = `locked-event-${randomUUID()}`;
  await appendUserState(LOCKED_IN_EVENTS_FILE, { ...payload, id, title: `${payload.title || "Untitled Event"} Copy`, status: "draft", updatedAt: new Date().toISOString() }, 1000);
  revalidatePath("/operations/events");
  redirect(`/operations/events?event=${id}&status=event-duplicated`);
}
