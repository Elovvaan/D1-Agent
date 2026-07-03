import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, DollarSign, MapPin, Play, ShieldCheck, Trophy, Users, Zap } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

const formatItems = [
  { icon: Users, label: "3v3 Basketball" },
  { icon: Play, label: "Best of 3" },
  { icon: Trophy, label: "8 Team Max" },
  { icon: Clock3, label: "Check-in 30 min before tipoff" }
];

const waitlistRules = [
  "First 8 paid teams are locked in.",
  "Next 4 teams are waitlisted.",
  "No check-in means the slot opens.",
  "Waitlist moves up in order."
];

const teams = ["Team Locked", "Rim Runners", "Swish Gang", "Buckets", "No Days Off", "Green Light", "Team Hustle", "Court Kings"];

export default function LockedInPage() {
  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(140,255,0,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(242,194,0,0.18),transparent_26%),linear-gradient(135deg,#000,#061331_55%,#020402)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(140,255,0,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,194,0,.16) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#8CFF00]">MyD1 Sports</p>
            <h1 className="mt-5 text-6xl font-black uppercase italic leading-[0.88] tracking-tight text-[#F2C200] sm:text-7xl lg:text-8xl">Locked <span className="block text-white">In</span></h1>
            <p className="mt-5 text-2xl font-black uppercase tracking-[0.12em] text-[#8CFF00]">Compete. Win. Return.</p>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#DCE7FF]">Community 3v3 competition for teams that want the smoke. Separate from public athlete profiles. Built for parks, gyms, cash prizes, brackets, highlights, and local bragging rights.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="#register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black shadow-[0_20px_40px_rgba(242,194,0,0.28)]">Register Team</Link><Link href="#events" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8CFF00] px-6 text-sm font-black uppercase text-[#8CFF00]">Upcoming Events</Link></div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{formatItems.map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><item.icon className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase text-white">{item.label}</p></div>)}</div>
          </div>
          <aside id="events" className="rounded-[30px] border border-[#8CFF00]/35 bg-black/72 p-5 shadow-[0_0_40px_rgba(140,255,0,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Next Event</p>
            <div className="mt-5 grid gap-4 text-sm font-black text-white"><div className="flex items-center gap-3"><CalendarDays className="text-[#F2C200]" /> Saturday, May 24</div><div className="flex items-center gap-3"><Clock3 className="text-[#F2C200]" /> 2:00 PM</div><div className="flex items-center gap-3"><MapPin className="text-[#F2C200]" /> Riverside Park · Court 1</div></div>
            <div className="my-6 border-t border-white/12" />
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Prize Pool</p>
            <div className="mt-2 text-6xl font-black text-[#F2C200]">$300</div><p className="mt-1 text-sm font-black uppercase text-white">Cash</p>
            <Link href="#register" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-black">View Details</Link>
          </aside>
        </div>
      </section>

      <section className="bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-[28px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event Format & Payout</p><div className="mt-5 grid gap-3">{formatItems.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3"><item.icon className="text-[#F2C200]" /><span className="text-sm font-black uppercase">{item.label}</span></div>)}</div><div className="mt-5 rounded-2xl border border-[#F2C200]/35 bg-[#F2C200]/10 p-4"><div className="flex justify-between text-sm font-black"><span>8 teams × $30</span><span>$240</span></div><div className="mt-2 flex justify-between text-sm font-black"><span>Added by MyD1</span><span>$60</span></div><div className="mt-3 border-t border-white/15 pt-3 flex justify-between text-lg font-black text-[#8CFF00]"><span>Total Prize Pool</span><span>$300</span></div></div></div>
          <div className="rounded-[28px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Bracket View Example</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{teams.map((team, index) => <div key={team} className="rounded-2xl border border-white/10 bg-black p-4"><p className="text-xs font-black text-[#8CFF00]">Seed {index + 1}</p><p className="mt-2 text-sm font-black uppercase text-white">{team}</p></div>)}</div><div className="mt-5 rounded-2xl border border-[#8CFF00]/35 bg-[#8CFF00]/10 p-4 text-center text-xl font-black uppercase text-[#8CFF00]">Winner advances · Best of 3</div></div>
        </div>
      </section>

      <section id="register" className="bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[30px] border border-[#8CFF00]/25 bg-black p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Registration Flow</p><h2 className="mt-3 text-4xl font-black uppercase">Lock your team in</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">1</div><h3 className="mt-4 font-black uppercase">Team Info</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">Team name, captain, phone, and email.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">2</div><h3 className="mt-4 font-black uppercase">Add Players</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">Three required players and one optional sub.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">3</div><h3 className="mt-4 font-black uppercase">Event & Payment</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">First 8 paid teams are confirmed.</p></div></div><Link href="/get-started" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black">Start Team Registration</Link></div>
          <aside className="rounded-[30px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Overbook System</p><div className="mt-5 grid gap-3">{waitlistRules.map((rule) => <div key={rule} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black p-3"><CheckCircle2 className="mt-0.5 text-[#8CFF00]" size={18} /><p className="text-sm font-semibold leading-6 text-white">{rule}</p></div>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-[#8CFF00]/30 bg-[#8CFF00]/10 p-4"><Zap className="text-[#8CFF00]" /><p className="mt-3 text-3xl font-black">8</p><p className="text-xs font-black uppercase">Team Slots</p></div><div className="rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-4"><ShieldCheck className="text-[#F2C200]" /><p className="mt-3 text-3xl font-black">4</p><p className="text-xs font-black uppercase">Waitlist Slots</p></div></div></aside>
        </div>
      </section>
    </PublicSiteShell>
  );
}
