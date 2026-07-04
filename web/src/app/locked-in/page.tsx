import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Palette, Play, ShieldCheck, Shirt, Trophy, Users, Zap } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPageProfile } from "@/lib/data/page-profiles";

const formatItems = [
  { icon: Users, label: "3v3 Basketball" },
  { icon: Play, label: "Best of 3" },
  { icon: Trophy, label: "8 Team Max" },
  { icon: Clock3, label: "Check-in 30 min Before Tipoff" }
];

const waitlistRules = [
  "First 8 paid teams are confirmed.",
  "Next 4 teams are waitlisted.",
  "No check-in means the slot opens.",
  "Waitlist moves up in order."
];

const teams = ["Team One", "Rim Runners", "Swish Gang", "Buckets", "Team Five", "Green Light", "Team Hustle", "Court Kings"];

export default function LockedInPage() {
  const pageProfile = getPageProfile("locked-in");
  const coverImageUrl = pageProfile?.coverImageUrl;
  const headline = pageProfile?.headline?.trim();
  const subheadline = pageProfile?.subheadline?.trim();
  const body = pageProfile?.body?.trim();
  const ctaLabel = pageProfile?.ctaLabel?.trim() || "Register Team";
  const ctaHref = pageProfile?.ctaHref?.trim() || "/locked-in/register";

  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-black text-white">
        {coverImageUrl ? <img src={coverImageUrl} alt="Event cover" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(140,255,0,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(242,194,0,0.18),transparent_26%),linear-gradient(135deg,#000,#061331_55%,#020402)]" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.42)_42%,rgba(0,0,0,0.18)_68%,rgba(0,0,0,0.44)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
          <div className="max-w-[760px] text-center lg:pl-12">
            <p className="text-xs font-black uppercase tracking-[0.36em] text-[#8CFF00]">MyD1 Sports</p>
            {headline ? <h1 className="mt-5 text-5xl font-black uppercase italic leading-[0.9] tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl">{headline}</h1> : <h1 className="mt-5 text-6xl font-black uppercase italic leading-[0.86] tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.9)] sm:text-7xl lg:text-8xl"><span className="block">Locked</span><span className="block text-[#8CFF00]">In</span><span className="mt-2 block text-3xl text-[#F2C200] sm:text-4xl lg:text-5xl">Mode</span></h1>}
            <p className="mt-5 text-2xl font-black uppercase tracking-[0.08em] text-[#8CFF00] drop-shadow-[0_5px_16px_rgba(0,0,0,0.85)]">{subheadline || "Compete. Win. Return."}</p>
            <p className="mx-auto mt-5 max-w-xl text-base font-black leading-8 text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">{body || "Community 3v3 competition for teams that want a clean event, a prize pool, brackets, highlights, and local bragging rights."}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={ctaHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F2C200] px-7 text-sm font-black uppercase text-black shadow-[0_20px_40px_rgba(242,194,0,0.28)]">{ctaLabel}</Link><Link href="#events" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8CFF00] bg-black/45 px-7 text-sm font-black uppercase text-white shadow-[0_18px_35px_rgba(0,0,0,0.35)] backdrop-blur">Upcoming Events</Link><Link href="#team-identity" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-7 text-sm font-black uppercase text-white shadow-[0_18px_35px_rgba(0,0,0,0.35)] backdrop-blur">Team Colors</Link></div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{formatItems.map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-black/58 p-4 text-left shadow-[0_18px_35px_rgba(0,0,0,0.4)] backdrop-blur-sm"><item.icon className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase text-white">{item.label}</p></div>)}</div>
          </div>
          <aside id="events" className="mx-auto w-full max-w-[360px] rounded-[30px] border border-[#8CFF00]/55 bg-black/82 p-6 shadow-[0_0_45px_rgba(140,255,0,0.18)] backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Next Event</p>
            <div className="mt-6 grid gap-5 text-sm font-black text-white"><div className="flex items-center gap-3"><CalendarDays className="text-white" /> Saturday, May 24</div><div className="flex items-center gap-3"><Clock3 className="text-white" /> 2:00 PM</div><div className="flex items-center gap-3"><MapPin className="text-white" /> Riverside Park · Court 1</div></div>
            <div className="my-7 border-t border-white/16" />
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Prize Pool</p>
            <div className="mt-2 text-6xl font-black text-[#F2C200]">$300</div><p className="mt-1 text-sm font-black uppercase text-white">Cash</p>
            <Link href="/locked-in/register" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-black shadow-[0_16px_35px_rgba(140,255,0,0.25)]">Register Team</Link>
          </aside>
        </div>
      </section>

      <section id="team-identity" className="bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 rounded-[30px] border border-[#8CFF00]/25 bg-[#050505] p-6 lg:grid-cols-[360px_1fr]">
          <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Identity Layer</p><h2 className="mt-3 text-4xl font-black uppercase">Custom colors. Optional uniforms.</h2><p className="mt-4 text-sm font-semibold leading-6 text-[#C8D6FF]">Captains can request their own color mix during registration. The eight launch colors still work, but teams can also go black-heavy, red-heavy, gold-heavy, lime, teal, or any clean MY D1 combination.</p></div>
          <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><Palette className="text-[#F2C200]" /><h3 className="mt-4 font-black uppercase">Team Colors</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Primary, secondary, and accent colors.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><Shirt className="text-[#F2C200]" /><h3 className="mt-4 font-black uppercase">Uniform Choice</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Bring your own, Basic Kit, or Elite Kit.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><ShieldCheck className="text-[#F2C200]" /><h3 className="mt-4 font-black uppercase">Order Sheet</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Sizes, names, numbers, and add-ons stay tied to the roster.</p></div></div>
        </div>
      </section>

      <section className="bg-black px-4 py-10 text-white sm:px-6 lg:px-8"><div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[420px_1fr]"><div className="rounded-[28px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event Format & Payout</p><div className="mt-5 grid gap-3">{formatItems.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3"><item.icon className="text-[#F2C200]" /><span className="text-sm font-black uppercase">{item.label}</span></div>)}</div><div className="mt-5 rounded-2xl border border-[#F2C200]/35 bg-[#F2C200]/10 p-4"><div className="flex justify-between text-sm font-black"><span>8 teams × $30</span><span>$240</span></div><div className="mt-2 flex justify-between text-sm font-black"><span>Added by MyD1</span><span>$60</span></div><div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-lg font-black text-[#8CFF00]"><span>Total Prize Pool</span><span>$300</span></div></div></div><div className="rounded-[28px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Bracket View Example</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{teams.map((team, index) => <div key={team} className="rounded-2xl border border-white/10 bg-black p-4"><p className="text-xs font-black text-[#8CFF00]">Seed {index + 1}</p><p className="mt-2 text-sm font-black uppercase text-white">{team}</p></div>)}</div><div className="mt-5 rounded-2xl border border-[#8CFF00]/35 bg-[#8CFF00]/10 p-4 text-center text-xl font-black uppercase text-[#8CFF00]">Winner advances · Best of 3</div></div></div></section>

      <section id="register" className="bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8"><div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[1fr_380px]"><div className="rounded-[30px] border border-[#8CFF00]/25 bg-black p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Registration Flow</p><h2 className="mt-3 text-4xl font-black uppercase">Lock your team in</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">1</div><h3 className="mt-4 font-black uppercase">Team Info</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">Team name, captain, phone, and email.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">2</div><h3 className="mt-4 font-black uppercase">Colors + Uniform</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">Choose colors and bring-your-own, Basic, or Elite kit.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#8CFF00] text-sm font-black text-black">3</div><h3 className="mt-4 font-black uppercase">Event & Payment</h3><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">First 8 paid teams are confirmed.</p></div></div><Link href="/locked-in/register" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black">Start Team Registration</Link></div><aside className="rounded-[30px] border border-white/12 bg-[#070707] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Overbook System</p><div className="mt-5 grid gap-3">{waitlistRules.map((rule) => <div key={rule} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black p-3"><CheckCircle2 className="mt-0.5 text-[#8CFF00]" size={18} /><p className="text-sm font-semibold leading-6 text-white">{rule}</p></div>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-[#8CFF00]/30 bg-[#8CFF00]/10 p-4"><Zap className="text-[#8CFF00]" /><p className="mt-3 text-3xl font-black">8</p><p className="text-xs font-black uppercase">Team Slots</p></div><div className="rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-4"><ShieldCheck className="text-[#F2C200]" /><p className="mt-3 text-3xl font-black">4</p><p className="text-xs font-black uppercase">Waitlist Slots</p></div></div></aside></div></section>
    </PublicSiteShell>
  );
}
