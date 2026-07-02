import Link from "next/link";
import { cookies } from "next/headers";
import { Bot, Camera, Database, FileSpreadsheet, Home, ImageIcon, Save, Search, ShieldCheck, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import { allStates, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { getPageProfile } from "@/lib/data/page-profiles";
import { getStateProfile } from "@/lib/data/state-profiles";
import { savePageProfile, saveStateProfile, signInOperator } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type CommandTab = "home" | "discover" | "search" | "about" | "schools" | "sports" | "athletes" | "parents" | "coaches" | "recruiters" | "media-partners" | "organizations";
type IntakeItem = { state?: string; school?: string; extractedCount?: number; extractedCoachCount?: number };

const tabs: Array<{ id: CommandTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "search", label: "Search" },
  { id: "about", label: "About" },
  { id: "schools", label: "Schools" },
  { id: "sports", label: "Sports" },
  { id: "athletes", label: "Athletes" },
  { id: "parents", label: "Parents / Guardian" },
  { id: "coaches", label: "Coaches" },
  { id: "recruiters", label: "Recruiters" },
  { id: "media-partners", label: "Media Partners" },
  { id: "organizations", label: "Schools & Organizations" }
];

const tools: Array<{ label: string; href: string; detail: string; icon: LucideIcon }> = [
  { label: "Directory Graph", href: "/operations/directory", detail: "States, schools, teams", icon: Home },
  { label: "Profile Manager", href: "/operations/profile-manager", detail: "State and page profiles", icon: ImageIcon },
  { label: "Data Intake", href: "/operations?tab=schools#intake", detail: "URLs, PDFs, CSV", icon: FileSpreadsheet },
  { label: "Review Queue", href: "/operations?tab=reviews", detail: "Approve, merge, reject", icon: ShieldCheck },
  { label: "Media", href: "/operations?tab=media-partners", detail: "Covers, logos, videos", icon: Camera },
  { label: "AI Builder", href: "/operations?tab=athletes", detail: "Agents and workflows", icon: Bot },
  { label: "System", href: "/operations?tab=about", detail: "Storage and deploy", icon: Database }
];

function readItems<T>(fileName: string) {
  return readJsonSync<{ items?: T[] }>(userStatePath(fileName), { items: [] }).items ?? [];
}

function formatTitle(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function TextInput({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} defaultValue={defaultValue ?? ""} /></label>;
}

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Operations</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Operations</button></form></div></main>;
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{value}</div><p className="text-sm font-semibold text-[#C8D6FF]">{label}</p></div>;
}

function StateRail({ activeCode, liveCounts }: { activeCode?: string; liveCounts: Map<string, number> }) {
  return <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"><div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">All States</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">State workflow only</p></div><div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">{allStates.map((item) => { const active = activeCode === item.code; return <Link key={item.code} href={`/operations?state=${item.code}`} className={`flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 ${active ? "border-[#F2C200] bg-[#F2C200] text-[#061331]" : "border-white/10 bg-[#071A43] text-white"}`}><span className={`grid h-6 w-8 place-items-center rounded-lg text-[10px] font-black ${active ? "bg-[#061331] text-[#F2C200]" : "bg-[#F2C200] text-[#061331]"}`}>{item.code}</span><span className="min-w-0 flex-1 truncate text-[11px] font-black">{item.name}</span><span className="rounded-full bg-white/[0.12] px-1.5 py-0.5 text-[10px] font-black">{liveCounts.get(item.code) ?? 0}</span></Link>; })}</div></aside>;
}

function ToolRail() {
  return <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 lg:sticky lg:top-4"><div className="mb-3 px-2"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Operator Tools</p><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Actions and workrooms</p></div><div className="grid gap-2">{tools.map((tool) => <Link key={tool.label} href={tool.href} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2C200] text-[#061331]"><tool.icon size={18} /></span><span><span className="block text-sm font-black text-white">{tool.label}</span><span className="block text-xs font-semibold text-[#9DB5FF]">{tool.detail}</span></span></Link>)}</div></aside>;
}

function StateEditor({ code, name }: { code: string; name: string }) {
  const profile = getStateProfile(code);
  return <form action={saveStateProfile} className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><input type="hidden" name="stateCode" value={code} /><input type="hidden" name="returnTab" value="schools" /><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">State profile manager</p><h3 className="text-2xl font-black">Edit {name}</h3></div><button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save state</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><TextInput label="Display name" name="displayName" defaultValue={profile?.displayName ?? name} /><TextInput label="Headline / tagline" name="tagline" defaultValue={profile?.tagline} /><TextInput label="Cover image URL" name="coverImageUrl" defaultValue={profile?.coverImageUrl} /><TextInput label="Badge / logo URL" name="badgeImageUrl" defaultValue={profile?.badgeImageUrl} /><TextInput label="Feature video URL" name="featureVideoUrl" defaultValue={profile?.featureVideoUrl} /><TextInput label="Primary sport / focus" name="primarySport" defaultValue={profile?.primarySport} /></div><label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Bio</span><textarea className="min-h-32 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="bio" defaultValue={profile?.bio ?? ""} /></label></form>;
}

