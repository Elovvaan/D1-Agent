import { ArrowRight, CalendarDays, Compass, GraduationCap, MapPinned, Search, ShieldCheck, Sparkles, Trophy, UsersRound, Zap } from "lucide-react";
import { Button, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDataCounters } from "@/lib/data/public-data-engine";

const pathways = [
  { title: "Recruiting Opportunities", detail: "Find schools, programs, and next-step recruiting paths by sport and level.", icon: GraduationCap, tone: "blue" },
  { title: "Camps & Showcases", detail: "Surface events, combines, exposure runs, school visits, and evaluation windows.", icon: CalendarDays, tone: "yellow" },
  { title: "School Discovery", detail: "Explore programs by location, sport, team activity, and public record coverage.", icon: MapPinned, tone: "green" },
  { title: "Athlete Growth Paths", detail: "Move from A1 to D1 with profile, film, stats, academics, and verification steps.", icon: Trophy, tone: "yellow" }
] as const;

const featured = [
  { label: "For Athletes", title: "Find the next move", detail: "Discover programs, build your profile path, and see what records need to be verified.", href: "/search?q=Athletes", icon: Sparkles },
  { label: "For Coaches", title: "See the local field", detail: "Explore schools, teams, rosters, sports coverage, and verified public activity.", href: "/schools", icon: UsersRound },
  { label: "For Families", title: "Understand the path", detail: "Use discovery to find schools, opportunities, camps, sports, and claimable athlete records.", href: "/sports", icon: ShieldCheck }
] as const;

export default function DiscoverPage() {
  const counters = getPublicDataCounters();
  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(27,63,160,0.62),transparent_34%),linear-gradient(135deg,#061331,#08245B_58%,#061331)]" />
        <div className="absolute -left-24 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200]" />
        <div className="absolute left-28 top-0 h-full w-28 skew-x-[-12deg] bg-[#0A1A3F]/70" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="lg:pl-10">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#F2C200]">Discover</p>
              <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">Find the next opportunity, not just a record.</h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#DCE7FF]">Discover is the guided layer for opportunities, schools, sports paths, camps, showcases, recruiting movement, and athlete growth.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/search" variant="cta">Search Public Data <Search size={17} /></Button>
                <Button href="/sports" variant="dark">Browse Sports <ArrowRight size={17} /></Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Public Records" value={String(counters.recordsImported)} detail="Indexed records that power discovery." icon={Compass} tone="blue" />
              <StatCard label="Schools" value={String(counters.schools)} detail="Programs available to explore." icon={MapPinned} tone="green" />
              <StatCard label="Pending Review" value={String(counters.pendingReview)} detail="Records moving through verification." icon={ShieldCheck} tone="yellow" />
              <StatCard label="Growth Paths" value="A1-D1" detail="Athlete progression from foundation to elite." icon={Zap} tone="blue" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 text-[#0A1A3F] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1B3FA0]">Explore paths</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">What Discover is for.</h2>
            </div>
            <Button href="/search" variant="dark">Go to Search <ArrowRight size={17} /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pathways.map((item) => <StatCard key={item.title} label={item.title} value="" detail={item.detail} icon={item.icon} tone={item.tone} />)}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {featured.map((item) => {
              const Icon = item.icon;
              return (
                <a className="group rounded-[28px] border border-[#DDE3EC] bg-[#F8FAFF] p-6 transition hover:-translate-y-1 hover:border-[#F2C200] hover:shadow-xl" href={item.href} key={item.title}>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200]/20 text-[#0A1A3F]"><Icon size={22} /></div>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#1B3FA0]">{item.label}</p>
                  <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#4C5875]">{item.detail}</p>
                  <ArrowRight className="mt-5 text-[#1B3FA0] transition group-hover:translate-x-1" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
