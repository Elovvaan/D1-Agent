import type { Metadata } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Bookmark, Film, Mail, PlayCircle, Search, Share2, ShieldCheck, Star, UserRound } from "lucide-react";
import { recordRecruiterInterest } from "@/app/actions/public-profile-actions";
import { brandConfig, publicProfileUrl } from "@/lib/domain-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SavedProfile = {
  fullName?: string;
  sport?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  jerseyNumber?: string;
  schoolName?: string;
  classYear?: number;
  hometown?: string;
  bio?: string;
  avatarUrl?: string;
  avatarUpdatedAt?: string;
  visibility?: string;
};

type HeroMedia = {
  playerCutoutUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
};

function readJson<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName);
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function text(value?: string | number) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function cacheSafeUrl(url?: string, version?: string) {
  if (!url) return "";
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version || "current")}`;
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "gold" | "green" | "dark" }) {
  const tones = {
    blue: "border-[#274C9A] bg-[#102B62] text-[#DDE8FF]",
    gold: "border-[#F2C200]/40 bg-[#F2C200]/15 text-[#F2C200]",
    green: "border-[#2EEA7A]/30 bg-[#2EEA7A]/10 text-[#80F2AE]",
    dark: "border-white/12 bg-white/[0.06] text-white"
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tones[tone]}`}>{children}</span>;
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-[#DDE3EC] bg-white p-5 shadow-[0_18px_45px_rgba(10,26,63,0.06)]"><div className="text-sm font-black uppercase tracking-[0.08em] text-[#0A1A3F]">{title}</div><p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">{detail}</p></div>;
}

export function generateStaticParams() {
  return [{ athleteId: "athlete-current" }];
}

export async function generateMetadata({ params }: { params: Promise<{ athleteId: string }> }): Promise<Metadata> {
  const { athleteId } = await params;
  const profile = readJson<SavedProfile>("profile.json", {});
  const name = text(profile.fullName);
  return {
    title: name ? `${name} | ${brandConfig.primaryBrand}` : `Athlete Profile | ${brandConfig.primaryBrand}`,
    description: name ? `${name} public athlete profile on ${brandConfig.primaryBrand}.` : `Public athlete profile on ${brandConfig.primaryBrand}.`,
    openGraph: { title: name ? `${name} | ${brandConfig.primaryBrand}` : `Athlete Profile | ${brandConfig.primaryBrand}`, url: publicProfileUrl(`/athletes/${athleteId}`), siteName: brandConfig.primaryBrand, type: "profile" }
  };
}

