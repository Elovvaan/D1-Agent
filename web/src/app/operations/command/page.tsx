import Link from "next/link";
import { cookies } from "next/headers";
import { Bot, Camera, Database, FileSpreadsheet, Home, ImageIcon, Save, Search, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import { MiniChannel, SchoolTile, allStates, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { getStateProfile } from "@/lib/data/state-profiles";
import { getPageProfile } from "@/lib/data/page-profiles";
import { savePageProfile, saveStateProfile, signInOperator } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type CommandTab = "home" | "discover" | "search" | "about" | "schools" | "sports";
type IntakeItem = { id?: string; state?: string; school?: string; extractedCount?: number; extractedCoachCount?: number; status?: string };
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

function readItems<T>(fileName: string) { return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? []; }
function stateIntake(items: IntakeItem[], code: string) { return items.filter((item) => (item.state ?? "").toUpperCase() === code || (item.school ?? "").toUpperCase().includes(` ${code}`)); }
function titleCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }

function UnlockPanel() {
  return (
    <main className="min-h-screen bg-[#061331] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p>
        <h1 className="mt-3 text-4xl font-black">Unlock Operations</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#CAD7FF]">Enter the operator access code to open the command window.</p>
        <form action={signInOperator} className="mt-6 grid gap-3">
          <input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" autoFocus />
          <button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Operations</button>
        </form>
      </div>
    </main>
  );
}

function CommandTile({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{value}</div><p className="text-sm font-semibold text-[#C8D6FF]">{label}</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">{detail}</p></div>;
}

function OperationsStateRail({ activeCode, activeTab, liveCounts }: { activeCode: string; activeTab: CommandTab; liveCounts: Map<string, number> }) {
  return (
    <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">All States</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Every state is editable</p></div>
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {allStates.map((item) => {
          const count = liveCounts.get(item.code) ?? 0;
          const active = activeCode === item.code;
          return <Link key={item.code} href={`/operations?tab=${activeTab}&state=${item.code}`} className={`group flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 transition ${active ? "border-[#F2C200] bg-[#F2C200] text-[#061331]" : "border-white/10 bg-[#071A43] hover:border-[#F2C200]/70 hover:bg-[#102A64]"}`}><span className={`grid h-6 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black ${active ? "bg-[#061331] text-[#F2C200]" : "bg-[#F2C200] text-[#061331]"}`}>{item.code}</span><span className={`min-w-0 flex-1 truncate text-[11px] font-black ${active ? "text-[#061331]" : "text-white"}`}>{item.name}</span><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-[#061331]/15 text-[#061331]" : "bg-white/[0.08] text-[#CAD7FF]"}`}>{count}</span></Link>;
        })}
      </div>
    </aside>
  );
}

function ToolRail() {
  return <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"><div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Operator Tools</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Actions and workrooms</p></div><div className="grid gap-2">{operatorTools.map((tool) => <Link key={tool.label} href={tool.href} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3 transition hover:border-[#F2C200]/70 hover:bg-[#102A64]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2C200] text-[#061331]"><tool.icon size={18} /></span><span className="min-w-0"><span className="block truncate text-sm font-black text-white">{tool.label}</span><span className="block truncate text-xs font-semibold text-[#9DB5FF]">{tool.detail}</span></span></Link>)}</div></aside>;
}

function TextInput({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} /></label>;
}

function StateEditor({ stateCode, stateName, activeTab }: { stateCode: string; stateName: string; activeTab: CommandTab }) {
  const profile = getStateProfile(stateCode);
  return <form action={saveStateProfile} className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><input type="hidden" name="stateCode" value={stateCode} /><input type="hidden" name="returnTab" value={activeTab} /><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">State profile manager</p><h3 className="mt-1 text-2xl font-black">Edit {stateName}</h3></div><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save state</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><TextInput label="Display name" name="displayName" defaultValue={profile?.displayName ?? stateName} /><TextInput label="Headline / tagline" name="tagline" defaultValue={profile?.tagline} placeholder="Example: California high school sports hub" /><TextInput label="Cover image URL" name="coverImageUrl" defaultValue={profile?.coverImageUrl} /><TextInput label="Badge / logo URL" name="badgeImageUrl" defaultValue={profile?.badgeImageUrl} /><TextInput label="Feature video URL" name="featureVideoUrl" defaultValue={profile?.featureVideoUrl} /><TextInput label="Primary sport / focus" name="primarySport" defaultValue={profile?.primarySport} /></div><label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Bio</span><textarea className="min-h-32 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="bio" defaultValue={profile?.bio ?? ""} placeholder="Write the state-level public directory description here." /></label></form>;
}

function PageEditor({ pageKey, stateCode }: { pageKey: CommandTab; stateCode: string }) {
  const profile = getPageProfile(pageKey, stateCode);
  return <form action={savePageProfile} className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><input type="hidden" name="pageKey" value={pageKey} /><input type="hidden" name="stateCode" value={stateCode} /><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Public page manager</p><h3 className="mt-1 text-2xl font-black">Edit {titleCase(pageKey)} page slot</h3></div><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save page</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><TextInput label="Headline" name="headline" defaultValue={profile?.headline} /><TextInput label="Subheadline" name="subheadline" defaultValue={profile?.subheadline} /><TextInput label="Cover image URL" name="coverImageUrl" defaultValue={profile?.coverImageUrl} /><TextInput label="Badge / icon URL" name="badgeImageUrl" defaultValue={profile?.badgeImageUrl} /><TextInput label="Feature video URL" name="featureVideoUrl" defaultValue={profile?.featureVideoUrl} /><TextInput label="CTA label" name="ctaLabel" defaultValue={profile?.ctaLabel} /><TextInput label="CTA link" name="ctaHref" defaultValue={profile?.ctaHref} /></div><label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Body / public copy</span><textarea className="min-h-32 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="body" defaultValue={profile?.body ?? ""} placeholder="Write the text/content for this public page slot here." /></label></form>;
}

export default async function OperationsCommandPage({ searchParams }: { searchParams?: Promise<{ tab?: string; state?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;

  const states = getPublicSchoolHierarchy();
  const liveByCode = new Map(states.map((state) => [state.code, state]));
  const activeTab = (pageTabs.some((tab) => tab.id === params.tab) ? params.tab : "schools") as CommandTab;
  const selectedStateIndex = allStates.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? allStates[0];
  const liveState = liveByCode.get(selectedStateIndex.code);
  const selectedStateSlug = liveState ? stateSlug(liveState) : selectedStateIndex.code.toLowerCase();
  const intake = readItems<IntakeItem>("operator-data-intake.json");
  const activeIntake = stateIntake(intake, selectedStateIndex.code);
  const schoolCount = liveState?.schools.length ?? 0;
  const teamCount = liveState?.schools.reduce((total, school) => total + school.teams.length, 0) ?? 0;
  const athleteCount = liveState?.schools.reduce((total, school) => total + school.athletes.length, 0) ?? 0;
  const coachCount = liveState?.schools.reduce((total, school) => total + school.coaches.length, 0) ?? 0;
  const liveCounts = new Map(states.map((state) => [state.code, state.schools.length]));

  return <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" /><div className="mx-auto max-w-[1800px]"><header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-4 lg:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Command Window</p><h1 className="mt-1 text-3xl font-black tracking-tight">Operations Center</h1><p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Pick any state. Pick a public page. Edit profile photos, media, bio, and copy in the middle workstation.</p></div>{params.status ? <span className="rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">Saved</span> : null}</div><nav className="mt-5 flex flex-wrap gap-2">{pageTabs.map((tab) => <Link key={tab.id} href={`${tab.href}&state=${selectedStateIndex.code}`} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[#F2C200] text-[#061331]" : "bg-white/[0.08] text-white hover:bg-white/[0.12]"}`}>{tab.label}</Link>)}</nav></header><section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.06] p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex items-center gap-3"><Search className="text-[#F2C200]" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Universal Search</p><h2 className="text-xl font-black">Find and edit the public page, state, school, player, parent, media, review, or tool.</h2></div></div><div className="flex gap-2"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" placeholder="Search operations" /><button className="rounded-2xl bg-[#F2C200] px-4 text-[#061331]"><Search size={18} /></button></div></div></section><div className="mt-5 grid gap-6 xl:grid-cols-[260px_1fr_300px]"><OperationsStateRail activeCode={selectedStateIndex.code} activeTab={activeTab} liveCounts={liveCounts} /><section className="min-w-0 rounded-[34px] border border-white/10 bg-white/[0.07] p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">{activeTab} page · {selectedStateIndex.code}</p><h2 className="mt-2 text-3xl font-black">{selectedStateIndex.name} {titleCase(activeTab)} workstation</h2><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">This is the live manager panel. Save here, then the frontend can project this state/page data.</p></div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" href={`/schools/${selectedStateSlug}`}>View public</Link></div><div className="mt-5 grid gap-4 md:grid-cols-4"><MiniChannel title="Schools" icon={Home} count={schoolCount} /><MiniChannel title="Teams" icon={Users} count={teamCount} /><MiniChannel title="Athletes" icon={Trophy} count={athleteCount} /><MiniChannel title="Coaches" icon={UserRound} count={coachCount} /></div><div className="mt-6 grid gap-5"><StateEditor stateCode={selectedStateIndex.code} stateName={selectedStateIndex.name} activeTab={activeTab} />{activeTab !== "schools" ? <PageEditor pageKey={activeTab} stateCode={selectedStateIndex.code} /> : null}{activeTab === "schools" ? <div className="rounded-[30px] border border-white/12 bg-white/[0.045] p-5"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">School slots</p><h3 className="mt-1 text-2xl font-black">Schools in {selectedStateIndex.name}</h3></div><Link className="text-sm font-black text-[#F2C200] underline" href="/operations/directory">Manage graph</Link></div>{liveState?.schools.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{liveState.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />)}</div> : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-5 text-sm font-black text-[#CAD7FF]">No school records seeded yet. You can still edit the state profile above, then add schools through NCES ingest or Directory Graph.</div>}</div> : <div className="grid gap-4 md:grid-cols-3"><CommandTile icon={FileSpreadsheet} label="State intake" value={activeIntake.length} detail="Records attached to this state" /><CommandTile icon={ImageIcon} label="Page media" value="Editable" detail="Cover, logo, video, thumbnails" /><CommandTile icon={ShieldCheck} label="Review gate" value="Required" detail="Approve before public projection" /></div>}</div></section><ToolRail /></div></div></main>;
}
