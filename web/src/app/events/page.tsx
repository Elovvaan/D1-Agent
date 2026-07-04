import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Ticket, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { getPageProfile } from "@/lib/data/page-profiles";

type EventStatus = "draft" | "published" | "live" | "completed" | "closed" | "archived";

type LockedInEvent = {
  id?: string;
  title?: string;
  sport?: string;
  format?: string;
  description?: string;
  dateLabel?: string;
  startTime?: string;
  timeLabel?: string;
  venue?: string;
  location?: string;
  court?: string;
  teamLimit?: number;
  entryFee?: number;
  eventPassPrice?: number;
  prizePool?: number;
  registrationStatus?: string;
  status?: EventStatus;
  updatedAt?: string;
};

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function publishedEvents() {
  const map = new Map<string, LockedInEvent>();
  for (const event of readItems<LockedInEvent>("locked-in-events.json")) {
    if (!event.id) continue;
    map.set(event.id, { ...(map.get(event.id) ?? {}), ...event });
  }
  return [...map.values()]
    .filter((event) => event.status === "published" || event.status === "live")
    .sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
}

function money(value?: number) {
  return typeof value === "number" && !Number.isNaN(value) ? `$${value}` : "TBA";
}

export default function EventsPage() {
  const pageProfile = getPageProfile("events");
  const events = publishedEvents();
  const headline = pageProfile?.headline?.trim() || "MYD1 Events";
  const subheadline = pageProfile?.subheadline?.trim() || "Find upcoming MYD1 competitions, register your team, create an athlete profile, or pick up an Event Pass.";
  const coverImageUrl = pageProfile?.coverImageUrl;

  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-black text-white">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          {coverImageUrl ? <img src={coverImageUrl} alt="MYD1 events" className="absolute inset-0 h-full w-full object-cover opacity-45" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(140,255,0,0.18),transparent_30%),radial-gradient(circle_at_75%_10%,rgba(242,194,0,0.14),transparent_28%),linear-gradient(135deg,#000,#061331_62%,#020402)]" />}
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative mx-auto max-w-[1200px]">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#8CFF00]">MYD1 Sports</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black uppercase italic leading-none text-white sm:text-7xl">{headline}</h1>
            <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#DCE7FF]">{subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/locked-in/register" className="rounded-2xl bg-[#F2C200] px-6 py-3 text-sm font-black uppercase text-black">Register</Link><Link href="/app" className="rounded-2xl border border-[#8CFF00] bg-black/50 px-6 py-3 text-sm font-black uppercase text-white">Open App</Link><Link href="/locked-in" className="rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-black uppercase text-white">Locked In</Link></div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-4 md:grid-cols-3"><div className="rounded-[24px] border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-5"><Users className="text-[#8CFF00]" /><h2 className="mt-3 text-xl font-black uppercase">Free Spectator</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Show up and watch. No shirt or player wristband required.</p></div><div className="rounded-[24px] border border-[#F2C200]/25 bg-[#F2C200]/10 p-5"><Trophy className="text-[#F2C200]" /><h2 className="mt-3 text-xl font-black uppercase">Athlete Registration</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Create a profile, join a team, check in, receive player wristband, and compete.</p></div><div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-5"><Ticket className="text-[#F2C200]" /><h2 className="mt-3 text-xl font-black uppercase">Event Pass</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Optional pass with shirt pickup, event wristband, and event-day perks when configured.</p></div></div>

            <div className="mt-8 grid gap-4">
              {events.length ? events.map((event) => <article key={event.id} className="rounded-[28px] border border-white/10 bg-[#071A43] p-5"><div className="grid gap-5 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">{event.sport || "MYD1"} · {event.format || "Event"}</p><h2 className="mt-2 text-3xl font-black uppercase text-white">{event.title || "MYD1 Event"}</h2><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">{event.description || "Published MYD1 event."}</p><div className="mt-5 grid gap-3 text-sm font-black text-white md:grid-cols-3"><div className="flex items-center gap-2"><CalendarDays className="text-[#F2C200]" size={18} />{event.dateLabel || "Date TBA"}</div><div className="flex items-center gap-2"><Clock3 className="text-[#F2C200]" size={18} />{event.startTime || event.timeLabel || "Time TBA"}</div><div className="flex items-center gap-2"><MapPin className="text-[#F2C200]" size={18} />{[event.venue || event.location, event.court].filter(Boolean).join(" · ") || "Location TBA"}</div></div></div><div className="grid min-w-[240px] gap-3 rounded-2xl border border-white/10 bg-black p-4"><div><p className="text-xs font-black uppercase text-[#8CFF00]">Prize</p><p className="text-3xl font-black text-[#F2C200]">{money(event.prizePool)}</p></div><div className="grid grid-cols-2 gap-2 text-xs font-black uppercase text-white"><div className="rounded-xl bg-white/[0.08] p-3">Teams<br /><span className="text-[#8CFF00]">{event.teamLimit || "TBA"}</span></div><div className="rounded-xl bg-white/[0.08] p-3">Entry<br /><span className="text-[#8CFF00]">{money(event.entryFee)}</span></div></div><Link href="/locked-in/register" className="rounded-2xl bg-[#8CFF00] px-4 py-3 text-center text-sm font-black uppercase text-black">Register</Link></div></div></article>) : <div className="rounded-[28px] border border-white/10 bg-[#071A43] p-6 text-sm font-semibold leading-6 text-[#C8D6FF]">No published events yet. Publish an event from Platform Management → Locked In Events.</div>}
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
