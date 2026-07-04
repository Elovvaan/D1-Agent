import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, MapPin, Trophy, Users } from "lucide-react";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

type LockedInEvent = { id?: string; title?: string; sport?: string; format?: string; dateLabel?: string; startTime?: string; timeLabel?: string; venue?: string; location?: string; court?: string; prizePool?: number; status?: string };

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function latestEvents() {
  const map = new Map<string, LockedInEvent>();
  for (const event of readItems<LockedInEvent>("locked-in-events.json")) {
    if (!event.id) continue;
    map.set(event.id, { ...(map.get(event.id) ?? {}), ...event });
  }
  return [...map.values()].filter((event) => event.status === "published" || event.status === "live");
}

export default function AppEventsPage() {
  const events = latestEvents();
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md pb-20">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">App Mode</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Events</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Stay inside the mobile app flow while viewing Locked In events, schedules, prizes, and registration.</p>
        </section>
        <section className="mt-5 grid gap-3">
          {events.length ? events.map((event) => <Link key={event.id} href={`/app/events/${event.id}`} className="rounded-[24px] border border-white/10 bg-[#071A43] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black uppercase">{event.title || "MYD1 Event"}</p><p className="mt-1 text-xs font-semibold text-[#C8D6FF]">{event.sport || "Sport"} · {event.format || "Format"}</p></div><ChevronRight className="text-[#8CFF00]" /></div><div className="mt-4 grid gap-2 text-sm font-semibold text-white"><div className="flex items-center gap-2"><CalendarDays size={16} className="text-[#F2C200]" /> {event.dateLabel || "Date TBA"} · {event.startTime || event.timeLabel || "Time TBA"}</div><div className="flex items-center gap-2"><MapPin size={16} className="text-[#F2C200]" /> {[event.venue || event.location, event.court].filter(Boolean).join(" · ") || "Location TBA"}</div><div className="flex items-center gap-2"><Trophy size={16} className="text-[#F2C200]" /> {event.prizePool ? `$${event.prizePool} prize pool` : "Prize TBA"}</div></div></Link>) : <div className="rounded-[24px] border border-white/10 bg-[#071A43] p-5 text-sm font-semibold leading-6 text-[#C8D6FF]">No published app events yet. Publish one from Operations → Events.</div>}
        </section>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-white/10 bg-[#061331]/95 px-4 py-3 backdrop-blur"><div className="grid grid-cols-5 gap-2 text-center text-[10px] font-black uppercase text-[#C8D6FF]"><Link href="/app">Home</Link><Link href="/app/events" className="text-[#8CFF00]">Events</Link><Link href="/app/check-in">Scan</Link><Link href="/app/team">Team</Link><Link href="/app/profile">Profile</Link></div></nav>
      </div>
    </main>
  );
}
