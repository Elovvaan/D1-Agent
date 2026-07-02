import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Building2, Database, FileSpreadsheet, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import { MiniChannel, SchoolTile, StateRail, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type IntakeItem = { id?: string; sourceType?: string; state?: string; school?: string; sourceName?: string; extractedCount?: number; extractedCoachCount?: number; status?: string; createdAt?: string };
type NcesRun = { id?: string; autoSeeded?: number; status?: string; fileName?: string; createdAt?: string };

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function stateStat(intake: IntakeItem[], code: string) {
  const items = intake.filter((item) => (item.state ?? "").toUpperCase() === code || (item.school ?? "").toUpperCase().includes(` ${code}`));
  return { items, athletes: items.reduce((total, item) => total + (item.extractedCount ?? 0), 0), coaches: items.reduce((total, item) => total + (item.extractedCoachCount ?? 0), 0) };
}

export default async function OperationsDirectoryPage({ searchParams }: { searchParams?: Promise<{ state?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  const states = getPublicSchoolHierarchy();
  const intake = readItems<IntakeItem>("operator-data-intake.json");
  const ncesRuns = readItems<NcesRun>("operator-nces-runs.json");
  const selectedState = states.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? states[0];
  const selectedStateSlug = selectedState ? stateSlug(selectedState) : "";
  const teamCount = selectedState?.schools.reduce((total, school) => total + school.teams.length, 0) ?? 0;
  const athleteCount = selectedState?.schools.reduce((total, school) => total + school.athletes.length, 0) ?? 0;
  const coachCount = selectedState?.schools.reduce((total, school) => total + school.coaches.length, 0) ?? 0;
  const selectedStats = selectedState ? stateStat(intake, selectedState.code) : { items: [], athletes: 0, coaches: 0 };

  if (!isOperator) return <main className="min-h-screen bg-[#061331] p-8 text-white"><Link className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/operations">Unlock Operations</Link></main>;

  return (
    <main className="min-h-screen bg-[#061331] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Operations Graph</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Directory backend</h1>
            <p className="mt-2 text-sm font-semibold text-[#CAD7FF]">Same state → school → team graph as the public site, but wired for intake, review, and seeding.</p>
          </div>
          <div className="flex gap-2"><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black" href="/operations">Operations</Link><Link className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" href="/operations/nces">NCES ingest</Link></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <StateRail states={states} activeCode={selectedState?.code} />
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Backend status</p>
              <div className="mt-3 grid gap-2 text-xs font-black text-[#CAD7FF]"><div className="flex justify-between"><span>Intake records</span><span>{intake.length}</span></div><div className="flex justify-between"><span>NCES runs</span><span>{ncesRuns.length}</span></div><div className="flex justify-between"><span>Seeded schools</span><span>{ncesRuns.reduce((t, r) => t + (r.autoSeeded ?? 0), 0)}</span></div></div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.07] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">{selectedState?.code ?? "--"} backend slot</p>
                  <h2 className="mt-2 text-3xl font-black">{selectedState ? `${selectedState.name} operations` : "Choose a state"}</h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Use this as the backend mirror for the public directory. Data entered here belongs to this state slot before it moves into schools, teams, coaches, athletes, and games.</p>
                </div>
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" href={`/operations?tab=data-intake&state=${selectedState?.code ?? ""}`}>Add data to this state <ArrowRight size={16} /></Link>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <MiniChannel title="Schools" icon={Building2} count={selectedState?.schools.length ?? 0} />
                <MiniChannel title="Teams" icon={Users} count={teamCount} />
                <MiniChannel title="Athletes" icon={Trophy} count={athleteCount + selectedStats.athletes} />
                <MiniChannel title="Coaches" icon={UserRound} count={coachCount + selectedStats.coaches} />
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
              <div className="rounded-[30px] border border-white/12 bg-white/[0.045] p-5">
                <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">School slots</p><h3 className="mt-1 text-2xl font-black">Schools in {selectedState?.name ?? "selected state"}</h3></div><Link className="text-sm font-black text-[#F2C200] underline" href={`/schools/${selectedStateSlug}`}>View public</Link></div>
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{selectedState?.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />) ?? null}</div>
                {!selectedState?.schools.length ? <div className="rounded-2xl border border-white/10 bg-[#071A43] p-5 text-sm font-black text-[#CAD7FF]">No schools seeded yet. Run NCES ingest or add state data.</div> : null}
              </div>

              <div className="grid gap-5">
                <section className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5"><div className="flex items-center gap-3"><FileSpreadsheet className="text-[#F2C200]" /><h3 className="text-xl font-black">State intake</h3></div><div className="mt-4 grid gap-3">{selectedStats.items.length ? selectedStats.items.slice(0, 8).map((item) => <div className="rounded-2xl bg-[#071A43] p-3" key={item.id}><div className="text-sm font-black">{item.school || item.sourceName || item.sourceType}</div><div className="mt-1 text-xs font-semibold text-[#9DB5FF]">{item.status ?? "queued"} · {item.extractedCount ?? 0} athletes · {item.extractedCoachCount ?? 0} coaches</div></div>) : <div className="rounded-2xl bg-[#071A43] p-3 text-sm font-black text-[#CAD7FF]">No intake attached to this state yet.</div>}</div></section>
                <section className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-[#F2C200]" /><h3 className="text-xl font-black">Resolution queues</h3></div><div className="mt-4 grid gap-2 text-sm font-black text-[#CAD7FF]"><div className="flex justify-between rounded-2xl bg-[#071A43] p-3"><span>Creation candidates</span><span>{selectedState?.schools.length ?? 0}</span></div><div className="flex justify-between rounded-2xl bg-[#071A43] p-3"><span>Field conflicts</span><span>0</span></div><div className="flex justify-between rounded-2xl bg-[#071A43] p-3"><span>Merge candidates</span><span>0</span></div></div></section>
                <section className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5"><div className="flex items-center gap-3"><Database className="text-[#F2C200]" /><h3 className="text-xl font-black">Graph rule</h3></div><p className="mt-3 text-sm font-semibold leading-6 text-[#CAD7FF]">Operations writes to state and school slots. Public pages only project resolved graph data.</p></section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
