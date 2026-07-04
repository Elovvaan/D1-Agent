import Link from "next/link";
import { ArrowLeft, BadgeCheck, Palette, Shirt, Ticket, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

type LockedInEvent = {
  id?: string;
  title?: string;
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
  entryFee?: number;
  eventPassPrice?: number;
  eventPassIncludes?: string;
  status?: "draft" | "published" | "closed";
};

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function eventLabel(event: LockedInEvent) {
  return [event.title, event.dateLabel, event.timeLabel, event.location].filter(Boolean).join(" — ") || event.id || "Published event";
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none ring-[#8CFF00] focus:ring-2" name={name} type={type} /></label>;
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name={name}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><span className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black px-3"><input className="h-8 w-12 cursor-pointer rounded-lg border-0 bg-transparent" name={name} type="color" defaultValue={defaultValue} /><span className="text-xs font-black uppercase text-white/70">{defaultValue}</span></span></label>;
}

const sports = ["Basketball", "Flag Football", "Football Drills", "Soccer", "Volleyball", "Track", "Skill Challenge"];
const eventTypes = ["Team Tournament", "1v1 Battle", "3v3", "5v5", "Skill Challenge", "Combine Drill", "Position Battle"];
const jerseySizes = ["Youth M", "Youth L", "S", "M", "L", "XL", "2XL", "3XL"];
const uniformOptions = ["Bring My Own", "MY D1 Basic Kit", "MY D1 Elite Kit"];
const registrationTypes = [
  { value: "Free Spectator", title: "Free Spectator", detail: "Free entry to watch. No shirt. No player wristband. Can learn about MYD1 at the booth." },
  { value: "Athlete Registration", title: "Athlete Registration", detail: "Player check-in, athlete profile, team access, bracket eligibility, player wristband, participation badge." },
  { value: "Event Pass", title: "Event Pass", detail: "Admission package with MYD1 shirt, event wristband, faster pickup/check-in, and event perks." }
];

export default function LockedInRegisterPage() {
  const activeEvents = readItems<LockedInEvent>("locked-in-events.json").filter((event) => event.status === "published");
  const entryFeeLabel = activeEvents[0]?.entryFee ? `$${activeEvents[0].entryFee.toFixed(2)} team / uniform add-ons optional` : "Set by selected event / uniform add-ons optional";
  const eventPassLabel = activeEvents[0]?.eventPassPrice ? `$${activeEvents[0].eventPassPrice.toFixed(2)} Event Pass` : "Event pass price set by event";

  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/locked-in" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> Back to Locked In</Link>
          <header className="mt-6 rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#8CFF00]">Locked In Mode</p><h1 className="mt-3 text-4xl font-black uppercase text-[#F2C200]">Event Registration</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Choose how you are entering the event: free spectator, athlete registration, or event pass. Players still check in and receive wristbands at the MYD1 booth.</p></header>
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="rounded-[30px] border border-white/12 bg-[#050505] p-6">
              <div className="grid gap-4 md:grid-cols-5"><div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><Trophy className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">1 Event</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Ticket className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">2 Pass</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">3 Player</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Palette className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">4 Team</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">5 Kit</p></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event</p><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-black text-white"><span>Published Event</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name="event" disabled={activeEvents.length === 0}>{activeEvents.length > 0 ? activeEvents.map((event, index) => <option key={event.id ?? `${eventLabel(event)}-${index}`} value={event.id ?? `${eventLabel(event)}-${index}`}>{eventLabel(event)}</option>) : <option>No active events published</option>}</select></label><label className="grid gap-2 text-sm font-black text-white"><span>Team Entry Fee</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-[#8CFF00] outline-none" readOnly value={entryFeeLabel} /></label></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Registration Type</p><div className="mt-4 grid gap-3 lg:grid-cols-3">{registrationTypes.map((option) => <label key={option.value} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className="flex items-center gap-2 text-sm font-black uppercase text-white"><BadgeCheck size={16} className="text-[#8CFF00]" />{option.title}</span><p className="mt-3 text-xs font-semibold leading-5 text-[#C8D6FF]">{option.detail}</p><input className="mt-4 block" name="registrationType" type="radio" value={option.value} /></label>)}</div><div className="mt-4 rounded-2xl border border-[#F2C200]/25 bg-[#F2C200]/10 p-4 text-sm font-black text-[#F2C200]">{eventPassLabel} · includes shirt + event wristband when configured.</div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport</p><div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Sport" name="sport" options={sports} /><SelectField label="Competition Type" name="eventType" options={eventTypes} /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Person / Player</p><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Display Name / Gamer Tag" name="displayName" /><Field label="Full Name" name="fullName" /><Field label="Phone" name="phone" /><Field label="Email" name="email" type="email" /><Field label="Home City" name="city" /><SelectField label="Shirt Size For Event Pass" name="eventPassShirtSize" options={jerseySizes} /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Identity</p><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Team Name" name="teamName" /><Field label="Captain Name Optional" name="captainName" /><Field label="Team City / Area" name="teamCity" /><SelectField label="Roster Role" name="rosterRole" options={["Captain", "Player", "Free Agent", "Substitute", "Spectator"]} /></div><div className="mt-4 grid gap-4 md:grid-cols-3"><ColorField label="Primary Color" name="primaryColor" defaultValue="#000000" /><ColorField label="Secondary Color" name="secondaryColor" defaultValue="#8CFF00" /><ColorField label="Accent Color" name="accentColor" defaultValue="#F2C200" /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Player Uniform Choice</p><div className="mt-4 grid gap-3 lg:grid-cols-3">{uniformOptions.map((option) => <label key={option} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className="text-sm font-black uppercase text-white">{option}</span><input className="mt-4 block" name="uniformChoice" type="radio" value={option} /></label>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Jersey Size" name="jerseySize" options={jerseySizes} /><SelectField label="Shorts Size" name="shortsSize" options={jerseySizes} /><Field label="Jersey Name" name="jerseyName" /><Field label="Preferred Number" name="preferredNumber" /></div></div>
              <button className="mt-8 min-h-12 w-full rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black" type="button">Submit Registration</button>
            </form>
            <aside className="rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event-Day Issue List</p><div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-white"><div className="rounded-2xl border border-white/10 bg-black p-4">Free Spectator: no shirt, no player wristband.</div><div className="rounded-2xl border border-white/10 bg-black p-4">Athlete: player wristband, check-in, team, bracket, participation badge.</div><div className="rounded-2xl border border-white/10 bg-black p-4">Event Pass: shirt pickup + event wristband.</div><div className="rounded-2xl border border-white/10 bg-black p-4">Uniforms remain optional for players and teams.</div></div></aside>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}
