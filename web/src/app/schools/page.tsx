import { ArrowRight, Building2, Search, SlidersHorizontal, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDataCounters, getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";

type StateNode = ReturnType<typeof getPublicSchoolHierarchy>[number];

type StateIndexItem = { code: string; name: string };

const allStates: StateIndexItem[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" }, { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
];

function stateSlugFromCode(code: string) {
  return code.toLowerCase();
}

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
    <a id={`state-${state.code.toLowerCase()}`} href={`/schools/${stateSlug(state)}`} className="group rounded-[32px] border border-white/12 bg-white/[0.06] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#F2C200]/70 hover:bg-white/[0.09] hover:shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
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

function StateRail({ states }: { states: StateNode[] }) {
  const stateMap = new Map(states.map((state) => [state.code, state]));
  return (
    <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="mb-3 px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">All States</p>
        <p className="mt-1 text-xs font-semibold text-[#9DB5FF]">50 states + DC</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {allStates.map((item) => {
          const liveState = stateMap.get(item.code);
          const href = liveState ? `/schools/${stateSlug(liveState)}` : `/schools/${stateSlugFromCode(item.code)}`;
          const count = liveState?.schools.length ?? 0;
          return (
            <a key={item.code} href={href} className={`group flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 transition ${liveState ? "border-white/10 bg-[#071A43] hover:border-[#F2C200]/70 hover:bg-[#102A64]" : "border-white/5 bg-white/[0.035] opacity-75 hover:opacity-100"}`}>
              <span className="grid h-6 w-8 shrink-0 place-items-center rounded-lg bg-[#F2C200] text-[10px] font-black text-[#061331]">{item.code}</span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-black text-white">{item.name}</span>
              <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-black text-[#CAD7FF]">{count}</span>
            </a>
          );
        })}
      </div>
    </aside>
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
        <div className="relative mx-auto max-w-[1560px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <StateRail states={states} />
            <div className="min-w-0">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Schools Directory</div>
                  <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl">Choose a state, then drill into schools, teams, coaches, athletes, and games.</h1>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">The left rail keeps every state in view. The cards open the visual state folder flow.</p>
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
                <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Users className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{states.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">State folders with records</p></div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Search className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Live</div><p className="text-sm font-semibold text-[#C8D6FF]">State → school → team channel</p></div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{states.map((state) => <StateTile key={state.code} state={state} />)}</div>
              {!states.length ? <div className="mt-8 rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center text-sm font-semibold text-[#C8D6FF]">No reviewed school records are ready yet.</div> : null}
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