function PageEditor({ pageKey }: { pageKey: CommandTab }) {
  const profile = getPageProfile(pageKey);
  return <form action={savePageProfile} className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><input type="hidden" name="pageKey" value={pageKey} /><input type="hidden" name="stateCode" value="" /><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Global page manager</p><h3 className="text-2xl font-black">Edit {formatTitle(pageKey)} page</h3></div><button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save page</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><TextInput label="Headline" name="headline" defaultValue={profile?.headline} /><TextInput label="Subheadline" name="subheadline" defaultValue={profile?.subheadline} /><TextInput label="Cover image URL / asset reference" name="coverImageUrl" defaultValue={profile?.coverImageUrl} /><TextInput label="Badge / icon URL / asset reference" name="badgeImageUrl" defaultValue={profile?.badgeImageUrl} /><TextInput label="Feature video URL / asset reference" name="featureVideoUrl" defaultValue={profile?.featureVideoUrl} /><TextInput label="CTA label" name="ctaLabel" defaultValue={profile?.ctaLabel} /><TextInput label="CTA link" name="ctaHref" defaultValue={profile?.ctaHref} /></div><label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Body / public copy</span><textarea className="min-h-32 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="body" defaultValue={profile?.body ?? ""} /></label></form>;
}

export default async function OperationsCommandPage({ searchParams }: { searchParams?: Promise<{ tab?: string; state?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;

  const states = getPublicSchoolHierarchy();
  const liveByCode = new Map(states.map((state) => [state.code, state]));
  const isPageWorkflow = Boolean(params.tab);
  const activeTab = (tabs.some((tab) => tab.id === params.tab) ? params.tab : "home") as CommandTab;
  const selectedState = allStates.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? allStates[0];
  const liveState = liveByCode.get(selectedState.code);
  const intake = readItems<IntakeItem>("operator-data-intake.json");
  const activeIntake = intake.filter((item) => (item.state ?? "").toUpperCase() === selectedState.code || (item.school ?? "").toUpperCase().includes(` ${selectedState.code}`));
  const schoolCount = liveState?.schools.length ?? 0;
  const teamCount = liveState?.schools.reduce((total, school) => total + school.teams.length, 0) ?? 0;
  const athleteCount = liveState?.schools.reduce((total, school) => total + school.athletes.length, 0) ?? 0;
  const coachCount = liveState?.schools.reduce((total, school) => total + school.coaches.length, 0) ?? 0;
  const liveCounts = new Map(states.map((state) => [state.code, state.schools.length]));
  const selectedStateSlug = liveState ? stateSlug(liveState) : selectedState.code.toLowerCase();

  return <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-[1800px]"><header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Command Window</p><h1 className="mt-1 text-3xl font-black">Operations Center</h1><p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Top tabs edit global pages. Left states edit state profiles. Each workflow stays separate.</p>{params.status ? <div className="mt-3 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">Saved</div> : null}<nav className="mt-5 flex flex-wrap gap-2">{tabs.map((tab) => <Link key={tab.id} href={`/operations?tab=${tab.id}`} className={`rounded-2xl px-4 py-2 text-sm font-black ${isPageWorkflow && activeTab === tab.id ? "bg-[#F2C200] text-[#061331]" : "bg-white/[0.08] text-white"}`}>{tab.label}</Link>)}</nav></header><section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.06] p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex items-center gap-3"><Search className="text-[#F2C200]" /><h2 className="text-xl font-black">Find and edit the public page, state, school, athlete, parent, coach, recruiter, media partner, review, or tool.</h2></div><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" placeholder="Search operations" /></div></section><div className="mt-5 grid gap-6 xl:grid-cols-[260px_1fr_300px]"><StateRail activeCode={isPageWorkflow ? undefined : selectedState.code} liveCounts={liveCounts} /><section className="min-w-0 rounded-[34px] border border-white/10 bg-white/[0.07] p-5">{isPageWorkflow ? <><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Global page workflow</p><h2 className="mt-2 text-3xl font-black">{formatTitle(activeTab)} page workstation</h2><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">This edits the {formatTitle(activeTab)} page only. It is not connected to Alabama or any other state.</p></div><Link className="rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href={activeTab === "home" ? "/" : `/${activeTab}`}>View public</Link></div><div className="mt-5 grid gap-4 md:grid-cols-3"><Stat icon={ImageIcon} label="Page media" value="Editable" /><Stat icon={FileSpreadsheet} label="Content blocks" value="Global" /><Stat icon={ShieldCheck} label="Review gate" value="Required" /></div><div className="mt-6"><PageEditor pageKey={activeTab} /></div></> : <><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">State workflow · {selectedState.code}</p><h2 className="mt-2 text-3xl font-black">{selectedState.name} state workstation</h2><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">This edits {selectedState.name} only. It is not connected to Home, About, or any global page tab.</p></div><Link className="rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href={`/schools/${selectedStateSlug}`}>View public</Link></div><div className="mt-5 grid gap-4 md:grid-cols-4"><Stat icon={Home} label="Schools" value={schoolCount} /><Stat icon={Users} label="Teams" value={teamCount} /><Stat icon={Trophy} label="Athletes" value={athleteCount} /><Stat icon={UserRound} label="Coaches" value={coachCount} /></div><div className="mt-6 grid gap-5"><StateEditor code={selectedState.code} name={selectedState.name} /><div className="grid gap-4 md:grid-cols-3"><Stat icon={FileSpreadsheet} label="State intake" value={activeIntake.length} /><Stat icon={ImageIcon} label="State media" value="Editable" /><Stat icon={ShieldCheck} label="Review gate" value="Required" /></div></div></>}</section><ToolRail /></div></div></main>;
}
