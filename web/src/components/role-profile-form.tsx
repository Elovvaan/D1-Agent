"use client";

import { useActionState, useEffect, useState } from "react";
import { saveRoleWorkspaceProfile, type RoleProfileDetailsState } from "@/app/actions/role-workspace-actions";
import { competitionDivisionLabel } from "@/lib/athlete-eligibility";

type Role = "athlete" | "family" | "coach" | "recruiter" | "media" | "organization" | "admin";
type Field = { name: string; label: string; textarea?: boolean; type?: string; readOnly?: boolean };
type SavedProfile = Record<string, string | string[]>;
type ProfileResponse = { profile?: SavedProfile };

const forms: Record<Role, { title: string; fields: Field[] }> = {
  athlete: { title: "Athlete profile", fields: [
    { name: "athleteId", label: "Athlete ID", readOnly: true },
    { name: "displayName", label: "Display name" },
    { name: "dateOfBirth", label: "Date of birth", type: "date" },
    { name: "age", label: "Age", readOnly: true },
    { name: "competitionDivision", label: "Competition division", readOnly: true },
    { name: "verifiedAthlete", label: "Verified Athlete", readOnly: true },
    { name: "currentTeam", label: "Current team" },
    { name: "activeWristbandId", label: "Active wristband ID" },
    { name: "lastCheckIn", label: "Last check-in", type: "datetime-local" },
    { name: "eventsPlayed", label: "Events played", type: "number" },
    { name: "weighIns", label: "Weigh-ins", type: "number" },
    { name: "wins", label: "Wins", type: "number" },
    { name: "championships", label: "Championships", type: "number" },
    { name: "city", label: "City" },
    { name: "sport", label: "Sport" },
    { name: "position", label: "Position" },
    { name: "schoolName", label: "School / team" },
    { name: "classYear", label: "Class year" },
    { name: "bio", label: "Bio", textarea: true }
  ] },
  family: { title: "Family profile", fields: [{ name: "displayName", label: "Parent / guardian name" }, { name: "relationship", label: "Relationship" }, { name: "linkedAthlete", label: "Linked athlete" }, { name: "city", label: "City" }, { name: "contactPreference", label: "Contact preference" }, { name: "bio", label: "Notes", textarea: true }] },
  coach: { title: "Coach profile", fields: [{ name: "displayName", label: "Coach name" }, { name: "title", label: "Title" }, { name: "organizationName", label: "School / organization" }, { name: "sport", label: "Sport" }, { name: "teamLevel", label: "Team level" }, { name: "bio", label: "Bio", textarea: true }] },
  recruiter: { title: "Recruiter profile", fields: [{ name: "displayName", label: "Recruiter name" }, { name: "organizationName", label: "Organization" }, { name: "region", label: "Region" }, { name: "sportsCovered", label: "Sports covered" }, { name: "contactEmail", label: "Contact email" }, { name: "bio", label: "Notes", textarea: true }] },
  media: { title: "Media profile", fields: [{ name: "brandName", label: "Media brand" }, { name: "contactName", label: "Contact name" }, { name: "coverageArea", label: "Coverage area" }, { name: "services", label: "Services" }, { name: "website", label: "Website" }, { name: "bio", label: "Brand bio", textarea: true }] },
  organization: { title: "School / organization profile", fields: [{ name: "organizationName", label: "School / organization name" }, { name: "schoolType", label: "Type" }, { name: "city", label: "City" }, { name: "state", label: "State" }, { name: "sportsOffered", label: "Sports offered" }, { name: "mainContact", label: "Main contact" }, { name: "website", label: "Website" }, { name: "bio", label: "Bio", textarea: true }] },
  admin: { title: "Admin profile", fields: [{ name: "displayName", label: "Admin name" }, { name: "adminRole", label: "Admin role" }, { name: "department", label: "Department" }, { name: "coverageArea", label: "Coverage area" }, { name: "contactEmail", label: "Contact email" }, { name: "bio", label: "Notes", textarea: true }] }
};

const initialState: RoleProfileDetailsState = { status: "idle", message: "" };

function read(profile: SavedProfile | undefined, name: string) {
  const value = profile?.[name];
  if (name === "competitionDivision") return competitionDivisionLabel(Array.isArray(value) ? value[0] : String(value ?? ""));
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

export function RoleProfileForm({ role }: { role: Role }) {
  const [state, formAction, isPending] = useActionState(saveRoleWorkspaceProfile, initialState);
  const [profile, setProfile] = useState<SavedProfile | undefined>();
  const [loaded, setLoaded] = useState(false);
  const config = forms[role];

  useEffect(() => {
    let active = true;
    fetch(`/api/role-workspaces/${role}`, { cache: "no-store" })
      .then(async (response): Promise<ProfileResponse> => response.ok ? (await response.json()) as ProfileResponse : {})
      .then((data) => { if (active) setProfile(data.profile ?? {}); })
      .catch(() => { if (active) setProfile({}); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [role, state.status]);

  return <form action={formAction} className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><input type="hidden" name="role" value={role} /><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Role profile</p><h2 className="mt-2 text-2xl font-black text-white">{config.title}</h2><p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Athlete age and division are assigned automatically from date of birth.</p>{loaded ? <div className="mt-5 grid gap-4 md:grid-cols-2">{config.fields.map((field) => <label key={field.name} className={`grid gap-2 text-sm font-black text-white ${field.textarea ? "md:col-span-2" : ""}`}>{field.label}{field.textarea ? <textarea name={field.name} defaultValue={read(profile, field.name)} className="min-h-28 rounded-2xl border border-white/10 bg-[#071A43] px-4 py-3 text-sm font-semibold text-white outline-none" /> : <input name={field.name} defaultValue={read(profile, field.name)} type={field.type ?? "text"} readOnly={field.readOnly} className="rounded-2xl border border-white/10 bg-[#071A43] px-4 py-3 text-sm font-semibold text-white outline-none read-only:opacity-70" />}</label>)}</div> : <div className="mt-5 rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#CAD7FF]">Loading saved profile...</div>}<div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" disabled={isPending || !loaded} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#061331] disabled:opacity-60">{isPending ? "Saving..." : "Save role profile"}</button>{state.message ? <p className={`text-sm font-black ${state.status === "error" ? "text-[#FFB4C2]" : "text-[#B6FFD2]"}`}>{state.message}</p> : null}</div></form>;
}
