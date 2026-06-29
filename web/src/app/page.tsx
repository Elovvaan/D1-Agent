import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { D1Role } from "@d1/shared";
import {
  Bot,
  Building2,
  Camera,
  Clapperboard,
  GraduationCap,
  Search,
  ShieldCheck,
  Trophy,
  UserRound
} from "lucide-react";
import { Badge, Button, Card, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getRoleHome } from "@/lib/data/services";

const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "media_partner", "admin"]);

const features = [
  { title: "Athlete Profiles", detail: "Build a visibility-safe public home for verified athletic identity.", icon: UserRound, tone: "blue" },
  { title: "Verified Statistics", detail: "Label self-reported, public-record, document, coach, and multi-source data.", icon: ShieldCheck, tone: "green" },
  { title: "Highlight Reels", detail: "Organize clips, film, thumbnails, and public profile media.", icon: Clapperboard, tone: "yellow" },
  { title: "AI Career Assistant", detail: "One intent-aware Agent guides scouting, recruiting, brand, marketing, and career steps.", icon: Bot, tone: "blue" },
  { title: "Recruiting", detail: "Track matches, outreach, coach interest, visits, and pipeline state.", icon: GraduationCap, tone: "blue" },
  { title: "School Directory", detail: "Discover public schools, teams, rosters, schedules, coaches, and stats.", icon: Building2, tone: "green" },
  { title: "Media Partners", detail: "Support photographers, videographers, livestream crews, newspapers, and creators.", icon: Camera, tone: "yellow" },
  { title: "Public Sports Search", detail: "Search athletes, schools, teams, games, tournaments, coaches, and public stats.", icon: Search, tone: "blue" }
] as const;

export default async function LandingPage() {
  const role = (await cookies()).get("d1_role")?.value;
  if (role && roles.has(role as D1Role)) {
    redirect(getRoleHome(role as D1Role));
  }

  return (
    <PublicSiteShell>
      <section className="relative overflow-hidden bg-[#0A1A3F]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(242,194,0,0.22),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(27,63,160,0.62),transparent_34%),linear-gradient(135deg,#0A1A3F,#102D70_54%,#071634)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(5,12,31,0.82))]" />
          <div className="absolute bottom-0 left-0 right-0 h-36 opacity-55 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="absolute right-[8%] top-24 hidden h-[430px] w-[310px] rounded-t-[180px] border border-white/10 bg-white/[0.06] shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:block">
            <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full bg-white/18" />
            <div className="absolute bottom-0 left-1/2 h-72 w-40 -translate-x-1/2 rounded-t-[90px] bg-white/14" />
            <div className="absolute bottom-28 left-10 h-28 w-14 -rotate-12 rounded-full bg-white/10" />
            <div className="absolute bottom-28 right-10 h-28 w-14 rotate-12 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="relative mx-auto grid min-h-[680px] max-w-[1440px] content-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <Badge tone="yellow">Verified profiles</Badge>
              <Badge tone="green">Public sports directory</Badge>
              <Badge>One AI career Agent</Badge>
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build Your Athletic Career.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-[#DDE8FF]">
              MyD1 helps athletes build verified profiles, organize highlights, connect with coaches, and grow their athletic career from youth sports through the professional level.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/get-started" variant="cta" className="sm:min-w-40">Get Started</Button>
              <Button href="/search" variant="secondary" className="sm:min-w-40">Explore Athletes</Button>
            </div>
          </div>

          <Card className="h-fit bg-white/95 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.12em] text-[#1B3FA0]">Career Path</div>
                <div className="mt-2 text-2xl font-black">A1 to D1</div>
              </div>
              <Trophy className="text-[#F2C200]" size={34} />
            </div>
            <div className="mt-5 grid gap-3">
              {["A1 Foundation", "B1 Recruit", "C1 College", "D1 Elite"].map((item, index) => (
                <div className="flex items-center gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={item}>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#EAF0FF] text-sm font-black text-[#1B3FA0]">{index + 1}</span>
                  <span className="text-sm font-black text-[#0A1A3F]">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1B3FA0]">Platform</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0A1A3F]">Everything around the athlete, organized.</h2>
          </div>
          <Button href="/search" variant="secondary">Search Public Directory</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <StatCard key={feature.title} label={feature.title} value="" detail={feature.detail} icon={feature.icon} tone={feature.tone} />
          ))}
        </div>
      </section>
    </PublicSiteShell>
  );
}
