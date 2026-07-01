import type { D1Role } from "@d1/shared";
import { ArrowRight, Bot, Building2, Camera, Clapperboard, Database, GraduationCap, ListChecks, PlayCircle, Search, ShieldCheck, Swords, UserRound, Users, Zap } from "lucide-react";
import { Badge, Button, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryCounters } from "@/lib/data/services";

const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "media_partner", "admin"]);
void roles;

const features = [
  { title: "Athlete Profiles", detail: "Build a visibility-safe public home for verified athletic identity.", icon: UserRound, tone: "blue" },
  { title: "Verified Statistics", detail: "Label self-reported, public-record, document, coach, and multi-source data.", icon: ShieldCheck, tone: "green" },
  { title: "Highlight Reels", detail: "Organize clips, film, thumbnails, and public profile media.", icon: Clapperboard, tone: "yellow" },
  { title: "AI Career Assistant", detail: "One intent-aware Agent guides scouting, recruiting, brand, marketing, and career steps.", icon: Bot, tone: "blue" },
  { title: "Recruiting", detail: "Track matches, outreach, coach interest, visits, and pipeline state.", icon: GraduationCap, tone: "blue" },
  { title: "School Directory", detail: "Discover public schools, teams, rosters, schedules, coaches, and stats.", icon: Building2, tone: "green" },
  { title: "Media Partners", detail: "Support photographers, videographers, livestream crews, newspapers, and creators.", icon: Camera, tone: "yellow" },
  { title: "Public Sports Search", detail: "Search athletes, schools, teams, games, tournaments, coaches, and public stats.", icon: Search, tone: "blue" }
] as const;

function DarkStatCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Building2; tone: "blue" | "green" | "yellow" }) {
  const toneClass = tone === "green" ? "bg-emerald-500/18 text-emerald-300 border-emerald-400/30" : tone === "yellow" ? "bg-[#F2C200]/18 text-[#F2C200] border-[#F2C200]/35" : "bg-[#325CFF]/22 text-[#AFC3FF] border-[#5475FF]/35";
  return (
    <a href="/search" className="group rounded-[24px] border border-white/12 bg-white/[0.055] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur transition hover:-translate-y-1 hover:border-[#F2C200]/55 hover:bg-white/[0.08]">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl border ${toneClass}`}><Icon size={21} /></div>
      <div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#C8D6FF]">{label}</div>
      <div className="mt-3 text-4xl font-black tracking-tight text-white">{value}</div>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#C9D7F7]">{detail}</p>
      <ArrowRight className="mt-4 text-[#F2C200] transition group-hover:translate-x-1" size={18} />
    </a>
  );
}

export default function LandingPage() {
  const counters = getPublicDirectoryCounters();
  const liveCounters = [
    { label: "Schools", value: counters.schools, detail: "Public school records indexed.", icon: Building2, tone: "blue" },
    { label: "Teams", value: counters.teams, detail: "Team records discovered from imports.", icon: Users, tone: "green" },
    { label: "Athletes", value: counters.athletes, detail: "Public athlete records available.", icon: UserRound, tone: "yellow" },
    { label: "Coaches", value: counters.coaches, detail: "Coach records found where available.", icon: ShieldCheck, tone: "blue" },
    { label: "Games", value: counters.games, detail: "Games, events, and tournament records.", icon: Swords, tone: "green" },
    { label: "Sources", value: counters.sources, detail: "Enabled registry sources.", icon: Search, tone: "yellow" },
    { label: "Records Imported", value: counters.recordsImported, detail: "Total records from real import artifacts.", icon: Database, tone: "blue" },
    { label: "Pending Review", value: counters.pendingReview, detail: "Records waiting for review before verification.", icon: ListChecks, tone: "yellow" }
  ] as const;

  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.56),transparent_34%),linear-gradient(135deg,#061331_0%,#08245B_52%,#061331_100%)]" />
        <div className="absolute -left-20 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200] shadow-[0_0_90px_rgba(242,194,0,0.34)]" />
        <div className="absolute left-32 top-0 h-full w-28 skew-x-[-12deg] border-r border-[#F2C200]/35 bg-[#0A1A3F]/55" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center lg:pl-10">
            <div className="text-xs font-black uppercase tracking-[0.32em] text-[#F2C200]">Live Directory</div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">Real public sports data, <span className="text-[#F2C200]">indexed</span> as it imports.</h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#DCE7FF]">The public sports database for athletes, coaches, schools, and the future of the game.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button href="/search" variant="cta" className="sm:min-w-44">Explore Directory <ArrowRight size={17} /></Button><Button href="/about" variant="dark" className="sm:min-w-40"><PlayCircle size={17} /> How It Works</Button></div>
            <div className="mt-10 grid gap-5">
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><ShieldCheck size={22} /></span><div><div className="font-black">Verified & Trusted</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">Every record is sourced, scored, and reviewed before it becomes verified.</p></div></div>
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><Database size={22} /></span><div><div className="font-black">Always Growing</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">The directory expands as public sports records import.</p></div></div>
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><Zap size={22} /></span><div><div className="font-black">Built for Performance</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">Fast search, clean public pages, and Operations review behind the scenes.</p></div></div>
            </div>
          </div>
          <div className="grid content-center gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:xl:grid-cols-2">{liveCounters.map((counter) => <DarkStatCard key={counter.label} label={counter.label} value={String(counter.value)} detail={counter.detail} icon={counter.icon} tone={counter.tone} />)}</div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-white text-[#0A1A3F]"><div className="absolute -left-14 top-0 h-full w-40 skew-x-[-12deg] bg-[#F2C200]" /><div className="absolute right-0 top-0 h-full w-1/2 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#0A1A3F_1px,transparent_0)] [background-size:22px_22px]" /><div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8"><div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#1B3FA0]">Platform</p><h2 className="mt-2 text-4xl font-black tracking-tight">Everything around the athlete, organized.</h2></div><Button href="/search" variant="dark">Search Public Directory <ArrowRight size={17} /></Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{features.map((feature) => <StatCard key={feature.title} label={feature.title} value="" detail={feature.detail} icon={feature.icon} tone={feature.tone} />)}</div></div></section>
    </PublicSiteShell>
  );
}
