import { ArrowRight, Bot, Building2, Camera, Clapperboard, Database, GraduationCap, PlayCircle, Search, ShieldCheck, UserRound, Zap } from "lucide-react";
import { Button, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const features = [
  { title: "Athlete Profiles", detail: "Build a visibility-safe public home for verified athletic identity.", icon: UserRound, tone: "blue" },
  { title: "Verified Statistics", detail: "Label self-reported, public-record, document, coach, and multi-source data.", icon: ShieldCheck, tone: "green" },
  { title: "Highlight Reels", detail: "Organize clips, film, thumbnails, and public profile media.", icon: Clapperboard, tone: "yellow" },
  { title: "AI Career Assistant", detail: "One intent-aware Agent guides scouting, recruiting, brand, marketing, and career steps.", icon: Bot, tone: "blue" },
  { title: "Recruiting", detail: "Track matches, outreach, coach interest, and recruiting progress.", icon: GraduationCap, tone: "blue" },
  { title: "School Directory", detail: "Discover public schools, teams, rosters, and recent activity.", icon: Building2, tone: "green" },
  { title: "Media Partners", detail: "Support photographers, videographers, and content creators.", icon: Camera, tone: "yellow" },
  { title: "Public Sports Search", detail: "Search athletes, schools, teams, games, and events across public data.", icon: Search, tone: "blue" }
] as const;

export default function LandingPage() {
  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-[#061331] text-white">
        <img src="/brand/MYD1 Cover photo.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-[#061331]/80" />
        <div className="absolute -left-24 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200]" />
        <div className="absolute left-28 top-0 h-full w-28 skew-x-[-12deg] bg-[#0A1A3F]/70" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-28 pt-16 sm:px-6 lg:px-8 lg:pb-36 lg:pt-24">
          <div className="max-w-3xl lg:pl-10">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#F2C200]">Live Directory</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Real public sports data, <span className="text-[#F2C200] italic">indexed</span> as it imports.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#DCE7FF]">
              The most complete public sports database in the nation. Built for athletes, coaches, schools, and the future of the game.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/search" variant="cta" className="sm:min-w-44">Explore Directory <ArrowRight size={17} /></Button>
              <Button href="/about" variant="dark" className="sm:min-w-40"><PlayCircle size={17} /> How It Works</Button>
            </div>
            <div className="mt-10 grid max-w-xl gap-5">
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><ShieldCheck size={22} /></span><div><div className="font-black">Verified & Trusted</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">Every record is sourced, scored, and reviewed before it goes live.</p></div></div>
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><Database size={22} /></span><div><div className="font-black">Always Growing</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">The directory expands as records are added and reviewed.</p></div></div>
              <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#F2C200]/45 text-[#F2C200]"><Zap size={22} /></span><div><div className="font-black">Built for Performance</div><p className="mt-1 text-sm font-semibold leading-6 text-[#C9D7F7]">Fast search, clean public pages, and Operations review behind the scenes.</p></div></div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative -mt-20 px-4 pb-16 text-[#0A1A3F] sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-[1440px] rounded-tl-[58px] bg-white px-5 py-12 shadow-2xl sm:px-8 lg:px-12">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#1B3FA0]">Platform</p><h2 className="mt-2 text-4xl font-black tracking-tight">Everything around the athlete, organized.</h2></div>
            <Button href="/search" variant="dark">Search Public Directory <ArrowRight size={17} /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => <StatCard key={feature.title} label={feature.title} value="" detail={feature.detail} icon={feature.icon} tone={feature.tone} />)}
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
