import { ArrowRight, Building2, Search, SlidersHorizontal, Trophy, UserRound, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { MiniChannel, SchoolTile, StateRail, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicDataCounters, getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";

export default function SchoolsPage() {
  const counters = getPublicDataCounters();
  const states = getPublicSchoolHierarchy();
  const selectedState = states[0];
  const selectedStateSlug = selectedState ? stateSlug(selectedState) : "";
  const teamCount = selectedState?.schools.reduce((total, school) => total + school.teams.length, 0) ?? 0;
  const athleteCount = selectedState?.schools.reduce((total, school) => total + school.athletes.length, 0) ?? 0;
  const coachCount = selectedState?.schools.reduce((total, school) => total + school.coaches.length, 0) ?? 0;
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1560px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <StateRail states={states} activeCode={selectedState?.code} />
            <div className="min-w-0">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Schools Directory</div>
                  <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl">{selectedState ? `${selectedState.name} schools` : "Choose a state"}</h1>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Pick a state from the left rail. The center panel shows only that state and the schools inside it.</p>
                </div>
                <a href="/get-started" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Add / Claim School <ArrowRight size={16} /></a>
              </div>
              <form className="grid gap-3 rounded-[26px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur md:grid-cols-[1fr_auto_auto]">
                <div className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-[#0A1A3F]"><Search size={18} className="text-[#66718F]" /><input className="flex-1 bg-transparent text-sm font-semibold outline-none" name="q" placeholder="Search state, school, team, athlete, coach..." type="search" /></div>
                <button className="rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white">All States</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white"><SlidersHorizontal size={16} /> More Filters</button>
              </form>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <MiniChannel title="Schools" icon={Building2} count={selectedState?.schools.length ?? counters.schools} />
                <MiniChannel title="Teams" icon={Users} count={teamCount} />
                <MiniChannel title="Athletes" icon={Trophy} count={athleteCount} />
                <MiniChannel title="Coaches" icon={UserRound} count={coachCount} />
              </div>
              {selectedState ? <div className="mt-8 rounded-[30px] border border-white/12 bg-white/[0.045] p-5"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{selectedState.code} folder</p><h2 className="mt-1 text-2xl font-black">Schools in {selectedState.name}</h2></div><a className="text-sm font-black text-[#F2C200] underline" href={`/schools/${selectedStateSlug}`}>Open full state page</a></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{selectedState.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />)}</div></div> : <div className="mt-8 rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center text-sm font-semibold text-[#C8D6FF]">Choose a state from the left rail.</div>}
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
