import Link from "next/link";
import { ArrowLeft, Palette, Shirt, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

type LockedInEvent = {
  id?: string;
  title?: string;
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
  entryFee?: number;
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

export default function LockedInRegisterPage() {
  const activeEvents = readItems<LockedInEvent>("locked-in-events.json").filter((event) => event.status === "published");
  const entryFeeLabel = activeEvents[0]?.entryFee ? `$${activeEvents[0].entryFee.toFixed(2)} team / uniform add-ons optional` : "Set by selected event / uniform add-ons optional";

  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/locked-in" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> Back to Locked In</Link>
          <header className="mt-6 rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#8CFF00]">Locked In Mode</p><h1 className="mt-3 text-4xl font-black uppercase text-[#F2C200]">Competition Registration</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Team creation, team colors, and uniform choices are part of registration. Event choices come from published event records.</p></header>
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="rounded-[30px] border border-white/12 bg-[#050505] p-6">
              <div className="grid gap-4 md:grid-cols-4"><div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><Trophy className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">1 Event</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">2 Player</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Palette className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">3 Team</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">4 Uniform</p></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event</p><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-black text-white"><span>Published Event</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name="event" disabled={activeEvents.length === 0}>{activeEvents.length > 0 ? activeEvents.map((event) => <option key={event.id || eventLabel(event)} value={event.id || eventLabel(event)}>{eventLabel(event)}</option>) : <option>No active events published</option>}</select></label><label className="grid gap-2 text-sm font-black text-white"><span>Entry Fee</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-[#8CFF00] outline-none" readOnly value={entryFeeLabel} /></label></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport</p><div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Sport" name="sport" options={sports} /><SelectField label="Competition Type" name="eventType" options={eventTypes} /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Player</p><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Display Name / Gamer Tag" name="displayName" /><Field label="Full Name" name="fullName" /><Field label="Phone" name="phone" /><Field label="Email" name="email" type="email" /><Field label="Home City" name="city" /><Field label="Profile Photo" name="profilePhoto" type="file" /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Identity</p><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Team Name" name="teamName" /><Field label="Captain Name Optional" name="captainName" /><Field label="Team City / Area" name="teamCity" /><SelectField label="Roster Role" name="rosterRole" options={["Captain", "Player", "Free Agent", "Substitute"]} /></div><div className="mt-4 grid gap-4 md:grid-cols-3"><ColorField label="Primary Color" name="primaryColor" defaultValue="#000000" /><ColorField label="Secondary Color" name="secondaryColor" defaultValue="#8CFF00" /><ColorField label="Accent Color" name="accentColor" defaultValue="#F2C200" /></div></div>
              <div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Uniform Choice</p><div className="mt-4 grid gap-3 lg:grid-cols-3">{uniformOptions.map((option) => <label key={option} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className="text-sm font-black uppercase text-white">{option}</span><input className="mt-4 block" name="uniformChoice" type="radio" value={option} /></label>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Jersey Size" name="jerseySize" options={jerseySizes} /><SelectField label="Shorts Size" name="shortsSize" options={jerseySizes} /><Field label="Jersey Name" name="jerseyName" /><Field label="Preferred Number" name="preferredNumber" /></div></div>
              <button className="mt-8 min-h-12 w-full rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black" type="button">Create Team + Reserve Slot</button>
            </form>
            <aside className="rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Real Data Layer</p><div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-white"><div className="rounded-2xl border border-white/10 bg-black p-4">Event choices only show published event records.</div><div className="rounded-2xl border border-white/10 bg-black p-4">Uniforms are optional: bring your own, buy Basic, or buy Elite.</div><div className="rounded-2xl border border-white/10 bg-black p-4">Team status is confirmed by Operations.</div></div></aside>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}
