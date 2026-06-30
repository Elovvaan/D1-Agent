import Link from "next/link";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Clapperboard, Code2, Github, Inbox, KeyRound, LifeBuoy, Radio, Search, ShieldCheck, Upload, UserRound, Video } from "lucide-react";
import { OperationsCommunicationsPanel } from "./communications-panel";
import { signInOperator, signOutOperator, recordBuildRoomRequest, recordSupportIssue, recordViewAsUser } from "./actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type UploadRecord = { title?: string; name?: string; url?: string; type?: string; uploadedAt?: string };
type SavedProfile = { id?: string; fullName?: string; sport?: string; schoolName?: string; classYear?: number; primaryPosition?: string; avatarUrl?: string; avatarUpdatedAt?: string; visibility?: string };
type IssueRecord = { id: string; status?: string };

function readUserState<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName);
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function hasUserState(fileName: string) {
  return existsSync(resolve(process.cwd(), "..", "data", "user-state", fileName));
}

function fileCount(relativePath: string) {
  try {
    const dir = resolve(process.cwd(), relativePath);
    if (!existsSync(dir)) return 0;
    return readdirSync(dir).length;
  } catch {
    return 0;
  }
}

function directorySize(relativePath: string) {
  try {
    const dir = resolve(process.cwd(), relativePath);
    if (!existsSync(dir)) return 0;
    return readdirSync(dir).reduce((total, file) => total + statSync(resolve(dir, file)).size, 0);
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number) {
  return bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : "0 MB";
}

function statusMessage(status?: string) {
  const messages: Record<string, string> = {
    "operator-ready": "Operations Center unlocked.",
    "operator-denied": "Access code rejected.",
    "operator-code-missing": "Set MYD1_OPERATOR_ACCESS_CODE in Railway before using this console.",
    "issue-recorded": "Support issue recorded.",
    "inbound-message-recorded": "Message saved to the operator inbox.",
    "build-request-recorded": "Build request recorded."
  };
  return status ? messages[status] : "";
}

function cacheSafeUrl(url?: string, version?: string) {
  if (!url) return "";
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version ?? "current")}`;
}

function matchText(query: string, values: Array<string | number | undefined>) {
  if (!query) return false;
  return values.filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase());
}

function ShellCard({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`rounded-[28px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] ${className}`}>{children}</section>;
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]"><Icon size={20} /></div>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#CAD7FF]">{detail}</p>
    </div>
  );
}

function LoginView({ status }: { status?: string }) {
  const message = statusMessage(status);
  return (
    <main className="min-h-screen bg-[#061331] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <ShellCard className="w-full max-w-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#F2C200] text-[#061331]"><KeyRound size={30} /></div>
          <div className="mt-6 text-center"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#9DB5FF]">Private operator access</p><h1 className="mt-3 text-4xl font-black tracking-tight">MYD1 Operations Center</h1><p className="mt-3 text-sm font-semibold leading-6 text-[#CAD7FF]">This console is separated from the public athlete experience and requires the Railway operator access code.</p></div>
          {message ? <div className="mt-5 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">{message}</div> : null}
          <form action={signInOperator} className="mt-6 grid gap-3"><label className="grid gap-2 text-sm font-black text-white">Access code<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-base font-black text-[#061331] outline-none" name="accessCode" type="password" required /></label><button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit">Unlock Console</button></form>
        </ShellCard>
      </div>
    </main>
  );
}

export default async function OperationsPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <LoginView status={params.status} />;

  const query = String(params.q ?? "").trim();
  const savedProfile = readUserState<SavedProfile>("profile.json", {});
  const uploads = readUserState<{ films?: UploadRecord[]; highlights?: UploadRecord[] }>("uploads.json", { films: [], highlights: [] });
  const issues = readUserState<{ items?: IssueRecord[] }>("operator-issues.json", { items: [] }).items ?? [];
  const inbox = readUserState<{ items?: Array<{ id: string; status?: string }> }>("operator-inbox.json", { items: [] }).items ?? [];
  const auditItems = readUserState<{ items?: Array<{ id: string; action?: string; occurredAt?: string }> }>("operator-audit.json", { items: [] }).items ?? [];
  const films = Array.isArray(uploads.films) ? uploads.films : [];
  const highlights = Array.isArray(uploads.highlights) ? uploads.highlights : [];
  const allMedia = [...films.map((item) => ({ ...item, kind: "Film" })), ...highlights.map((item) => ({ ...item, kind: "Highlight" }))];
  const mediaMatches = query ? allMedia.filter((item) => matchText(query, [item.title, item.name, item.kind, item.type])) : allMedia.slice(0, 6);
  const avatarSrc = cacheSafeUrl(savedProfile.avatarUrl, savedProfile.avatarUpdatedAt);
  const message = statusMessage(params.status);
  const openIssues = issues.filter((issue) => issue.status !== "closed").length;
  const openMessages = inbox.filter((item) => item.status !== "closed").length;

  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1720px]">
        <header className="flex flex-col gap-4 rounded-[34px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#9DB5FF]">MYD1 private back window</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Operations Center</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Support desk, communications inbox, media inspector, search diagnostics, deployment view, and build intake.</p></div>
          <div className="flex flex-wrap gap-2"><Link className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-black text-[#061331]" href="/command-center">Public App</Link><form action={signOutOperator}><button className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white" type="submit">Lock Console</button></form></div>
        </header>
        {message ? <div className="mt-5 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">{message}</div> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Railway" value="Auto" detail="GitHub main deploy flow." icon={Radio} />
          <Metric label="GitHub" value="Live" detail="Repository connected." icon={Github} />
          <Metric label="Inbox" value={`${openMessages}`} detail="Open messages." icon={Inbox} />
          <Metric label="Uploads" value={`${fileCount("public/uploads")}`} detail={`${formatBytes(directorySize("public/uploads"))} stored.`} icon={Upload} />
          <Metric label="Issues" value={`${openIssues}`} detail="Open operator records." icon={LifeBuoy} />
          <Metric label="Auth" value="Locked" detail="Operator cookie required." icon={ShieldCheck} />
        </section>

        <ShellCard className="mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Universal search</p><h2 className="mt-2 text-2xl font-black">Find users, schools, media, messages, issues, and app areas</h2></div><form className="flex w-full gap-2 lg:max-w-xl" action="/operations"><input className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-white px-4 text-sm font-black text-[#061331] outline-none" name="q" defaultValue={query} /><button className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]" type="submit" aria-label="Search"><Search size={20} /></button></form></div>
        </ShellCard>

        <OperationsCommunicationsPanel />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ShellCard><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">User inspector</p><h2 className="mt-2 text-2xl font-black">Current athlete account</h2></div><BadgeCheck className="text-[#F2C200]" size={28} /></div><div className="mt-5 flex flex-col gap-5 lg:flex-row"><div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#1B3FA0] text-2xl font-black">{avatarSrc ? <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" /> : <UserRound size={38} />}</div><div className="grid flex-1 gap-3 sm:grid-cols-2">{[["Name", savedProfile.fullName || "Not set"], ["School", savedProfile.schoolName || "Not set"], ["Sport", savedProfile.sport || "Not set"], ["Class", savedProfile.classYear ? String(savedProfile.classYear) : "Not set"], ["Position", savedProfile.primaryPosition || "Not set"], ["Visibility", savedProfile.visibility || "Not set"]].map(([label, value]) => <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4" key={label}><div className="text-xs font-black uppercase tracking-[0.16em] text-[#9DB5FF]">{label}</div><div className="mt-1 text-sm font-black text-white">{value}</div></div>)}</div></div><div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]" href="/profile">Edit Profile</Link><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white" href="/film">Open Film</Link><form action={recordViewAsUser}><input name="userId" type="hidden" value={savedProfile.id || "athlete-jayden-lewis"} /><input name="returnTo" type="hidden" value="/athletes/athlete-jayden-lewis" /><button className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white" type="submit">View As User</button></form></div></ShellCard>
          <ShellCard><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">System state</p><h2 className="mt-2 text-2xl font-black">Backend files</h2></div><div className="mt-5 grid gap-3">{[["Profile", hasUserState("profile.json")], ["Uploads", hasUserState("uploads.json")], ["Inbox", hasUserState("operator-inbox.json")], ["Hero media", hasUserState("hero-media.json")], ["Operator issues", hasUserState("operator-issues.json")], ["Operator audit", hasUserState("operator-audit.json")]].map(([label, exists]) => <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#071A43] px-4 py-3" key={String(label)}><span className="text-sm font-black text-white">{label}</span><span className={exists ? "text-sm font-black text-[#80F0A6]" : "text-sm font-black text-[#FFCE73]"}>{exists ? "Present" : "Not created"}</span></div>)}</div></ShellCard>
        </div>

        <ShellCard className="mt-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Media inspector</p><h2 className="mt-2 text-2xl font-black">Uploads and playback checks</h2></div><Video className="text-[#F2C200]" size={28} /></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{mediaMatches.length ? mediaMatches.map((item, index) => <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4" key={`${item.url}-${index}`}><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-black text-white">{item.title || item.name || item.kind}</div><div className="mt-1 text-xs font-semibold text-[#CAD7FF]">{item.kind} {item.uploadedAt ? `- ${new Date(item.uploadedAt).toLocaleString()}` : ""}</div></div><Clapperboard className="text-[#F2C200]" size={20} /></div>{item.url ? <video className="mt-3 aspect-video w-full rounded-xl bg-black" src={item.url} controls preload="metadata" /> : null}</div>) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#CAD7FF]">No upload records found.</div>}</div></ShellCard>

        <div className="mt-6 grid gap-6 xl:grid-cols-2"><ShellCard id="support"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Support desk</p><h2 className="mt-2 text-2xl font-black">Record user issue</h2></div><form action={recordSupportIssue} className="mt-5 grid gap-3"><label className="grid gap-2 text-sm font-black text-white">Subject<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="subject" required /></label><div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-2 text-sm font-black text-white">Area<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="affectedArea" required /></label><label className="grid gap-2 text-sm font-black text-white">Account type<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="accountType" required /></label><label className="grid gap-2 text-sm font-black text-white">Severity<select className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="severity" defaultValue="review"><option value="review">Review</option><option value="urgent">Urgent</option><option value="blocked">Blocked</option></select></label></div><label className="grid gap-2 text-sm font-black text-white">Detail<textarea className="min-h-28 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="detail" required /></label><button className="w-fit rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit">Record Issue</button></form></ShellCard>
        <ShellCard id="build-room"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">AI Build Room</p><h2 className="mt-2 text-2xl font-black">Capture platform improvement</h2></div><form action={recordBuildRoomRequest} className="mt-5 grid gap-3"><label className="grid gap-2 text-sm font-black text-white">Area<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="area" required /></label><label className="grid gap-2 text-sm font-black text-white">Request<textarea className="min-h-36 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="request" required /></label><button className="w-fit rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Code2 className="mr-2 inline" size={17} /> Save Build Request</button></form><div className="mt-5 rounded-2xl border border-white/10 bg-[#071A43] p-4"><div className="text-sm font-black text-white">Recent operator activity</div><div className="mt-3 grid gap-2">{auditItems.slice(0, 5).map((item) => <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#CAD7FF]" key={item.id}><span>{item.action}</span><span>{item.occurredAt ? new Date(item.occurredAt).toLocaleString() : ""}</span></div>)}{!auditItems.length ? <div className="text-xs font-semibold text-[#CAD7FF]">No audit events recorded yet.</div> : null}</div></div></ShellCard></div>
        <footer className="py-8 text-center text-xs font-semibold text-[#7F94D6]">MYD1 Operations Center is private. Public users stay in the public platform.</footer>
      </div>
    </main>
  );
}
