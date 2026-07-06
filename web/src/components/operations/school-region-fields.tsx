import { CalendarDays, Database, Download, ListChecks, Play, School, Search, ShieldCheck, Table2, Trophy, Users, Video } from "lucide-react";
import { allStates } from "@/components/schools-directory-navigator";

const pullScopes = [
  { value: "schools", label: "Schools only" },
  { value: "schools-teams", label: "Schools + Teams" },
  { value: "full-directory", label: "Full Sports Directory" }
];

const sports = ["All Sports", "Basketball", "Football", "Baseball", "Volleyball", "Wrestling", "Soccer", "Track & Field"];

const pullTargets = [
  { label: "Schools & Districts", icon: School },
  { label: "Teams", icon: Users },
  { label: "Athletes (Public Roster)", icon: Users },
  { label: "Schedules & Scores", icon: CalendarDays },
  { label: "Events & Tournaments", icon: Trophy },
  { label: "Streams & Broadcasts", icon: Video }
];

const dataFlow = [
  { label: "Discover", icon: Search },
  { label: "Collect", icon: Download },
  { label: "Normalize", icon: Table2 },
  { label: "Match", icon: Users },
  { label: "Import", icon: Database }
];

function EngineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.045] px-4 py-3 text-center">
      <p className="text-xs font-semibold text-[#C8D6FF]">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

export function SchoolRegionFields() {
  return (
    <div className="rounded-[26px] border border-[#F2C200] bg-white/[0.06] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.2)]">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Data Engine</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h4 className="text-2xl font-black text-white">Smart Pull Engine</h4>
                <span className="rounded-lg bg-[#F2C200] px-2 py-1 text-[10px] font-black uppercase text-[#061331]">Beta</span>
              </div>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-[#CAD7FF]">
                Choose a state and start a public-record pull. MYD1 will discover, collect, normalize, match, and import directory records from configured public sources.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <label className="grid gap-2 text-sm font-black text-white">
              <span>State reference</span>
              <select className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name="smartPullState" defaultValue="UT">
                {allStates.map((state) => <option key={state.code} value={state.code}>{state.name} ({state.code})</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-white">
              <span>Pull scope</span>
              <select className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name="smartPullScope" defaultValue="full-directory">
                {pullScopes.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-white">
              <span>Sport</span>
              <select className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name="smartPullSport" defaultValue="All Sports">
                {sports.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <button className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#F2C200] px-6 text-sm font-black text-[#061331] shadow-[0_18px_45px_rgba(242,194,0,0.22)]" type="button">
              <Database size={17} /> Start Smart Pull <Play size={16} />
            </button>
            <EngineMetric label="Sources" value="24" />
            <EngineMetric label="Last Run" value="Never" />
            <EngineMetric label="Records Found" value="0" />
            <EngineMetric label="Imported" value="0" />
            <EngineMetric label="Pending Review" value="0" />
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-[#061331]/75 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Engine Profile</p>
          <div className="mt-4 grid gap-3 text-sm font-black text-white">
            <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3"><span className="text-[#C8D6FF]">Market</span><span>State-based</span></div>
            <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3"><span className="text-[#C8D6FF]">Sports</span><span>Selectable</span></div>
            <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3"><span className="text-[#C8D6FF]">Levels</span><span>HS, MS, Youth</span></div>
            <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3"><span className="text-[#C8D6FF]">Update Mode</span><span>On demand</span></div>
            <div className="grid grid-cols-2 gap-3"><span className="text-[#C8D6FF]">Confidence</span><span>Medium+</span></div>
          </div>
        </aside>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-sm font-black text-white">What it pulls</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {pullTargets.map((item) => <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#061331]/50 px-3 py-3 text-xs font-black text-white"><item.icon className="text-[#F2C200]" size={17} /> {item.label}</div>)}
        </div>
      </div>

      <div className="mt-5 grid gap-5 border-t border-white/10 pt-5 xl:grid-cols-[1fr_520px]">
        <section>
          <p className="text-sm font-black text-white">Recent Runs</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#061331]/55">
            <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs font-black text-[#C8D6FF]"><span>Run ID</span><span>Started</span><span>Found</span><span>Imported</span><span>Status</span></div>
            <div className="border-t border-white/10 px-4 py-4 text-center text-sm font-semibold text-[#C8D6FF]">No runs yet. Select a state and click Start Smart Pull.</div>
          </div>
        </section>

        <section>
          <p className="text-sm font-black text-white">Data Flow</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {dataFlow.map((step, index) => <div key={step.label} className="relative rounded-2xl border border-white/10 bg-[#061331]/55 p-3 text-center text-xs font-black text-white"><step.icon className="mx-auto mb-2 text-[#F2C200]" size={22} />{step.label}{index < dataFlow.length - 1 ? <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[#C8D6FF] xl:block">→</span> : null}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
