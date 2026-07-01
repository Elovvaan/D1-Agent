import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, Camera, CheckCircle2, ClipboardList, CreditCard, Eye, FileText, Film, GraduationCap, Home, Inbox, LineChart, MessageSquare, Search, Settings, ShieldCheck, Sparkles, Target, Trophy, Upload, UserRound, UsersRound } from "lucide-react";
import { brandConfig } from "@/lib/domain-config";

type WorkspaceTone = "blue" | "green" | "purple" | "gold" | "red" | "cyan" | "slate";

type WorkspaceConfig = {
  title: string;
  eyebrow: string;
  description: string;
  tone: WorkspaceTone;
  homeHref: string;
  primaryAction: string;
  stats: Array<{ label: string; value: string; detail: string }>;
  nav: Array<{ label: string; icon: LucideIcon }>;
  panels: Array<{ title: string; detail: string; icon: LucideIcon }>;
  capabilities: string[];
  activityTitle: string;
  activityEmpty: string;
};

const toneMap: Record<WorkspaceTone, { accent: string; soft: string; gradient: string; border: string }> = {
  blue: { accent: "#2E6BFF", soft: "rgba(46,107,255,0.16)", gradient: "from-[#071634] via-[#123B91] to-[#061331]", border: "border-[#2E6BFF]/40" },
  green: { accent: "#25D979", soft: "rgba(37,217,121,0.16)", gradient: "from-[#061331] via-[#0B4D3A] to-[#061331]", border: "border-[#25D979]/40" },
  purple: { accent: "#A855F7", soft: "rgba(168,85,247,0.16)", gradient: "from-[#061331] via-[#3A176D] to-[#061331]", border: "border-[#A855F7]/40" },
  gold: { accent: "#F2C200", soft: "rgba(242,194,0,0.16)", gradient: "from-[#061331] via-[#5B4308] to-[#061331]", border: "border-[#F2C200]/40" },
  red: { accent: "#FF5C7A", soft: "rgba(255,92,122,0.16)", gradient: "from-[#061331] via-[#63172A] to-[#061331]", border: "border-[#FF5C7A]/40" },
  cyan: { accent: "#00C8FF", soft: "rgba(0,200,255,0.16)", gradient: "from-[#061331] via-[#064A68] to-[#061331]", border: "border-[#00C8FF]/40" },
  slate: { accent: "#CBD5E1", soft: "rgba(203,213,225,0.14)", gradient: "from-[#061331] via-[#1F2937] to-[#061331]", border: "border-white/20" }
};

function IconBadge({ icon: Icon, tone }: { icon: LucideIcon; tone: WorkspaceTone }) {
  const color = toneMap[tone].accent;
  return <span className="grid h-12 w-12 place-items-center rounded-2xl border" style={{ borderColor: `${color}70`, background: toneMap[tone].soft, color }}><Icon size={22} /></span>;
}

