import Link from "next/link";
import { cookies } from "next/headers";
import { Archive, CalendarDays, CheckCircle2, Clock3, Copy, DollarSign, Eye, MapPin, Plus, Save, Shirt, Trophy, Users } from "lucide-react";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { signInOperator } from "../actions";
import { archiveLockedInEvent, duplicateLockedInEvent, publishLockedInEvent, saveLockedInEvent } from "./actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type EventStatus = "draft" | "published" | "live" | "completed" | "closed" | "archived";

type LockedInEvent = {
  id?: string;
  title?: string;
  sport?: string;
  format?: string;
  season?: string;
  organizer?: string;
  description?: string;
  dateLabel?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  checkInTime?: string;
  venue?: string;
  court?: string;
  address?: string;
  mapUrl?: string;
  environment?: string;
  teamLimit?: number;
  waitlistLimit?: number;
  entryFee?: number;
  registrationStatus?: string;
  visibility?: string;
  prizePool?: number;
  prizeBreakdown?: string;
  sponsorContribution?: number;
  addedMoney?: number;
  awards?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  rules?: string;
  status?: EventStatus;
  updatedAt?: string;
};

type LockedInTeam = {
  id?: string;
  eventId?: string;
  teamName?: string;
  captainName?: string;
  status?: string;
  uniformChoice?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  seed?: number;
};

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function latestEvents() {
  const rows = readItems<LockedInEvent>("locked-in-events.json");
  const map = new Map<string, LockedInEvent>();
  for (const row of rows) {
    const id = row.id;
    if (!id) continue;
    map.set(id, { ...(map.get(id) ?? {}), ...row });
  }
  return [...map.values()].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
}

function teamsForEvent(eventId?: string) {
  if (!eventId) return [] as LockedInTeam[];
  return readItems<LockedInTeam>("locked-in-teams.json").filter((team) => team.eventId === eventId);
}

function money(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return String(value);
}

function countBy(events: LockedInEvent[], status: EventStatus) {
  return events.filter((event) => (event.status ?? "draft") === status).length;
}

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Events</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Operations</button></form></div></main>;
}

