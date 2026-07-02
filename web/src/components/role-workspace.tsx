"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, Camera, CheckCircle2, ClipboardList, CreditCard, Eye, FileText, Film, GraduationCap, Home, Inbox, LineChart, MessageSquare, Search, Settings, ShieldCheck, Sparkles, Target, Trophy, Upload, UserRound, UsersRound } from "lucide-react";
import { brandConfig } from "@/lib/domain-config";

type WorkspaceTone = "blue" | "green" | "purple" | "gold" | "red" | "cyan" | "slate";

type WorkspaceAction = {
  label: string;
  href: string;
};

type WorkspaceNavItem = WorkspaceAction & {
  icon: LucideIcon;
};

type WorkspacePanel = WorkspaceAction & {
  title: string;
  detail: string;
  icon: LucideIcon;
};

type WorkspaceConfig = {
  title: string;
  eyebrow: string;
  description: string;
  tone: WorkspaceTone;
  homeHref: string;
  primaryAction: WorkspaceAction;
  secondaryAction?: WorkspaceAction;
  stats: Array<{ label: string; value: string; detail: string; href: string }>;
  nav: WorkspaceNavItem[];
  panels: WorkspacePanel[];
  capabilities: WorkspaceAction[];
  activityTitle: string;
  activityEmpty: string;
  profileLabel: string;
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

function StatTile({ label, value, detail, href, tone }: { label: string; value: string; detail: string; href: string; tone: WorkspaceTone }) {
  return <Link href={href} className="rounded-2xl border border-white/10 bg-[#071A43] p-4 transition hover:-translate-y-1 hover:border-white/25"><div className="text-xs font-black uppercase tracking-[0.16em] text-[#9DB5FF]">{label}</div><div className="mt-2 text-3xl font-black text-white" style={{ color: toneMap[tone].accent }}>{value}</div><p className="mt-2 text-xs font-semibold leading-5 text-[#CAD7FF]">{detail}</p></Link>;
}

function Panel({ panel, tone }: { panel: WorkspacePanel; tone: WorkspaceTone }) {
  return <Link href={panel.href} className={`rounded-2xl border bg-[#071A43] p-4 transition hover:-translate-y-1 ${toneMap[tone].border}`}><IconBadge icon={panel.icon} tone={tone} /><h3 className="mt-4 text-lg font-black text-white">{panel.title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#CAD7FF]">{panel.detail}</p><span className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.14em]" style={{ color: toneMap[tone].accent }}>{panel.label}</span></Link>;
}

function ProfilePhotoManager({ role, config }: { role: string; config: WorkspaceConfig }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = useMemo(() => `myd1:${role}:profile-photo`, [role]);
  const [photo, setPhoto] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setPhoto(saved);
  }, [storageKey]);

  function onUpload(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setPhoto(value);
      window.localStorage.setItem(storageKey, value);
    };
    reader.readAsDataURL(file);
  }

  return <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Page identity</p><div className="mt-4 flex items-center gap-4"><button type="button" onClick={() => inputRef.current?.click()} className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/10 bg-[#071A43]" aria-label="Upload profile picture">{photo ? <img src={photo} alt="Uploaded profile" className="h-full w-full object-cover" /> : <Camera style={{ color: toneMap[config.tone].accent }} />}</button><div><div className="text-lg font-black text-white">{config.profileLabel}</div><p className="mt-1 text-sm font-semibold leading-5 text-[#CAD7FF]">Upload a logo or profile picture for this managed page.</p><button type="button" onClick={() => inputRef.current?.click()} className="mt-3 rounded-2xl px-4 py-2 text-xs font-black text-[#061331]" style={{ background: toneMap[config.tone].accent }}>Upload picture</button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => onUpload(event.target.files?.[0])} /></div></div></div>;
}