export default async function PublicAthletePage({ params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params;
  const profile = readJson<SavedProfile>("profile.json", {});
  const hero = readJson<HeroMedia>("hero-media.json", {});
  const name = text(profile.fullName);
  const avatarSrc = cacheSafeUrl(profile.avatarUrl, profile.avatarUpdatedAt);
  const positionLine = [text(profile.primaryPosition), text(profile.secondaryPosition)].filter(Boolean).join(" / ");
  const identity = [positionLine, text(profile.sport), text(profile.schoolName), profile.classYear ? `Class of ${profile.classYear}` : "", text(profile.hometown)].filter(Boolean);
  const hasProfile = Boolean(name || identity.length || avatarSrc || hero.playerCutoutUrl || hero.videoUrl || hero.thumbnailUrl);
  const highlightHref = hero.videoUrl || "";

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061331]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-11 w-11 rounded-xl bg-white object-contain p-1" />
            <div><div className="text-xl font-black">{brandConfig.primaryBrand}</div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2C200]">One athlete. One profile. One journey.</div></div>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-black text-[#DDE8FF] md:flex"><a href="/discover">Discover</a><a href="/search">Athletes</a><a href="/schools">Schools</a><a href="/opportunities">Opportunities</a><a href="/about">About</a></nav>
          <div className="hidden min-h-11 items-center gap-3 rounded-xl border border-white/14 bg-white/[0.06] px-4 lg:flex"><Search size={17} className="text-[#C8D6FF]" /><span className="text-sm font-semibold text-[#C8D6FF]">Search athletes, schools...</span></div>
          <div className="flex gap-2"><a href="/sign-in" className="rounded-xl border border-white/14 px-4 py-2 text-sm font-black">Log In</a><a href="/get-started" className="rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]">Sign Up</a></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-white/12 bg-[#071634] shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
          <div className="relative min-h-[260px] bg-[linear-gradient(135deg,#061331,#123B91_55%,#061331)]">
            {hero.videoUrl ? <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-80"><source src={hero.videoUrl} /></video> : hero.thumbnailUrl ? <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${hero.thumbnailUrl})` }} /> : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(242,194,0,0.18),transparent_28%),linear-gradient(90deg,rgba(6,19,49,0.96),rgba(6,19,49,0.62),rgba(6,19,49,0.78))]" />
            <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
            {hero.playerCutoutUrl ? <img src={hero.playerCutoutUrl} alt="Player cutout" className="absolute bottom-0 right-[8%] hidden h-[106%] max-h-[390px] object-contain object-bottom drop-shadow-[0_28px_42px_rgba(0,0,0,0.55)] lg:block" /> : null}
            <div className="absolute right-5 top-5"><button className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-black/20 px-4 py-2 text-sm font-black text-white backdrop-blur"><Share2 size={16} /> Share Profile</button></div>
          </div>

          <div className="relative px-6 pb-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[220px_1fr_360px]">
              <div className="-mt-20">
                <div className="grid h-44 w-44 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#0A1A3F] shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
                  {avatarSrc ? <img src={avatarSrc} alt="Profile photo" className="h-full w-full object-cover" /> : <UserRound size={56} className="text-white/40" />}
                </div>
                <form action={recordRecruiterInterest} className="mt-5 grid gap-3">
                  <input name="athleteId" type="hidden" value={athleteId} />
                  <input name="athleteName" type="hidden" value={name} />
                  <input name="isMinor" type="hidden" value="true" />
                  <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 text-sm font-black text-[#061331]"><Mail size={17} /> Express Interest</button>
                </form>
              </div>

              <div className="py-6">
                <div className="flex flex-wrap gap-2"><Pill tone="gold">Public Athlete Profile</Pill>{hasProfile ? <Pill tone="green">Profile Active</Pill> : <Pill tone="dark">Profile Pending</Pill>}</div>
                <h1 className="mt-5 min-h-14 text-5xl font-black tracking-tight text-white">{name}</h1>
                <div className="mt-3 flex min-h-6 flex-wrap gap-3 text-sm font-black text-[#DDE8FF]">{identity.map((item) => <span key={item}>{item}</span>)}</div>
                <p className="mt-5 min-h-10 max-w-2xl text-base font-semibold leading-7 text-[#C8D6FF]">{text(profile.bio)}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.07] px-4 text-sm font-black text-white transition hover:border-[#F2C200]/60" href={highlightHref || "#"}><PlayCircle size={17} /> Watch Highlight Reel</a>
                  <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.07] px-4 text-sm font-black text-white"><Bookmark size={17} /> Add to List</button>
                </div>
              </div>

              <div className="py-6">
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06]">
                  <div className="border-r border-white/12 p-5 text-center"><ShieldCheck className="mx-auto text-[#F2C200]" /><div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#C8D6FF]">Trust Score</div><div className="mt-2 text-4xl font-black">0</div></div>
                  <div className="p-5 text-center"><Star className="mx-auto text-[#2EEA7A]" /><div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#C8D6FF]">Opportunity</div><div className="mt-2 text-4xl font-black">0</div></div>
                </div>
              </div>
            </div>

            <nav className="mt-2 flex gap-6 border-t border-white/10 pt-4 text-sm font-black text-[#DDE8FF]"><span className="border-b-2 border-[#F2C200] pb-3 text-[#F2C200]">Overview</span><span>Highlights</span><span>Film</span><span>Stats</span><span>Academics</span><span>Awards</span><span>About</span><span>Contact</span></nav>
          </div>
        </section>

        <section className="grid gap-6 rounded-t-[24px] bg-[#F5F7FB] p-5 text-[#0A1A3F] lg:grid-cols-[1fr_380px] lg:p-6">
          <div className="grid gap-6">
            <div className="rounded-2xl border border-[#DDE3EC] bg-white p-5 shadow-[0_18px_45px_rgba(10,26,63,0.06)]"><div className="text-sm font-black uppercase tracking-[0.08em]">Featured Highlight</div><div className="mt-4 grid gap-5 md:grid-cols-[1.2fr_1fr]"><div className="grid min-h-64 place-items-center overflow-hidden rounded-xl bg-[#071634] text-white">{hero.thumbnailUrl ? <img src={hero.thumbnailUrl} alt="Featured highlight" className="h-full w-full object-cover" /> : <Film size={46} className="text-white/35" />}</div><div><h2 className="text-2xl font-black">{text(hero.title)}</h2><p className="mt-3 text-sm font-semibold leading-6 text-[#66718F]">{hero.videoUrl || hero.thumbnailUrl ? "Featured media is ready for visitors." : "No highlight has been published yet."}</p><button className="mt-6 rounded-xl border border-[#C7CDD6] px-5 py-3 text-sm font-black">View All Highlights</button></div></div></div>
            <div className="grid gap-4 md:grid-cols-4"><EmptyPanel title="Stats" detail="No public stats yet." /><EmptyPanel title="Film Library" detail="No film uploaded yet." /><EmptyPanel title="Awards" detail="No awards listed yet." /><EmptyPanel title="Academics" detail="No academic info listed yet." /></div>
          </div>
          <aside className="grid content-start gap-6"><EmptyPanel title="Recruiting Interest" detail="No public recruiting activity yet." /><EmptyPanel title="About" detail="Profile details appear after the athlete saves them." /><EmptyPanel title="Connect" detail="Contact requests route through MyD1 safety controls." /></aside>
        </section>
      </div>
    </main>
  );
}