function Input({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue?: string | number; type?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-11 rounded-2xl border border-white/10 bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name={name} type={type} defaultValue={defaultValue ?? ""} /></label>;
}

function TextArea({ label, name, defaultValue, rows = 4 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><textarea rows={rows} className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name={name} defaultValue={defaultValue ?? ""} /></label>;
}

function Select({ label, name, value, options }: { label: string; name: string; value?: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select className="min-h-11 rounded-2xl border border-white/10 bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name={name} defaultValue={value ?? options[0]}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ColorInput({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  const value = defaultValue || "#F2C200";
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><span className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white px-3"><input type="color" name={name} defaultValue={value} className="h-8 w-12 cursor-pointer rounded-xl border-0 bg-transparent" /><span className="text-xs font-black text-[#061331]">{value}</span></span></label>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{value}</div><p className="text-xs font-black uppercase text-[#C8D6FF]">{label}</p></div>;
}

function EventHiddenFields({ event }: { event: LockedInEvent }) {
  return <><input type="hidden" name="eventId" value={event.id ?? ""} /><input type="hidden" name="title" value={event.title ?? ""} /><input type="hidden" name="sport" value={event.sport ?? ""} /><input type="hidden" name="format" value={event.format ?? ""} /><input type="hidden" name="season" value={event.season ?? ""} /><input type="hidden" name="organizer" value={event.organizer ?? ""} /><input type="hidden" name="description" value={event.description ?? ""} /><input type="hidden" name="dateLabel" value={event.dateLabel ?? ""} /><input type="hidden" name="startTime" value={event.startTime ?? ""} /><input type="hidden" name="endTime" value={event.endTime ?? ""} /><input type="hidden" name="registrationDeadline" value={event.registrationDeadline ?? ""} /><input type="hidden" name="checkInTime" value={event.checkInTime ?? ""} /><input type="hidden" name="venue" value={event.venue ?? ""} /><input type="hidden" name="court" value={event.court ?? ""} /><input type="hidden" name="address" value={event.address ?? ""} /><input type="hidden" name="mapUrl" value={event.mapUrl ?? ""} /><input type="hidden" name="environment" value={event.environment ?? ""} /><input type="hidden" name="teamLimit" value={event.teamLimit ?? ""} /><input type="hidden" name="waitlistLimit" value={event.waitlistLimit ?? ""} /><input type="hidden" name="entryFee" value={event.entryFee ?? ""} /><input type="hidden" name="registrationStatus" value={event.registrationStatus ?? ""} /><input type="hidden" name="visibility" value={event.visibility ?? ""} /><input type="hidden" name="prizePool" value={event.prizePool ?? ""} /><input type="hidden" name="prizeBreakdown" value={event.prizeBreakdown ?? ""} /><input type="hidden" name="sponsorContribution" value={event.sponsorContribution ?? ""} /><input type="hidden" name="addedMoney" value={event.addedMoney ?? ""} /><input type="hidden" name="awards" value={event.awards ?? ""} /><input type="hidden" name="primaryColor" value={event.primaryColor ?? "#000000"} /><input type="hidden" name="secondaryColor" value={event.secondaryColor ?? "#8CFF00"} /><input type="hidden" name="accentColor" value={event.accentColor ?? "#F2C200"} /><input type="hidden" name="rules" value={event.rules ?? ""} /></>;
}

export default async function OperationsEventsPage({ searchParams }: { searchParams?: Promise<{ event?: string; status?: string }> }) {
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;

  const params = searchParams ? await searchParams : {};
  const events = latestEvents();
  const selected = events.find((event) => event.id === params.event) ?? events.find((event) => event.status !== "archived") ?? {};
  const eventTeams = teamsForEvent(selected.id);
  const confirmedTeams = eventTeams.filter((team) => team.status === "confirmed");
  const pendingTeams = eventTeams.filter((team) => team.status === "pending" || !team.status);
  const waitlistTeams = eventTeams.filter((team) => team.status === "waitlist");
  const builderSteps = [
    { label: "Details", done: Boolean(selected.title && selected.sport && selected.format) },
    { label: "Schedule", done: Boolean(selected.dateLabel && selected.startTime) },
    { label: "Venue", done: Boolean(selected.venue || selected.address) },
    { label: "Registration", done: Boolean(selected.teamLimit && selected.entryFee !== undefined) },
    { label: "Prize", done: Boolean(selected.prizePool || selected.awards) },
    { label: "Branding", done: Boolean(selected.primaryColor && selected.secondaryColor) },
    { label: "Rules", done: Boolean(selected.rules) },
    { label: "Publish", done: selected.status === "published" || selected.status === "live" }
  ];

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#061331]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MYD1 League Operations</p><h1 className="text-3xl font-black">Events</h1></div><div className="flex flex-wrap gap-2"><Link href="/operations" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white">Operations</Link><Link href="/locked-in" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white"><Eye className="inline" size={16} /> Public</Link><Link href="/operations/events" className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]"><Plus className="inline" size={16} /> New Event</Link></div></div></header>

      <div className="mx-auto grid max-w-[1800px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)_420px] lg:px-8">
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start"><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-3"><p className="px-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Event Board</p><div className="mt-3 grid gap-2"><Stat icon={CalendarDays} label="All Events" value={events.length} /><Stat icon={CheckCircle2} label="Published" value={countBy(events, "published")} /><Stat icon={Archive} label="Archived" value={countBy(events, "archived")} /></div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-3"><p className="px-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Events</p><div className="mt-3 grid gap-2">{events.length ? events.map((event) => <Link key={event.id} href={`/operations/events?event=${event.id}`} className={`rounded-2xl border px-3 py-3 text-sm font-black ${selected.id === event.id ? "border-[#F2C200] bg-[#F2C200] text-[#061331]" : "border-white/10 bg-[#071A43] text-white"}`}><span className="block truncate">{event.title || "Untitled Event"}</span><span className="mt-1 block text-[10px] uppercase opacity-70">{event.status || "draft"} · {event.dateLabel || "No date"}</span></Link>) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#C8D6FF]">No events yet. Use the builder to create the first one.</div>}</div></div></aside>

        <section className="min-w-0 rounded-[34px] border border-white/10 bg-[#071A43] p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Event Builder</p><h2 className="text-2xl font-black">{selected.id ? selected.title || "Untitled Event" : "New Event"}</h2></div>{params.status ? <div className="rounded-2xl border border-[#8CFF00]/35 bg-[#8CFF00]/10 px-4 py-2 text-sm font-black text-[#8CFF00]">{params.status}</div> : null}</div><div className="mb-5 grid gap-2 md:grid-cols-4 xl:grid-cols-8">{builderSteps.map((step, index) => <div key={step.label} className={`rounded-2xl border p-3 ${step.done ? "border-[#8CFF00]/35 bg-[#8CFF00]/10" : "border-white/10 bg-white/[0.05]"}`}><div className="text-xs font-black uppercase text-[#F2C200]">{index + 1}</div><div className="mt-1 text-sm font-black">{step.label}</div><div className="mt-1 text-[10px] font-black uppercase text-[#C8D6FF]">{step.done ? "Done" : "Needed"}</div></div>)}</div>

          <form action={saveLockedInEvent} className="grid gap-5"><input type="hidden" name="eventId" value={selected.id ?? ""} /><div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4"><p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">1. Basic Information</p><div className="grid gap-4 md:grid-cols-2"><Input label="Event Title" name="title" defaultValue={selected.title} /><Input label="Season" name="season" defaultValue={selected.season} /><Select label="Sport" name="sport" value={selected.sport} options={["Basketball", "Flag Football", "Soccer", "Volleyball", "Track", "Skill Challenge"]} /><Select label="Competition Type" name="format" value={selected.format} options={["3v3", "1v1", "5v5", "Team Tournament", "Skill Challenge", "Combine Drill", "Position Battle"]} /><Input label="Organizer" name="organizer" defaultValue={selected.organizer} /><Select label="Status" name="status" value={selected.status} options={["draft", "published", "live", "completed", "closed", "archived"]} /></div><div className="mt-4"><TextArea label="Description" name="description" defaultValue={selected.description} /></div></div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4"><p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">2. Schedule + Venue</p><div className="grid gap-4 md:grid-cols-2"><Input label="Date Label" name="dateLabel" defaultValue={selected.dateLabel} /><Input label="Start Time" name="startTime" defaultValue={selected.startTime} /><Input label="End Time" name="endTime" defaultValue={selected.endTime} /><Input label="Registration Deadline" name="registrationDeadline" defaultValue={selected.registrationDeadline} /><Input label="Check-in Time" name="checkInTime" defaultValue={selected.checkInTime} /><Input label="Venue" name="venue" defaultValue={selected.venue} /><Input label="Court / Field" name="court" defaultValue={selected.court} /><Select label="Indoor / Outdoor" name="environment" value={selected.environment} options={["Outdoor", "Indoor", "Hybrid"]} /><Input label="Address" name="address" defaultValue={selected.address} /><Input label="Google Maps Link" name="mapUrl" defaultValue={selected.mapUrl} /></div></div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4"><p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">3. Registration + Prize</p><div className="grid gap-4 md:grid-cols-2"><Input label="Team Limit" name="teamLimit" type="number" defaultValue={selected.teamLimit} /><Input label="Waitlist Limit" name="waitlistLimit" type="number" defaultValue={selected.waitlistLimit} /><Input label="Entry Fee" name="entryFee" type="number" defaultValue={money(selected.entryFee)} /><Input label="Prize Pool" name="prizePool" type="number" defaultValue={money(selected.prizePool)} /><Input label="Sponsor Contribution" name="sponsorContribution" type="number" defaultValue={money(selected.sponsorContribution)} /><Input label="Added Money" name="addedMoney" type="number" defaultValue={money(selected.addedMoney)} /><Select label="Registration Status" name="registrationStatus" value={selected.registrationStatus} options={["open", "closed", "invite-only"]} /><Select label="Visibility" name="visibility" value={selected.visibility} options={["public", "private"]} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><TextArea label="Prize Breakdown" name="prizeBreakdown" defaultValue={selected.prizeBreakdown} /><TextArea label="Awards" name="awards" defaultValue={selected.awards} /></div></div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4"><p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">4. Branding + Rules</p><div className="grid gap-4 md:grid-cols-3"><ColorInput label="Primary Color" name="primaryColor" defaultValue={selected.primaryColor || "#000000"} /><ColorInput label="Secondary Color" name="secondaryColor" defaultValue={selected.secondaryColor || "#8CFF00"} /><ColorInput label="Accent Color" name="accentColor" defaultValue={selected.accentColor || "#F2C200"} /></div><div className="mt-4"><TextArea label="Rules" name="rules" defaultValue={selected.rules} rows={6} /></div></div>

            <div className="flex flex-wrap gap-3"><button className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save Event</button><button formAction={publishLockedInEvent} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#8CFF00] px-5 text-sm font-black text-[#061331]" type="submit"><CheckCircle2 size={16} /> Publish</button></div></form>
        </section>

        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start"><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Event Actions</p><div className="mt-4 grid gap-2"><form action={duplicateLockedInEvent}><EventHiddenFields event={selected} /><button className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#071A43] px-4 text-sm font-black text-white" type="submit"><Copy className="inline" size={16} /> Duplicate Event</button></form><form action={archiveLockedInEvent}><input type="hidden" name="eventId" value={selected.id ?? ""} /><button className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#071A43] px-4 text-sm font-black text-white" type="submit"><Archive className="inline" size={16} /> Archive Event</button></form></div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Teams</p><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-[#071A43] p-3"><Users className="text-[#F2C200]" /><p className="mt-2 text-2xl font-black">{confirmedTeams.length}</p><p className="text-[10px] font-black uppercase text-[#C8D6FF]">Confirmed</p></div><div className="rounded-2xl bg-[#071A43] p-3"><Clock3 className="text-[#F2C200]" /><p className="mt-2 text-2xl font-black">{pendingTeams.length}</p><p className="text-[10px] font-black uppercase text-[#C8D6FF]">Pending</p></div><div className="rounded-2xl bg-[#071A43] p-3"><Trophy className="text-[#F2C200]" /><p className="mt-2 text-2xl font-black">{waitlistTeams.length}</p><p className="text-[10px] font-black uppercase text-[#C8D6FF]">Waitlist</p></div></div><div className="mt-4 grid gap-2">{eventTeams.length ? eventTeams.map((team) => <div key={team.id || team.teamName} className="rounded-2xl border border-white/10 bg-[#071A43] p-3"><div className="flex items-center justify-between gap-2"><p className="font-black">{team.teamName || "Unnamed Team"}</p><span className="rounded-full bg-white/[0.12] px-2 py-1 text-[10px] font-black uppercase">{team.status || "pending"}</span></div><p className="mt-1 text-xs font-semibold text-[#C8D6FF]">{team.captainName || "No captain"} · {team.uniformChoice || "Uniform not set"}</p></div>) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#C8D6FF]">No teams registered for this event yet.</div>}</div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Uniforms</p><div className="mt-4 rounded-2xl border border-white/10 bg-[#071A43] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Team colors, kit choices, jersey sizes, shorts sizes, names, and numbers stay tied to the roster for order sheets.</p></div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Public Sync</p><div className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-[#C8D6FF]"><div className="rounded-2xl border border-white/10 bg-[#071A43] p-3"><CalendarDays className="inline text-[#F2C200]" size={16} /> Published events feed Upcoming Events.</div><div className="rounded-2xl border border-white/10 bg-[#071A43] p-3"><Trophy className="inline text-[#F2C200]" size={16} /> Locked In can use the same event record.</div><div className="rounded-2xl border border-white/10 bg-[#071A43] p-3"><DollarSign className="inline text-[#F2C200]" size={16} /> Entry fee and prize pool stay in one place.</div><div className="rounded-2xl border border-white/10 bg-[#071A43] p-3"><MapPin className="inline text-[#F2C200]" size={16} /> Venue and schedule are editable here.</div></div></div></aside>
      </div>
    </main>
  );
}
