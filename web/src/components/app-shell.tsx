import Link from "next/link";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Bell, BrainCircuit, Calendar, ChevronDown, Clapperboard, CreditCard, Crown, Inbox, LineChart, Medal, MessageSquare, Radio, Search, Settings, ShieldCheck, Target, Upload, UserRound } from "lucide-react";
import { Badge } from "./design-system";
import { StoredAvatar } from "./stored-avatar";
import { brandConfig } from "@/lib/domain-config";

const navItems = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/ai-team", label: "My AI Team", icon: BrainCircuit },
  { href: "/film", label: "My Film", icon: Upload },
  { href: "/highlights", label: "Highlights", icon: Clapperboard },
  { href: "/media-connections", label: "Media Connections", icon: Radio },
  { href: "/card-studio", label: "Card Studio", icon: CreditCard },
  { href: "/recruiting", label: "Recruiting", icon: Medal },
  { href: "/outreach", label: "Outreach", icon: MessageSquare },
  { href: "/messages", label: "Messages", icon: Inbox, badge: "5" },
  { href: "/opportunities", label: "Opportunities", icon: Target },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/trust", label: "Trust Score", icon: ShieldCheck },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

function getPersistedProfile(): { fullName?: string; classYear?: number; primaryPosition?: string; jerseyNumber?: string; avatarUrl?: string; avatarUpdatedAt?: string; role?: string } {
  try {
    const sessionPath = resolve(process.cwd(), "..", "data", "session", "current-user.json");
    const session = existsSync(sessionPath) ? JSON.parse(readFileSync(sessionPath, "utf8")) as { fullName?: string; role?: string } : {};
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "profile.json");
    if (!existsSync(filePath)) return session;
    const profile = JSON.parse(readFileSync(filePath, "utf8")) as { fullName?: string; classYear?: number; primaryPosition?: string; jerseyNumber?: string; avatarUrl?: string; avatarUpdatedAt?: string };
    return { ...profile, fullName: session.fullName ?? profile.fullName, role: session.role };
  } catch {
    return {};
  }
}

function cacheSafeUrl(url?: string, version?: string) {
  if (!url) return "";
  const stamp = version ? encodeURIComponent(version) : "current";
  return `${url}${url.includes("?") ? "&" : "?"}v=${stamp}`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = getPersistedProfile();
  const hasName = Boolean(profile.fullName?.trim());
  const fullName = hasName ? profile.fullName!.trim() : "Profile";
  const initials = hasName ? fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "";
  const profileLines = [profile.classYear ? `Class of ${profile.classYear}` : "", profile.primaryPosition ? `${profile.primaryPosition}${profile.jerseyNumber ? ` / #${profile.jerseyNumber}` : ""}` : ""].filter(Boolean);
  const avatarSrc = cacheSafeUrl(profile.avatarUrl, profile.avatarUpdatedAt);
  const roleLabel = profile.role ? profile.role.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "";

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0A1A3F]">
      <aside className="fixed inset-y-0 left-0 hidden w-[292px] overflow-y-auto bg-[#0A1A3F] px-4 py-7 text-white shadow-[16px_0_46px_rgba(10,26,63,0.2)] lg:block">
        <Link href="/profile" className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"><img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-full w-full object-contain p-1.5" /></span><span><span className="block text-xl font-black tracking-tight">{brandConfig.primaryBrand}</span><span className="block text-xs font-semibold text-[#B8C8EF]">Profile Studio</span></span></Link>
        <nav className="mt-8 grid gap-1.5">{navItems.map((item) => <Link href={item.href} key={`${item.href}-${item.label}`} className={item.href === "/profile" ? "flex items-center gap-3 rounded-2xl bg-[#1B3FA0] px-3.5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(27,63,160,0.34)]" : "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-[#DDE8FF] transition hover:bg-white/10"}><item.icon size={18} /><span className="min-w-0 flex-1 truncate">{item.label}</span>{"badge" in item ? <Badge tone="blue">{item.badge}</Badge> : null}</Link>)}</nav>
        <div className="mt-8 grid gap-4"><div className="rounded-[18px] border border-white/10 bg-white/[0.07] p-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#143486] text-sm font-black"><StoredAvatar src={avatarSrc} label="Profile picture" initials={initials} /></div><div className="min-w-0"><div className="truncate text-sm font-black">{fullName}</div>{profileLines.length ? profileLines.map((line) => <div className="mt-0.5 truncate text-xs text-[#C7D7FA]" key={line}>{line}</div>) : null}</div></div></div><div className="rounded-[18px] border border-white/10 bg-[#071634] p-4"><div className="flex items-center gap-3"><Crown className="text-[#F2C200]" size={20} /><div><div className="text-sm font-black">D1 PRO</div><div className="text-xs text-[#C7D7FA]">Membership Active</div></div></div></div></div>
      </aside>
      <main className="lg:pl-[292px]"><div className="mx-auto min-h-screen max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8"><header className="mb-6 flex items-center justify-between gap-4"><div className="hidden min-h-12 rounded-full border border-[#DDE3EC] bg-white px-4 shadow-[0_12px_34px_rgba(10,26,63,0.06)] md:flex md:w-[360px] md:items-center md:gap-3 xl:ml-auto"><Search size={18} className="text-[#66718F]" /><span className="text-sm font-medium text-[#66718F]">Search</span></div><div className="ml-auto flex items-center gap-3"><Link href="/messages" aria-label="Notifications" className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE3EC] bg-white text-[#0A1A3F] shadow-[0_10px_24px_rgba(10,26,63,0.06)]"><Bell size={18} /></Link><Link href="/messages" aria-label="Messages" className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE3EC] bg-white text-[#0A1A3F] shadow-[0_10px_24px_rgba(10,26,63,0.06)]"><MessageSquare size={18} /></Link><Link href="/profile" className="flex items-center gap-3 rounded-full border border-[#DDE3EC] bg-white py-2 pl-2 pr-4 shadow-[0_10px_24px_rgba(10,26,63,0.06)]"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#1B3FA0] text-sm font-black text-white"><StoredAvatar src={avatarSrc} label="Profile picture" initials={initials} /></span><span className="hidden text-left sm:block"><span className="block text-sm font-black">{fullName}</span>{roleLabel ? <span className="block text-xs text-[#66718F]">{roleLabel}</span> : null}</span><ChevronDown size={16} /></Link></div></header>{children}</div></main>
    </div>
  );
}