function StatTile({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: WorkspaceTone }) {
  return <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4"><div className="text-xs font-black uppercase tracking-[0.16em] text-[#9DB5FF]">{label}</div><div className="mt-2 text-3xl font-black text-white" style={{ color: toneMap[tone].accent }}>{value}</div><p className="mt-2 text-xs font-semibold leading-5 text-[#CAD7FF]">{detail}</p></div>;
}

function Panel({ panel, tone }: { panel: WorkspaceConfig["panels"][number]; tone: WorkspaceTone }) {
  return <div className={`rounded-2xl border bg-[#071A43] p-4 transition hover:-translate-y-1 ${toneMap[tone].border}`}><IconBadge icon={panel.icon} tone={tone} /><h3 className="mt-4 text-lg font-black text-white">{panel.title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#CAD7FF]">{panel.detail}</p></div>;
}

const configs: Record<string, WorkspaceConfig> = {
  athlete: {
    title: "Athlete Profile Studio",
    eyebrow: "Athlete account",
    description: "Build your profile, upload film, manage recruiting, and control what the public can see.",
    tone: "blue",
    homeHref: "/profile",
    primaryAction: "View Public Profile",
    stats: [{ label: "Profile", value: "0%", detail: "Complete your athlete identity." }, { label: "Film", value: "0", detail: "Upload highlights and game film." }, { label: "Trust", value: "0", detail: "Verification begins after data is saved." }, { label: "Opportunities", value: "0", detail: "Recommendations unlock with profile signals." }],
    nav: [{ label: "Profile", icon: UserRound }, { label: "Film", icon: Film }, { label: "Highlights", icon: Upload }, { label: "Recruiting", icon: Target }, { label: "Messages", icon: Inbox }, { label: "Calendar", icon: CalendarDays }, { label: "Trust Score", icon: ShieldCheck }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Profile Builder", detail: "Name, school, sport, position, class year, bio, visibility, and public profile media.", icon: UserRound }, { title: "Film + Highlights", detail: "Upload game film, highlight reels, player cutouts, and featured videos.", icon: Film }, { title: "Recruiting Hub", detail: "Track interest, outreach, opportunities, coach verification, and profile readiness.", icon: Target }],
    capabilities: ["Create and manage public athlete profile", "Upload film and highlight reels", "Track recruiting interest", "Control privacy and visibility", "Receive messages and opportunities", "Build verified athletic identity"],
    activityTitle: "Athlete activity",
    activityEmpty: "No profile activity yet. Save profile details to begin."
  },
  family: {
    title: "Family Management Center",
    eyebrow: "Parent / guardian account",
    description: "Support a minor athlete with consent, safety controls, payments, schedules, documents, and recruiting updates.",
    tone: "green",
    homeHref: "/family",
    primaryAction: "Link Athlete",
    stats: [{ label: "Athletes", value: "0", detail: "Linked athlete accounts." }, { label: "Approvals", value: "0", detail: "Consent items waiting." }, { label: "Messages", value: "0", detail: "Coach and platform messages." }, { label: "Payments", value: "$0", detail: "Open balances." }],
    nav: [{ label: "Overview", icon: Home }, { label: "Athletes", icon: UsersRound }, { label: "Approvals", icon: ShieldCheck }, { label: "Calendar", icon: CalendarDays }, { label: "Documents", icon: FileText }, { label: "Payments", icon: CreditCard }, { label: "Messages", icon: Inbox }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Linked Athletes", detail: "Manage child accounts, profile approval, consent, and visibility controls.", icon: UsersRound }, { title: "Family Calendar", detail: "Practices, games, recruiting events, camps, travel, and reminders.", icon: CalendarDays }, { title: "Documents + Payments", detail: "Store forms, waivers, IDs, fees, and school or event requirements.", icon: FileText }],
    capabilities: ["Manage athlete consent", "Review profile changes", "Handle documents", "Track schedules", "Monitor messages", "Control privacy and account access"],
    activityTitle: "Family activity",
    activityEmpty: "No linked athlete yet. Link or claim an athlete account to begin."
  },
  coach: {
    title: "Coach Team Console",
    eyebrow: "Coach account",
    description: "Manage roster verification, player evaluations, team communication, practice schedules, and recruiting signals.",
    tone: "purple",
    homeHref: "/coach",
    primaryAction: "Open Roster",
    stats: [{ label: "Roster", value: "0", detail: "Players connected." }, { label: "Verify", value: "0", detail: "Records needing review." }, { label: "Messages", value: "0", detail: "Open athlete messages." }, { label: "Events", value: "0", detail: "Upcoming team events." }],
    nav: [{ label: "Dashboard", icon: Home }, { label: "Roster", icon: UsersRound }, { label: "Evaluations", icon: ClipboardList }, { label: "Film Review", icon: Film }, { label: "Schedule", icon: CalendarDays }, { label: "Messages", icon: MessageSquare }, { label: "Reports", icon: LineChart }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Roster Verification", detail: "Confirm athletes, positions, class years, schools, and public record matches.", icon: ShieldCheck }, { title: "Evaluations", detail: "Score players, write notes, and track coach-verified development signals.", icon: ClipboardList }, { title: "Team Communication", detail: "Send updates, manage messages, and support athlete recruiting readiness.", icon: MessageSquare }],
    capabilities: ["Search and filter athletes", "Verify roster data", "Watch film and highlights", "Message athletes and families", "Track evaluations", "Manage team recruiting pipeline"],
    activityTitle: "Coach activity",
    activityEmpty: "No roster activity yet. Import or connect a team to begin."
  },
  recruiter: {
    title: "Recruiter Prospect CRM",
    eyebrow: "Recruiter account",
    description: "Search prospects, build lists, review film, write evaluations, track contact, and manage recruiting pipeline.",
    tone: "gold",
    homeHref: "/recruiter",
    primaryAction: "Search Prospects",
    stats: [{ label: "Prospects", value: "0", detail: "Athletes scouted." }, { label: "Lists", value: "0", detail: "Saved recruiting boards." }, { label: "Follow-ups", value: "0", detail: "Contacts to review." }, { label: "Events", value: "0", detail: "Recruiting events tracked." }],
    nav: [{ label: "Dashboard", icon: Home }, { label: "Search", icon: Search }, { label: "Lists", icon: ClipboardList }, { label: "Film Queue", icon: Film }, { label: "Notes", icon: FileText }, { label: "Messages", icon: Inbox }, { label: "Pipeline", icon: Target }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Prospect Search", detail: "Filter by sport, class, school, location, position, verified data, and film.", icon: Search }, { title: "Recruiting Lists", detail: "Build boards, add notes, compare athletes, and share internal reports.", icon: ClipboardList }, { title: "Film Queue", detail: "Review highlights, save prospects, and track follow-up activity.", icon: Film }],
    capabilities: ["Advanced athlete search", "Create prospect lists", "Scout reports and notes", "Contact athletes or parents", "Export and share data", "Manage recruiting pipeline"],
    activityTitle: "Recruiter activity",
    activityEmpty: "No saved prospects yet. Search athletes to begin."
  },
  media: {
    title: "Media Partner Studio",
    eyebrow: "Media partner account",
    description: "Cover events, upload media, tag athletes, publish galleries, track analytics, and grow a sports media brand.",
    tone: "red",
    homeHref: "/media",
    primaryAction: "Upload Coverage",
    stats: [{ label: "Events", value: "0", detail: "Events covered." }, { label: "Uploads", value: "0", detail: "Media files published." }, { label: "Views", value: "0", detail: "Profile and content views." }, { label: "Requests", value: "0", detail: "Athlete media requests." }],
    nav: [{ label: "Dashboard", icon: Home }, { label: "Events", icon: CalendarDays }, { label: "Uploads", icon: Upload }, { label: "Galleries", icon: Camera }, { label: "Requests", icon: Inbox }, { label: "Analytics", icon: LineChart }, { label: "Earnings", icon: CreditCard }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Event Coverage", detail: "Track games, showcases, camps, and assignments for media capture.", icon: CalendarDays }, { title: "Upload + Tag", detail: "Upload images and videos, tag athletes, and submit content for review.", icon: Upload }, { title: "Media Analytics", detail: "Track views, engagement, athlete requests, and published content performance.", icon: LineChart }],
    capabilities: ["Request media access", "Upload and publish content", "Tag athletes and schools", "Track analytics", "Build media brand", "Connect with schools and athletes"],
    activityTitle: "Media activity",
    activityEmpty: "No media published yet. Upload coverage to begin."
  },
  organization: {
    title: "School / Organization Hub",
    eyebrow: "School account",
    description: "Manage teams, coaches, rosters, schedules, public identity, verification, and school-wide athletic data.",
    tone: "cyan",
    homeHref: "/organization",
    primaryAction: "Add Team",
    stats: [{ label: "Teams", value: "0", detail: "Teams connected." }, { label: "Athletes", value: "0", detail: "Athletes on rosters." }, { label: "Coaches", value: "0", detail: "Staff accounts." }, { label: "Review", value: "0", detail: "Records awaiting verification." }],
    nav: [{ label: "Dashboard", icon: Home }, { label: "Teams", icon: UsersRound }, { label: "Coaches", icon: ShieldCheck }, { label: "Athletes", icon: UserRound }, { label: "Schedules", icon: CalendarDays }, { label: "Documents", icon: FileText }, { label: "Media", icon: Camera }, { label: "Settings", icon: Settings }],
    panels: [{ title: "Teams + Rosters", detail: "Create teams, connect coaches, review rosters, and approve athlete records.", icon: UsersRound }, { title: "Public School Page", detail: "Control school identity, verified source links, schedules, teams, and programs.", icon: Home }, { title: "Verification Queue", detail: "Review imported data before athletes, coaches, or teams become public.", icon: ShieldCheck }],
    capabilities: ["Manage teams and rosters", "Post announcements", "Share schedules", "Verify athletes and coaches", "Upload media and documents", "Promote programs"],
    activityTitle: "Organization activity",
    activityEmpty: "No organization data yet. Add a team or import a source to begin."
  },
  admin: {
    title: "Administrator Control Center",
    eyebrow: "Platform admin account",
    description: "Oversee users, moderation, verification, reports, payments, analytics, security, and platform quality.",
    tone: "slate",
    homeHref: "/operations",
    primaryAction: "Open Operations",
    stats: [{ label: "Users", value: "0", detail: "Accounts managed." }, { label: "Reports", value: "0", detail: "Reports needing review." }, { label: "Reviews", value: "0", detail: "Verification queue." }, { label: "Health", value: "OK", detail: "System status." }],
    nav: [{ label: "Operations", icon: Home }, { label: "Users", icon: UsersRound }, { label: "Moderation", icon: ShieldCheck }, { label: "Reports", icon: FileText }, { label: "Payments", icon: CreditCard }, { label: "Analytics", icon: LineChart }, { label: "Security", icon: ShieldCheck }, { label: "Settings", icon: Settings }],
    panels: [{ title: "User Management", detail: "Inspect accounts, roles, access, claims, and platform permissions.", icon: UsersRound }, { title: "Moderation", detail: "Review reports, public records, content, and safety signals.", icon: ShieldCheck }, { title: "System Analytics", detail: "Track health, deployments, imports, queues, and operational performance.", icon: LineChart }],
    capabilities: ["User management", "Content moderation", "System reports", "Security and permissions", "Payment oversight", "Platform analytics"],
    activityTitle: "Admin activity",
    activityEmpty: "No admin activity yet. Open Operations for live system controls."
  }
};

export function RoleWorkspace({ role }: { role: keyof typeof configs }) {
  const config = configs[role];
  const tone = toneMap[config.tone];
  return <div className={`min-h-screen bg-[#061331] text-white`}><aside className="fixed inset-y-0 left-0 hidden w-[292px] overflow-y-auto border-r border-white/10 bg-[#071634] px-4 py-6 lg:block"><Link href={config.homeHref} className="flex items-center gap-3 px-2"><span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white"><img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-full w-full object-contain p-1.5" /></span><span><span className="block text-xl font-black">{brandConfig.primaryBrand}</span><span className="block text-xs font-semibold text-[#B8C8EF]">{config.eyebrow}</span></span></Link><nav className="mt-8 grid gap-2">{config.nav.map((item, index) => <a key={item.label} href="#" className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-black ${index === 0 ? "text-[#061331]" : "text-[#DDE8FF] hover:bg-white/10"}`} style={index === 0 ? { background: tone.accent } : undefined}><item.icon size={18} /><span>{item.label}</span></a>)}</nav><div className="mt-8 rounded-[22px] border border-white/10 bg-white/[0.06] p-4"><Sparkles style={{ color: tone.accent }} /><div className="mt-3 text-sm font-black">Role Agent</div><p className="mt-1 text-xs font-semibold leading-5 text-[#B8C8EF]">This workspace only exposes tools that match this account type.</p></div></aside><main className="lg:pl-[292px]"><div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8"><header className={`overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br ${tone.gradient} p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)]`}><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: tone.accent }}>{config.eyebrow}</p><h1 className="mt-3 text-5xl font-black tracking-tight">{config.title}</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#DDE8FF]">{config.description}</p></div><div className="flex flex-wrap gap-3"><a href={config.homeHref} className="rounded-2xl px-5 py-3 text-sm font-black text-[#061331]" style={{ background: tone.accent }}>{config.primaryAction}</a><a href="/messages" className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-black text-white">Messages</a></div></div></header><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{config.stats.map((stat) => <StatTile key={stat.label} {...stat} tone={config.tone} />)}</section><section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]"><div className="grid gap-6"><div className="grid gap-4 md:grid-cols-3">{config.panels.map((panel) => <Panel key={panel.title} panel={panel} tone={config.tone} />)}</div><div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Workspace Feed</p><h2 className="mt-2 text-2xl font-black">{config.activityTitle}</h2></div><Bell style={{ color: tone.accent }} /></div><div className="mt-5 rounded-2xl border border-white/10 bg-[#071A43] p-5 text-sm font-semibold text-[#CAD7FF]">{config.activityEmpty}</div></div></div><aside className="grid content-start gap-6"><div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Key capabilities</p><div className="mt-4 grid gap-3">{config.capabilities.map((item) => <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3" key={item}><CheckCircle2 className="mt-0.5 shrink-0" size={18} style={{ color: tone.accent }} /><span className="text-sm font-semibold leading-5 text-[#DDE8FF]">{item}</span></div>)}</div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Shared platform</p><div className="mt-4 grid gap-3 text-sm font-semibold text-[#CAD7FF]"><div>Search</div><div>Messages</div><div>Notifications</div><div>AI Agent</div><div>Settings</div></div></div></aside></section></div></main></div>;
}
