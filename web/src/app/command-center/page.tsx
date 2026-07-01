import {
  ArrowRight,
  Check,
  CloudUpload,
  GraduationCap,
  MessageSquare,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/design-system";
import { StoredHeroCutout } from "@/components/stored-hero-cutout";
import { getAthleteHeroMedia, getCommandCenterData, toTitle } from "@/lib/data/services";

export default function CommandCenterPage() {
  const data = getCommandCenterData();
  const heroMedia = getAthleteHeroMedia(data.athlete.id);
  const hasHeroBackground = Boolean(heroMedia.videoUrl || heroMedia.thumbnailUrl);

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <section className="relative overflow-hidden rounded-lg border border-[#DDE3EC] bg-[#0A1A3F] px-6 py-8 shadow-[0_18px_50px_rgba(10,26,63,0.08)] lg:px-8">
            <div className="absolute inset-0">
              {heroMedia.videoUrl ? (
                <video aria-label={`${data.athlete.fullName} featured highlight background`} autoPlay className="h-full w-full object-cover" loop muted playsInline poster={heroMedia.posterUrl}><source src={heroMedia.videoUrl} /></video>
              ) : heroMedia.thumbnailUrl ? (
                <div aria-label={`${data.athlete.fullName} highlight background`} className="h-full w-full bg-cover bg-center" role="img" style={{ backgroundImage: `url(${heroMedia.thumbnailUrl})` }} />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#0A1A3F,#123B91_58%,#071634)]" />
              )}
              <div className="absolute inset-0 bg-[#0A1A3F]/72" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,26,63,0.95),rgba(10,26,63,0.74),rgba(10,26,63,0.34))]" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">Good Morning, {data.athlete.fullName.split(" ")[0]}.<span className="mt-2 block text-[#F2C200]">I&apos;m your Agent.</span></h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#DDE8FF]">I checked your saved profile, media, recruiting board, and verification signals. Your next actions are based only on real data in MyD1.</p>
              <p className="mt-3 max-w-xl text-sm font-black leading-6 text-white">{data.missionStatus[0]?.label}: {data.missionStatus[0]?.value} - {data.missionStatus[1]?.label}: {data.missionStatus[1]?.value}</p>
              {!hasHeroBackground && !heroMedia.playerCutoutUrl ? <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white">Upload your first highlight and player photo to personalize your Command Center.</div> : !heroMedia.playerCutoutUrl ? <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white">Upload a player photo to personalize your Command Center.</div> : null}
              <div className="mt-6 flex flex-wrap gap-2"><Badge tone="yellow">Agent active</Badge><Badge tone={data.coachConnection.connected ? "green" : "silver"}>{data.coachConnection.connected ? "Coach connected" : "Coach not connected"}</Badge><Badge tone={hasHeroBackground ? "blue" : "silver"}>{hasHeroBackground ? "Media connected" : "Media pending"}</Badge></div>
            </div>
            <div className="absolute bottom-0 right-2 z-10 hidden h-[105%] w-[38%] lg:block">
              <StoredHeroCutout src={heroMedia.playerCutoutUrl} label={`${data.athlete.fullName} player cutout`} className="absolute bottom-0 right-3 h-full max-h-[390px] w-full object-contain object-bottom drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)]" />
              {!heroMedia.playerCutoutUrl ? <div className="absolute bottom-0 right-12 h-64 w-44"><div className="absolute bottom-0 left-1/2 h-48 w-28 -translate-x-1/2 rounded-t-[80px] bg-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.32)]" /><div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-white/20" /><div className="absolute bottom-16 left-0 h-20 w-12 rotate-[-18deg] rounded-full bg-white/12" /><div className="absolute bottom-16 right-0 h-20 w-12 rotate-[18deg] rounded-full bg-white/12" /></div> : null}
            </div>
          </section>
          <Card className="mt-6"><h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#111827]">Mission Status</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.missionStatus.map((metric) => <StatusMetric key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />)}</div></Card>
        </div>
        <div className="grid gap-6"><SideCard title="Upcoming Events" detail="No calendar events yet." /><SideCard title="Top College Matches" detail="No recruiting targets yet." /><SideCard title="Coach Connection" detail="Coach not connected" /><SideCard title="Trust Score" detail={`${data.trustScore.score} Low`} /></div>
      </div>
    </AppShell>
  );
}

function StatusMetric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-lg border border-[#DDE3EC] bg-white p-4"><div className="text-xs font-black uppercase tracking-[0.08em] text-[#66718F]">{label}</div><div className="mt-2 text-3xl font-black text-[#0A1A3F]">{value}</div><p className="mt-2 text-sm leading-5 text-[#66718F]">{detail}</p></article>; }
function SideCard({ title, detail }: { title: string; detail: string }) { return <Card><h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#66718F]">{title}</h2><div className="mt-4 rounded-lg border border-[#E1E6EF] p-4 text-sm font-semibold text-[#66718F]">{detail}</div></Card>; }