const configs: Record<string, WorkspaceConfig> = {
  athlete: {
    title: "Athlete Profile Studio",
    eyebrow: "Athlete account",
    description: "Build your profile, upload film, manage recruiting, and control what the public can see.",
    tone: "blue",
    homeHref: "/profile",
    primaryAction: { label: "View Public Profile", href: "/profile" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Athlete profile picture",
    stats: [{ label: "Profile", value: "0%", detail: "Complete your athlete identity.", href: "/profile" }, { label: "Film", value: "0", detail: "Upload highlights and game film.", href: "/film" }, { label: "Trust", value: "0", detail: "Verification begins after data is saved.", href: "/profile" }, { label: "Opportunities", value: "0", detail: "Recommendations unlock with profile signals.", href: "/opportunities" }],
    nav: [{ label: "Profile", icon: UserRound, href: "/profile" }, { label: "Film", icon: Film, href: "/film" }, { label: "Highlights", icon: Upload, href: "/highlights" }, { label: "Recruiting", icon: Target, href: "/recruiting" }, { label: "Messages", icon: Inbox, href: "/messages" }, { label: "Calendar", icon: CalendarDays, href: "/calendar" }, { label: "Trust Score", icon: ShieldCheck, href: "/profile" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Profile Builder", label: "Edit profile", href: "/profile", detail: "Name, school, sport, position, class year, bio, visibility, and public profile media.", icon: UserRound }, { title: "Film + Highlights", label: "Upload film", href: "/film", detail: "Upload game film, highlight reels, player cutouts, and featured videos.", icon: Film }, { title: "Recruiting Hub", label: "Open recruiting", href: "/recruiting", detail: "Track interest, outreach, opportunities, coach verification, and profile readiness.", icon: Target }],
    capabilities: [{ label: "Create and manage public athlete profile", href: "/profile" }, { label: "Upload film and highlight reels", href: "/film" }, { label: "Track recruiting interest", href: "/recruiting" }, { label: "Control privacy and visibility", href: "/settings" }, { label: "Receive messages and opportunities", href: "/messages" }, { label: "Build verified athletic identity", href: "/profile" }],
    activityTitle: "Athlete activity",
    activityEmpty: "No profile activity yet. Save profile details to begin."
  },
  family: {
    title: "Family Management Center",
    eyebrow: "Parent / guardian account",
    description: "Support a minor athlete with consent, safety controls, payments, schedules, documents, and recruiting updates.",
    tone: "green",
    homeHref: "/family",
    primaryAction: { label: "Link Athlete", href: "/search" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Family account picture",
    stats: [{ label: "Athletes", value: "0", detail: "Linked athlete accounts.", href: "/search" }, { label: "Approvals", value: "0", detail: "Consent items waiting.", href: "/family#approvals" }, { label: "Messages", value: "0", detail: "Coach and platform messages.", href: "/messages" }, { label: "Payments", value: "$0", detail: "Open balances.", href: "/family#payments" }],
    nav: [{ label: "Overview", icon: Home, href: "/family" }, { label: "Athletes", icon: UsersRound, href: "/search" }, { label: "Approvals", icon: ShieldCheck, href: "/family#approvals" }, { label: "Calendar", icon: CalendarDays, href: "/calendar" }, { label: "Documents", icon: FileText, href: "/family#documents" }, { label: "Payments", icon: CreditCard, href: "/family#payments" }, { label: "Messages", icon: Inbox, href: "/messages" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Linked Athletes", label: "Find athlete", href: "/search", detail: "Manage child accounts, profile approval, consent, and visibility controls.", icon: UsersRound }, { title: "Family Calendar", label: "Open calendar", href: "/calendar", detail: "Practices, games, recruiting events, camps, travel, and reminders.", icon: CalendarDays }, { title: "Documents + Payments", label: "Manage docs", href: "/family#documents", detail: "Store forms, waivers, IDs, fees, and school or event requirements.", icon: FileText }],
    capabilities: [{ label: "Manage athlete consent", href: "/family#approvals" }, { label: "Review profile changes", href: "/profile" }, { label: "Handle documents", href: "/family#documents" }, { label: "Track schedules", href: "/calendar" }, { label: "Monitor messages", href: "/messages" }, { label: "Control privacy and account access", href: "/settings" }],
    activityTitle: "Family activity",
    activityEmpty: "No linked athlete yet. Link or claim an athlete account to begin."
  },
  coach: {
    title: "Coach Team Console",
    eyebrow: "Coach account",
    description: "Manage roster verification, player evaluations, team communication, practice schedules, and recruiting signals.",
    tone: "purple",
    homeHref: "/coach",
    primaryAction: { label: "Open Roster", href: "/coach#roster" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Coach profile picture",
    stats: [{ label: "Roster", value: "0", detail: "Players connected.", href: "/coach#roster" }, { label: "Verify", value: "0", detail: "Records needing review.", href: "/coach#verify" }, { label: "Messages", value: "0", detail: "Open athlete messages.", href: "/messages" }, { label: "Events", value: "0", detail: "Upcoming team events.", href: "/calendar" }],
    nav: [{ label: "Dashboard", icon: Home, href: "/coach" }, { label: "Roster", icon: UsersRound, href: "/coach#roster" }, { label: "Evaluations", icon: ClipboardList, href: "/coach#evaluations" }, { label: "Film Review", icon: Film, href: "/film" }, { label: "Schedule", icon: CalendarDays, href: "/calendar" }, { label: "Messages", icon: MessageSquare, href: "/messages" }, { label: "Reports", icon: LineChart, href: "/coach#reports" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Roster Verification", label: "Manage roster", href: "/coach#roster", detail: "Confirm athletes, positions, class years, schools, and public record matches.", icon: ShieldCheck }, { title: "Evaluations", label: "Open evaluations", href: "/coach#evaluations", detail: "Score players, write notes, and track coach-verified development signals.", icon: ClipboardList }, { title: "Team Communication", label: "Message team", href: "/messages", detail: "Send updates, manage messages, and support athlete recruiting readiness.", icon: MessageSquare }],
    capabilities: [{ label: "Search and filter athletes", href: "/search" }, { label: "Verify roster data", href: "/coach#verify" }, { label: "Watch film and highlights", href: "/film" }, { label: "Message athletes and families", href: "/messages" }, { label: "Track evaluations", href: "/coach#evaluations" }, { label: "Manage team recruiting pipeline", href: "/recruiting" }],
    activityTitle: "Coach activity",
    activityEmpty: "No roster activity yet. Import or connect a team to begin."
  },
  recruiter: {
    title: "Recruiter Prospect CRM",
    eyebrow: "Recruiter account",
    description: "Search prospects, build lists, review film, write evaluations, track contact, and manage recruiting pipeline.",
    tone: "gold",
    homeHref: "/recruiter",
    primaryAction: { label: "Search Prospects", href: "/search" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Recruiter profile picture",
    stats: [{ label: "Prospects", value: "0", detail: "Athletes scouted.", href: "/search" }, { label: "Lists", value: "0", detail: "Saved recruiting boards.", href: "/recruiter#lists" }, { label: "Follow-ups", value: "0", detail: "Contacts to review.", href: "/messages" }, { label: "Events", value: "0", detail: "Recruiting events tracked.", href: "/calendar" }],
    nav: [{ label: "Dashboard", icon: Home, href: "/recruiter" }, { label: "Search", icon: Search, href: "/search" }, { label: "Lists", icon: ClipboardList, href: "/recruiter#lists" }, { label: "Film Queue", icon: Film, href: "/film" }, { label: "Notes", icon: FileText, href: "/recruiter#notes" }, { label: "Messages", icon: Inbox, href: "/messages" }, { label: "Pipeline", icon: Target, href: "/recruiting" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Prospect Search", label: "Find athletes", href: "/search", detail: "Filter by sport, class, school, location, position, verified data, and film.", icon: Search }, { title: "Recruiting Lists", label: "Open lists", href: "/recruiter#lists", detail: "Build boards, add notes, compare athletes, and share internal reports.", icon: ClipboardList }, { title: "Film Queue", label: "Review film", href: "/film", detail: "Review highlights, save prospects, and track follow-up activity.", icon: Film }],
    capabilities: [{ label: "Advanced athlete search", href: "/search" }, { label: "Create prospect lists", href: "/recruiter#lists" }, { label: "Scout reports and notes", href: "/recruiter#notes" }, { label: "Contact athletes or parents", href: "/messages" }, { label: "Export and share data", href: "/recruiter#reports" }, { label: "Manage recruiting pipeline", href: "/recruiting" }],
    activityTitle: "Recruiter activity",
    activityEmpty: "No saved prospects yet. Search athletes to begin."
  },
  media: {
    title: "Media Partner Studio",
    eyebrow: "Media partner account",
    description: "Cover events, upload media, tag athletes, publish galleries, track analytics, and grow a sports media brand.",
    tone: "red",
    homeHref: "/media",
    primaryAction: { label: "Upload Coverage", href: "/media#uploads" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Media brand logo",
    stats: [{ label: "Events", value: "0", detail: "Events covered.", href: "/media#events" }, { label: "Uploads", value: "0", detail: "Media files published.", href: "/media#uploads" }, { label: "Views", value: "0", detail: "Profile and content views.", href: "/media#analytics" }, { label: "Requests", value: "0", detail: "Athlete media requests.", href: "/messages" }],
    nav: [{ label: "Dashboard", icon: Home, href: "/media" }, { label: "Events", icon: CalendarDays, href: "/media#events" }, { label: "Uploads", icon: Upload, href: "/media#uploads" }, { label: "Galleries", icon: Camera, href: "/media#galleries" }, { label: "Requests", icon: Inbox, href: "/messages" }, { label: "Analytics", icon: LineChart, href: "/media#analytics" }, { label: "Earnings", icon: CreditCard, href: "/media#earnings" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Event Coverage", label: "Track events", href: "/media#events", detail: "Track games, showcases, camps, and assignments for media capture.", icon: CalendarDays }, { title: "Upload + Tag", label: "Upload media", href: "/media#uploads", detail: "Upload images and videos, tag athletes, and submit content for review.", icon: Upload }, { title: "Media Analytics", label: "View analytics", href: "/media#analytics", detail: "Track views, engagement, athlete requests, and published content performance.", icon: LineChart }],
    capabilities: [{ label: "Request media access", href: "/messages" }, { label: "Upload and publish content", href: "/media#uploads" }, { label: "Tag athletes and schools", href: "/search" }, { label: "Track analytics", href: "/media#analytics" }, { label: "Build media brand", href: "/media" }, { label: "Connect with schools and athletes", href: "/messages" }],
    activityTitle: "Media activity",
    activityEmpty: "No media published yet. Upload coverage to begin."
  },
  organization: {
    title: "School / Organization Hub",
    eyebrow: "School account",
    description: "Manage teams, coaches, rosters, schedules, public identity, verification, and school-wide athletic data.",
    tone: "cyan",
    homeHref: "/organization",
    primaryAction: { label: "Add Team", href: "/organization#teams" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "School logo",
    stats: [{ label: "Teams", value: "0", detail: "Teams connected.", href: "/organization#teams" }, { label: "Athletes", value: "0", detail: "Athletes on rosters.", href: "/organization#athletes" }, { label: "Coaches", value: "0", detail: "Staff accounts.", href: "/organization#coaches" }, { label: "Review", value: "0", detail: "Records awaiting verification.", href: "/organization#review" }],
    nav: [{ label: "Dashboard", icon: Home, href: "/organization" }, { label: "Teams", icon: UsersRound, href: "/organization#teams" }, { label: "Coaches", icon: ShieldCheck, href: "/organization#coaches" }, { label: "Athletes", icon: UserRound, href: "/organization#athletes" }, { label: "Schedules", icon: CalendarDays, href: "/calendar" }, { label: "Documents", icon: FileText, href: "/organization#documents" }, { label: "Media", icon: Camera, href: "/media" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "Teams + Rosters", label: "Manage teams", href: "/organization#teams", detail: "Create teams, connect coaches, review rosters, and approve athlete records.", icon: UsersRound }, { title: "Public School Page", label: "Edit page", href: "/organization#public-page", detail: "Control school identity, verified source links, schedules, teams, and programs.", icon: Home }, { title: "Verification Queue", label: "Review records", href: "/organization#review", detail: "Review imported data before athletes, coaches, or teams become public.", icon: ShieldCheck }],
    capabilities: [{ label: "Manage teams and rosters", href: "/organization#teams" }, { label: "Post announcements", href: "/organization#announcements" }, { label: "Share schedules", href: "/calendar" }, { label: "Verify athletes and coaches", href: "/organization#review" }, { label: "Upload media and documents", href: "/organization#documents" }, { label: "Promote programs", href: "/organization#public-page" }],
    activityTitle: "Organization activity",
    activityEmpty: "No organization data yet. Add a team or import a source to begin."
  },
  admin: {
    title: "Administrator Control Center",
    eyebrow: "Platform admin account",
    description: "Oversee users, moderation, verification, reports, payments, analytics, security, and platform quality.",
    tone: "slate",
    homeHref: "/operations",
    primaryAction: { label: "Open Operations", href: "/operations" },
    secondaryAction: { label: "Messages", href: "/messages" },
    profileLabel: "Admin profile picture",
    stats: [{ label: "Users", value: "0", detail: "Accounts managed.", href: "/operations#users" }, { label: "Reports", value: "0", detail: "Reports needing review.", href: "/operations#reports" }, { label: "Reviews", value: "0", detail: "Verification queue.", href: "/operations#reviews" }, { label: "Health", value: "OK", detail: "System status.", href: "/operations#health" }],
    nav: [{ label: "Operations", icon: Home, href: "/operations" }, { label: "Users", icon: UsersRound, href: "/operations#users" }, { label: "Moderation", icon: ShieldCheck, href: "/operations#moderation" }, { label: "Reports", icon: FileText, href: "/operations#reports" }, { label: "Payments", icon: CreditCard, href: "/operations#payments" }, { label: "Analytics", icon: LineChart, href: "/operations#analytics" }, { label: "Security", icon: ShieldCheck, href: "/operations#security" }, { label: "Settings", icon: Settings, href: "/settings" }],
    panels: [{ title: "User Management", label: "Manage users", href: "/operations#users", detail: "Inspect accounts, roles, access, claims, and platform permissions.", icon: UsersRound }, { title: "Moderation", label: "Review content", href: "/operations#moderation", detail: "Review reports, public records, content, and safety signals.", icon: ShieldCheck }, { title: "System Analytics", label: "View health", href: "/operations#analytics", detail: "Track health, deployments, imports, queues, and operational performance.", icon: LineChart }],
    capabilities: [{ label: "User management", href: "/operations#users" }, { label: "Content moderation", href: "/operations#moderation" }, { label: "System reports", href: "/operations#reports" }, { label: "Security and permissions", href: "/operations#security" }, { label: "Payment oversight", href: "/operations#payments" }, { label: "Platform analytics", href: "/operations#analytics" }],
    activityTitle: "Admin activity",
    activityEmpty: "No admin activity yet. Open Operations for live system controls."
  }
};

const sharedPlatform = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "AI Agent", href: "/agent", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function RoleWorkspace({ role }: { role: keyof typeof configs }) {
  const config = configs[role];
  const tone = toneMap[config.tone];

  return <div className="min-h-screen bg-[#061331] text-white"><aside className="fixed inset-y-0 left-0 hidden w-[292px] overflow-y-auto border-r border-white/10 bg-[#071634] px-4 py-6 lg:block"><Link href={config.homeHref} className="flex items-center gap-3 px-2"><span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white"><img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-full w-full object-contain p-1.5" /></span><span><span className="block text-xl font-black">{brandConfig.primaryBrand}</span><span className="block text-xs font-semibold text-[#B8C8EF]">{config.eyebrow}</span></span></Link><nav className="mt-8 grid gap-2">{config.nav.map((item, index) => <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-black ${index === 0 ? "text-[#061331]" : "text-[#DDE8FF] hover:bg-white/10"}`} style={index === 0 ? { background: tone.accent } : undefined}><item.icon size={18} /><span>{item.label}</span></Link>)}</nav><div className="mt-8 rounded-[22px] border border-white/10 bg-white/[0.06] p-4"><Sparkles style={{ color: tone.accent }} /><div className="mt-3 text-sm font-black">Role Agent</div><p className="mt-1 text-xs font-semibold leading-5 text-[#B8C8EF]">This workspace only exposes tools that match this account type.</p><Link href="/agent" className="mt-4 inline-flex rounded-2xl px-4 py-2 text-xs font-black text-[#061331]" style={{ background: tone.accent }}>Open agent</Link></div></aside><main className="lg:pl-[292px]"><div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8"><header className={`overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br ${tone.gradient} p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)]`}><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: tone.accent }}>{config.eyebrow}</p><h1 className="mt-3 text-5xl font-black tracking-tight">{config.title}</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#DDE8FF]">{config.description}</p></div><div className="flex flex-wrap gap-3"><Link href={config.primaryAction.href} className="rounded-2xl px-5 py-3 text-sm font-black text-[#061331]" style={{ background: tone.accent }}>{config.primaryAction.label}</Link>{config.secondaryAction ? <Link href={config.secondaryAction.href} className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-black text-white">{config.secondaryAction.label}</Link> : null}</div></div></header><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{config.stats.map((stat) => <StatTile key={stat.label} {...stat} tone={config.tone} />)}</section><section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]"><div className="grid gap-6"><div className="grid gap-4 md:grid-cols-3">{config.panels.map((panel) => <Panel key={panel.title} panel={panel} tone={config.tone} />)}</div><div id="uploads" className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Workspace Feed</p><h2 className="mt-2 text-2xl font-black">{config.activityTitle}</h2></div><Bell style={{ color: tone.accent }} /></div><div className="mt-5 rounded-2xl border border-white/10 bg-[#071A43] p-5 text-sm font-semibold text-[#CAD7FF]">{config.activityEmpty}</div></div></div><aside className="grid content-start gap-6"><ProfilePhotoManager role={String(role)} config={config} /><div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Key capabilities</p><div className="mt-4 grid gap-3">{config.capabilities.map((item) => <Link href={item.href} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3 transition hover:border-white/25" key={item.label}><CheckCircle2 className="mt-0.5 shrink-0" size={18} style={{ color: tone.accent }} /><span className="text-sm font-semibold leading-5 text-[#DDE8FF]">{item.label}</span></Link>)}</div></div><div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Shared platform</p><div className="mt-4 grid gap-3 text-sm font-semibold text-[#CAD7FF]">{sharedPlatform.map((item) => <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-3 transition hover:border-white/25"><item.icon size={18} style={{ color: tone.accent }} />{item.label}</Link>)}</div></div></aside></section></div></main></div>;
}
