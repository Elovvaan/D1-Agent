import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDays, Film, MapPin, Trophy } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GameRecord = {
  id: string;
  state: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  school?: string;
  venue?: string;
  gameDate: string;
  gameTime?: string;
  status: string;
  homeScore?: string;
  awayScore?: string;
  title: string;
  notes?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
};

function readGames() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "games.json");
    if (!existsSync(filePath)) return [] as GameRecord[];
    const data = JSON.parse(readFileSync(filePath, "utf8")) as { items?: GameRecord[] };
    return data.items ?? [];
  } catch {
    return [] as GameRecord[];
  }
}

export default async function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = readGames().find((item) => item.id === gameId);

  if (!game) {
    return <PublicSiteShell variant="dark"><main className="min-h-screen bg-[#061331] px-4 py-16 text-white"><div className="mx-auto max-w-3xl rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center"><h1 className="text-3xl font-black">Game not found</h1><a className="mt-5 inline-flex rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/games">Back to Games</a></div></main></PublicSiteShell>;
  }

  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-[#061331] text-white">
        <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(27,63,160,0.55),transparent_32%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
          <div className="relative mx-auto max-w-[1440px]">
            <a href="/games" className="text-sm font-black text-[#F2C200]">← Back to Games</a>
            <div className="mt-6 overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.06]">
              <div className="grid min-h-[360px] place-items-center bg-[#071634]">
                {game.videoUrl ? <video controls className="h-full max-h-[620px] w-full object-cover" poster={game.thumbnailUrl || undefined}><source src={game.videoUrl} /></video> : game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" className="h-full min-h-[360px] w-full object-cover" /> : <Film size={60} className="text-white/35" />}
              </div>
              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
                <div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#F2C200]"><span>{game.state}</span><span>{game.sport}</span><span>{game.status}</span></div>
                  <h1 className="mt-4 text-5xl font-black tracking-tight">{game.title}</h1>
                  <p className="mt-4 text-lg font-semibold text-[#C8D6FF]">{game.homeTeam} vs {game.awayTeam}</p>
                  {game.notes ? <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-[#C8D6FF]">{game.notes}</p> : null}
                </div>
                <aside className="grid content-start gap-3">
                  <div className="rounded-2xl border border-white/12 bg-[#071634] p-4"><Trophy className="text-[#F2C200]" /><div className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#9DB5FF]">Score</div><div className="mt-2 text-4xl font-black">{game.homeScore || "0"} - {game.awayScore || "0"}</div></div>
                  <div className="rounded-2xl border border-white/12 bg-[#071634] p-4"><CalendarDays className="text-[#F2C200]" /><div className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#9DB5FF]">Date</div><div className="mt-2 text-lg font-black">{[game.gameDate, game.gameTime].filter(Boolean).join(" • ")}</div></div>
                  <div className="rounded-2xl border border-white/12 bg-[#071634] p-4"><MapPin className="text-[#F2C200]" /><div className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#9DB5FF]">Location</div><div className="mt-2 text-lg font-black">{game.venue || game.school || game.state}</div></div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
