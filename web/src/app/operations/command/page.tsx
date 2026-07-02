import Link from "next/link";
import { cookies } from "next/headers";
import { Bot, Camera, CircleCheck, Database, FileSpreadsheet, Home, ImageIcon, Search, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import { MiniChannel, SchoolTile, allStates, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type CommandTab = "home" | "discover" | "search" | "about" | "schools" | "sports";
type IntakeItem = { id?: string; state?: string; school?: string; sourceName?: string; extractedCount?: number; extractedCoachCount?: number; status?: string };
type ToolItem = { label: string; href: string; detail: string; icon: typeof Users };

const pageTabs: Array<{ id: CommandTab; label: string; href: string }> = [
  { id: "home", label: "Home", href: "/operations?tab=home" },
  { id: "discover", label: "Discover", href: "/operations?tab=discover" },
  { id: "search", label: "Search", href: "/operations?tab=search" },
  { id: "about", label: "About", href: "/operations?tab=about" },
  { id: "schools", label: "Schools", href: "/operations?tab=schools" },
  { id: "sports", label: "Sports", href: "/operations?tab=sports" }
];

const operatorTools: ToolItem[] = [
  { label: "Directory Graph", href: "/operations/directory", detail: "States, schools, teams", icon: Home },
  { label: "Profile Manager", href: "/operations/profile-manager", detail: "State and page profiles", icon: ImageIcon },
  { label: "Data Intake", href: "/operations?tab=schools#intake", detail: "URLs, PDFs, CSV", icon: FileSpreadsheet },
  { label: "Review Queue", href: "/operations?tab=reviews", detail: "Approve, merge, reject", icon: ShieldCheck },
  { label: "Media", href: "/operations?tab=media", detail: "Covers, logos, videos", icon: Camera },
  { label: "AI Builder", href: "/operations?tab=ai", detail: "Agents and workflows", icon: Bot },
  { label: "System", href: "/operations?tab=system", detail: "Storage and deploy", icon: Database }
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

function OperationsStateRail({ states, activeCode, activeTab }: { states: ReturnType<typeof getPublicSchoolHierarchy>; activeCode?: string; activeTab: CommandTab }) {
  const stateMap = new Map(states.map((state) => [state.code, state]));
  return (
    <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">All States</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Command rail · 50 + DC</p></div>
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {allStates.map((item) => {
          const liveState = stateMap.get(item.code);
          const count = liveState?.schools.length ?? 0;
          const active = activeCode === item.code;
          return <Link key={item.code} href={`/operations?tab=${activeTab}&state=${item.code}`} className={`group flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 transition ${active ? "border-[#F2C200] bg-[#F2C200] text-[#061331]" : "border-white/10 bg-[#071A43] hover:border-[#F2C200]/70 hover:bg-[#102A64]"}`}><span className={`grid h-6 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black ${active ? "bg-[#061331] text-[#F2C200]" : "bg-[#F2C200] text-[#061331]"}`}>{item.code}</span><span className={`min-w-0 flex-1 truncate text-[11px] font-black ${active ? "text-[#061331]" : "text-white"}`}>{item.name}</span><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-[#061331]/15 text-[#061331]" : "bg-white/[0.08] text-[#CAD7FF]"}`}>{count}</span></Link>;
        })}
      </div>
    </aside>
  );
}

function ToolRail() {
  return (
    <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Operator Tools</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Actions and workrooms</p></div>
      <div className="grid gap-2">
        {operatorTools.map((tool) => <Link key={tool.label} href={tool.href} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3 transition hover:border-[#F2C200]/70 hover:bg-[#102A64]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2C200] text-[#061331]"><tool.icon size={18} /></span><span className="min-w-0"><span className="block truncate text-sm font-black text-white">{tool.label}</span><span className="block truncate text-xs font-semibold text-[#9DB5FF]">{tool.detail}</span></span></Link>)}
      </div>
    </aside>
  );
}

export default async function OperationsCommandPage({ searchParams }: { searchParams?: Promise<{ tab?: string; state?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  const states = getPublicSchoolHierarchy();
  const selectedState = states.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? states[0];
  const selectedStateSlug = selectedState ? stateSlug(selectedState) : "";
  const activeTab = (pageTabs.some((tab) => tab.id === params.tab) ? params.tab : "schools") as CommandTab;
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
      <div className="mx-auto max-w-[1800px]">
        <header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Command Window</p><h1 className="mt-1 text-3xl font-black tracking-tight">Operations Center</h1><p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Left states. Middle workstation. Right operator tools. Top tabs edit public pages.</p></div><Link className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" href="/operations/profile-manager">Profile Manager</Link></div>
          <nav className="mt-5 flex flex-wrap gap-2">{pageTabs.map((tab) => <Link key={tab.id} href={`${tab.href}${selectedState ? `&state=${selectedState.code}` : ""}`} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[#F2C200] text-[#061331]" : "bg-white/[0.08] text-white hover:bg-white/[0.12]"}`}>{tab.label}</Link>)}</nav>
        </header>

        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.06] p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex items-center gap-3"><Search className="text-[#F2C200]" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Universal Search</p><h2 className="text-xl font-black">Find and edit the public page, state, school, player, parent, media, review, or tool.</h2></div></div><div className="flex gap-2"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" placeholder="Search operations" /><button className="rounded-2xl bg-[#F2C200] px-4 text-[#061331]"><Search size={18} /></button></div></div></section>

        <div className="mt-5 grid gap-6 xl:grid-cols-[260px_1fr_300px]">
          <OperationsStateRail states={states} activeCode={selectedState?.code} activeTab={activeTab} />
          <section className="min-w-0 rounded-[34px] border border-white/10 bg-white/[0.07] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">{activeTab} page · {selectedState?.code ?? "--"}</p><h2 className="mt-2 text-3xl font-black">{activeTab === "schools" && selectedState ? `${selectedState.name} schools workstation` : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page workstation`}</h2><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Click an item, edit its content/media/data here, save it, then the matching public page updates from the graph projection.</p></div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" href={activeTab === "schools" ? "/operations/directory" : "/operations/profile-manager"}>Edit selected slot <CircleCheck size={16} /></Link></div>
            <div className="mt-5 grid gap-4 md:grid-cols-4"><MiniChannel title="Schools" icon={Home} count={schoolCount} /><MiniChannel title="Teams" icon={Users} count={teamCount} /><MiniChannel title="Athletes" icon={Trophy} count={athleteCount} /><MiniChannel title="Coaches" icon={UserRound} count={coachCount} /></div>
            {activeTab === "schools" ? <div className="mt-6 rounded-[30px] border border-white/12 bg-white/[0.045] p-5"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{selectedState?.code} folder</p><h3 className="mt-1 text-2xl font-black">Schools in {selectedState?.name}</h3></div><Link className="text-sm font-black text-[#F2C200] underline" href={`/schools/${selectedStateSlug}`}>View public page</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{selectedState?.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />)}</div></div> : <div className="mt-6 grid gap-4 md:grid-cols-3"><CommandTile icon={FileSpreadsheet} label="State intake" value={activeIntake.length} detail="Records attached to this state" /><CommandTile icon={ImageIcon} label="Page media" value="Edit" detail="Cover, logo, video, thumbnails" /><CommandTile icon={ShieldCheck} label="Review gate" value="Required" detail="Approve before public projection" /></div>}
          </section>
          <ToolRail />
        </div>
      </div>
    </main>
  );
}
