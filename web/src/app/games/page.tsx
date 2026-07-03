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

function labelDate(game: GameRecord) {
  return [game.gameDate, game.gameTime].filter(Boolean).join(" • ");
}

export default function GamesPage() {
  const games = readGames();

  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-[#061331] text-white">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(27,63,160,0.55),transparent_32%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-[1440px]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Games</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">Game hub.</h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[#C8D6FF]">Approved and newly entered games from Operations appear here with schedules, scores, schools, teams, and media.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><CalendarDays className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Schedule</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">{games.length} game records.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><Trophy className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Scores</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Final scores after entry.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><Film className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Media</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Game film and thumbnails.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><MapPin className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">States</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Filter by location later.</p></div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {games.map((game) => (
                <a key={game.id} href={`/games/${game.id}`} className="overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] transition hover:-translate-y-1 hover:border-[#F2C200]/60">
                  <div className="grid min-h-48 place-items-center bg-[#071634]">
                    {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" className="h-full min-h-48 w-full object-cover" /> : <Film className="text-white/35" size={44} />}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#F2C200]"><span>{game.state}</span><span>{game.sport}</span><span>{game.status}</span></div>
                    <h2 className="mt-3 text-2xl font-black">{game.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#C8D6FF]">{game.homeTeam} vs {game.awayTeam}</p>
                    <p className="mt-2 text-sm font-semibold text-[#9DB5FF]">{labelDate(game)}</p>
                    {game.homeScore || game.awayScore ? <p className="mt-4 text-3xl font-black text-white">{game.homeScore || "0"} - {game.awayScore || "0"}</p> : null}
                  </div>
                </a>
              ))}
            </div>

            {!games.length ? <div className="mt-10 rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center text-sm font-semibold text-[#C8D6FF]">No games have been entered yet. Add the first game from Operations.</div> : null}
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
