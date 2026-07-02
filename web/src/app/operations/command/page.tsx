import Link from "next/link";
import { cookies } from "next/headers";
import { Bot, Camera, CircleCheck, FileSpreadsheet, Home, ImageIcon, Search, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import { MiniChannel, SchoolTile, StateRail, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type CommandTab = "states" | "schools" | "players" | "parents" | "media" | "games" | "reviews" | "ai" | "system";
type IntakeItem = { id?: string; state?: string; school?: string; sourceName?: string; extractedCount?: number; extractedCoachCount?: number; status?: string };

type NavItem = { id: CommandTab; label: string; href: string };
const tabs: NavItem[] = [
  { id: "states", label: "States", href: "/operations/command?tab=states" },
  { id: "schools", label: "Schools", href: "/operations/command?tab=schools" },
  { id: "players", label: "Players", href: "/operations/command?tab=players" },
  { id: "parents", label: "Parents", href: "/operations/command?tab=parents" },
  { id: "media", label: "Media", href: "/operations/command?tab=media" },
  { id: "games", label: "Games", href: "/operations/command?tab=games" },
  { id: "reviews", label: "Reviews", href: "/operations/command?tab=reviews" },
  { id: "ai", label: "AI Builder", href: "/operations/command?tab=ai" },
  { id: "system", label: "System", href: "/operations/command?tab=system" }
];

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function stateIntake(items: IntakeItem[], code: string) {
  return items.filter((item) => (item.state ?? "").toUpperCase() === code || (item.school ?? "").toUpperCase().includes(` ${code}`));
}

function CommandTile({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{value}</div><p className="text-sm font-semibold text-[#C8D6FF]">{label}</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">{detail}</p></div>;
}

export default async function OperationsCommandPage({ searchParams }: { searchParams?: Promise<{ tab?: string; state?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  const states = getPublicSchoolHierarchy();
  const selectedState = states.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? states[0];
  const selectedStateSlug = selectedState ? stateSlug(selectedState) : "";
  const activeTab = (tabs.some((tab) => tab.id === params.tab) ? params.tab : "states") as CommandTab;
  const intake = readItems<IntakeItem>("operator-data-intake.json");
  const activeIntake = selectedState ? stateIntake(intake, selectedState.code) : [];
  const schoolCount = selectedState?.schools.length ?? 0;
  const teamCount = selectedState?.schools.reduce((total, school) => total + school.teams.length, 0) ?? 0;
  const athleteCount = selectedState?.schools.reduce((total, school) => total + school.athletes.length, 0) ?? 0;
  const coachCount = selectedState?.schools.reduce((total, school) => total + school.coaches.length, 0) ?? 0;

  if (!isOperator) return <main className="min-h-screen bg-[#061331] p-8 text-white"><Link className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/operations">Unlock Operations</Link></main>;

  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
      <div className="mx-auto max-w-[1600px]">
        <header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Command Window</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Operations Center</h1>
              <p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Click a tab, choose a state/entity, edit the graph slot, then the public pages project it.</p>
            </div>
            <div className="flex gap-2"><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black" href="/operations">Old Console</Link><Link className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" href="/operations/profile-manager">Profile Manager</Link></div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {tabs.map((tab) => <Link key={tab.id} href={tab.href} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[#F2C200] text-[#061331]" : "bg-white/[0.08] text-white hover:bg-white/[0.12]"}`}>{tab.label}</Link>)}
          </nav>
        </header>

        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.06] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-center gap-3"><Search className="text-[#F2C200]" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Universal Search</p><h2 className="text-xl font-black">Find athletes, schools, states, parents, media, reviews, and app areas.</h2></div></div>
            <div className="flex gap-2"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" placeholder="Search operations" /><button className="rounded-2xl bg-[#F2C200] px-4 text-[#061331]"><Search size={18} /></button></div>
          </div>
        </section>

        <div className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]">
          <StateRail states={states} activeCode={selectedState?.code} />
          <section className="min-w-0 rounded-[34px] border border-white/10 bg-white/[0.07] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">{activeTab} · {selectedState?.code ?? "--"}</p>
                <h2 className="mt-2 text-3xl font-black">{selectedState ? `${selectedState.name} ${activeTab}` : "Choose a state"}</h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">This is the working window. Click a state on the left, then work inside the selected tab without leaving the command flow.</p>
              </div>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" href={activeTab === "states" ? "/operations/profile-manager" : "/operations/directory"}>Edit this slot <CircleCheck size={16} /></Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <MiniChannel title="Schools" icon={Home} count={schoolCount} />
              <MiniChannel title="Teams" icon={Users} count={teamCount} />
              <MiniChannel title="Athletes" icon={Trophy} count={athleteCount} />
              <MiniChannel title="Coaches" icon={UserRound} count={coachCount} />
            </div>

            {activeTab === "states" || activeTab === "schools" ? (
              <div className="mt-6 rounded-[30px] border border-white/12 bg-white/[0.045] p-5">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{selectedState?.code} folder</p><h3 className="mt-1 text-2xl font-black">Schools in {selectedState?.name}</h3></div><Link className="text-sm font-black text-[#F2C200] underline" href={`/schools/${selectedStateSlug}`}>View public page</Link></div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{selectedState?.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />)}</div>
              </div>
            ) : null}

            {activeTab === "players" || activeTab === "parents" || activeTab === "games" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3"><CommandTile icon={FileSpreadsheet} label="State intake" value={activeIntake.length} detail="Records attached to this state" /><CommandTile icon={Trophy} label="Players queued" value={activeIntake.reduce((t, i) => t + (i.extractedCount ?? 0), 0)} detail="From URL/PDF/manual intake" /><CommandTile icon={ShieldCheck} label="Needs review" value="Queue" detail="Approve before public projection" /></div>
            ) : null}

            {activeTab === "media" ? <div className="mt-6 grid gap-4 md:grid-cols-3"><CommandTile icon={ImageIcon} label="State media" value="Cover" detail="State cover, badge, logo" /><CommandTile icon={Camera} label="School media" value="Assets" detail="Logos, photos, video" /><CommandTile icon={ShieldCheck} label="Safe publish" value="Review" detail="Media must be approved" /></div> : null}
            {activeTab === "reviews" ? <div className="mt-6 grid gap-4 md:grid-cols-3"><CommandTile icon={ShieldCheck} label="Public sign-off" value="Open" detail="Approve, merge, reject, correct" /><CommandTile icon={FileSpreadsheet} label="Intake source" value={intake.length} detail="Queued records" /><CommandTile icon={CircleCheck} label="Graph write" value="After approval" detail="Only reviewed data projects publicly" /></div> : null}
            {activeTab === "ai" ? <div className="mt-6 rounded-[30px] border border-white/12 bg-[#071A43] p-5"><div className="flex items-center gap-3"><Bot className="text-[#F2C200]" /><h3 className="text-2xl font-black">AI Builder stays here</h3></div><p className="mt-3 text-sm font-semibold text-[#CAD7FF]">Build agents, automate imports, create review helpers, and generate profile updates from approved sources.</p></div> : null}
            {activeTab === "system" ? <div className="mt-6 grid gap-4 md:grid-cols-3"><CommandTile icon={Database} label="Storage" value="MYD1_DATA_DIR" detail="Use Railway volume for persistence" /><CommandTile icon={ShieldCheck} label="Deploy" value="Railway" detail="GitHub main deploy flow" /><CommandTile icon={CircleCheck} label="Graph" value="Online" detail="Organization graph projection" /></div> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
