import { ArrowRight, Building2, Search, SlidersHorizontal, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDataCounters, getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";

type StateNode = ReturnType<typeof getPublicSchoolHierarchy>[number];

function stateSlug(state: StateNode) {
  return state.code.toLowerCase() === "us" ? "national" : state.code.toLowerCase();
}

function stateTheme(state: StateNode) {
  const key = state.code.charCodeAt(0) + state.code.charCodeAt(1);
  const themes = ["from-[#F2C200] via-[#D8792D] to-[#5A2B1A]", "from-[#FFE08A] via-[#78B7C7] to-[#1B3FA0]", "from-[#F2C200] via-[#9A6A2F] to-[#10224D]", "from-[#E96F3A] via-[#F2C200] to-[#214A7A]", "from-[#9FE7C0] via-[#F2C200] to-[#244B37]"];
  return themes[key % themes.length];
}

function StateBadge({ state }: { state: StateNode }) {
  return (
    <div className={`relative grid aspect-square w-full overflow-hidden rounded-[28px] border border-white/14 bg-gradient-to-br ${stateTheme(state)} p-3 shadow-[0_18px_50px_rgba(0,0,0,0.26)] transition duration-300 group-hover:scale-[1.04] group-hover:rotate-[-1deg] group-hover:border-[#F2C200]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(255,255,255,0.48),transparent_18%),linear-gradient(180deg,transparent_48%,rgba(6,19,49,0.86)_49%)]" />
      <div className="absolute bottom-[31%] left-[9%] h-[23%] w-[46%] rounded-t-[90%] bg-[#061331]/72" />
      <div className="absolute bottom-[31%] right-[12%] h-[34%] w-[48%] rounded-t-[90%] bg-[#061331]/58" />
      <div className="absolute left-3 right-3 top-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-white/80"><span>{state.code}</span><span>State</span></div>
      <div className="relative z-10 mt-auto text-center">
        <div className="text-2xl font-black leading-none text-white drop-shadow sm:text-3xl">{state.code}</div>
        <div className="mt-1 truncate text-[11px] font-black uppercase tracking-[0.14em] text-white/90">{state.name}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-white/20 opacity-0 transition duration-500 group-hover:left-full group-hover:opacity-100" />
    </div>
  );
}

function StateTile({ state }: { state: StateNode }) {
  const schoolCount = state.schools.length;
  const teamCount = state.schools.reduce((total, school) => total + school.teams.length, 0);
  const athleteCount = state.schools.reduce((total, school) => total + school.athletes.length, 0);
  return (
    <a href={`/schools/${stateSlug(state)}`} className="group rounded-[32px] border border-white/12 bg-white/[0.06] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#F2C200]/70 hover:bg-white/[0.09] hover:shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
      <StateBadge state={state} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-white">{state.name}</h2>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#C8D6FF]">State folder</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2C200] text-[#061331] transition group-hover:translate-x-1"><ArrowRight size={17} /></span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
        <span className="rounded-xl bg-[#DFFBEA] px-2 py-2 text-[#08743C]">{schoolCount}<br />Schools</span>
        <span className="rounded-xl bg-[#E6EEFF] px-2 py-2 text-[#1B3FA0]">{teamCount}<br />Teams</span>
        <span className="rounded-xl bg-[#FFF1B8] px-2 py-2 text-[#6F5600]">{athleteCount}<br />Athletes</span>
      </div>
    </a>
  );
}

export default function SchoolsPage() {
  const counters = getPublicDataCounters();
  const states = getPublicSchoolHierarchy();
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Schools Directory</div>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl">Choose a state, then drill into schools, teams, coaches, athletes, and games.</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">A visual badge wall for the public school directory. States open into the same square-card flow for schools.</p>
            </div>
            <a href="/get-started" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Add / Claim School <ArrowRight size={16} /></a>
          </div>
          <form className="grid gap-3 rounded-[26px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur md:grid-cols-[1fr_auto_auto]">
            <div className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-[#0A1A3F]"><Search size={18} className="text-[#66718F]" /><input className="flex-1 bg-transparent text-sm font-semibold outline-none" name="q" placeholder="Search state, school, team, athlete, coach..." type="search" /></div>
            <button className="rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white">All States</button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white"><SlidersHorizontal size={16} /> More Filters</button>
          </form>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Building2 className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{counters.schools}</div><p className="text-sm font-semibold text-[#C8D6FF]">Schools indexed</p></div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Users className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{states.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">State folders</p></div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Search className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Live</div><p className="text-sm font-semibold text-[#C8D6FF]">State → school → team channel</p></div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{states.map((state) => <StateTile key={state.code} state={state} />)}</div>
          {!states.length ? <div className="mt-8 rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center text-sm font-semibold text-[#C8D6FF]">No reviewed school records are ready yet.</div> : null}
        </div>
      </section>
    </PublicSiteShell>
  );
}
