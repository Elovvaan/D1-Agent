import { Clapperboard, CloudUpload, PlayCircle, Radio, Video } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { saveFilmUpload } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getFilms, getGames, getHighlights, toTitle } from "@/lib/data/services";

function readUploads() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "uploads.json");
    if (!existsSync(filePath)) {
      return { films: [] as Array<{ title: string; name: string; url: string; uploadedAt: string }> };
    }
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { films?: Array<{ title: string; name: string; url: string; uploadedAt: string }> };
    return { films: Array.isArray(parsed.films) ? parsed.films : [] };
  } catch {
    return { films: [] as Array<{ title: string; name: string; url: string; uploadedAt: string }> };
  }
}

const statusCopy: Record<string, string> = {
  "film-uploaded": "Film uploaded and added to your library."
};

export default async function FilmPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const games = getGames();
  const films = getFilms();
  const highlights = getHighlights();
  const uploads = readUploads();
  const gameItems = games.slice(1).map((game) => ({
    title: game.opponent,
    detail: `${toTitle(game.source)} full game - ${game.highlightCount} highlights ${game.status === "ready" ? "ready" : game.status}`,
    badge: toTitle(game.status),
    tone: game.status === "ready" ? ("green" as const) : game.status === "processing" ? ("yellow" as const) : ("blue" as const),
    icon: game.source === "stream" ? Radio : game.source === "upload" ? PlayCircle : Video
  }));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Film engine"
        title="My Film"
        description="Upload, stream, process, and review every game as context-rich recruiting fuel."
        action={<Button href="#upload-film" variant="cta"><CloudUpload size={17} /> Upload Film</Button>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#BDECCB] bg-[#EAF8F0] px-4 py-3 text-sm font-black text-[#17833F]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card id="upload-film">
            <SectionTitle title="Upload Film" caption="Uploaded files are stored locally and immediately appear in the game library." />
            <form action={saveFilmUpload} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Film title
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="title" placeholder="Varsity Game vs Central" required />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Video file
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="film" type="file" accept="video/*" required />
              </label>
              <Button variant="cta"><CloudUpload size={17} /> Upload</Button>
            </form>
          </Card>
          <Card>
            <SectionTitle title="Game Library" action={<Badge tone="blue">{games.length + uploads.films.length} active games</Badge>} />
            {uploads.films.length ? (
              <div className="mb-4 grid gap-3">
                {uploads.films.map((film) => (
                  <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-3" key={`${film.url}-${film.uploadedAt}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-[#0A1A3F]">{film.title}</p>
                        <p className="mt-1 text-xs font-medium text-[#66718F]">{film.name} - uploaded {new Date(film.uploadedAt).toLocaleString()}</p>
                      </div>
                      <a className="text-sm font-black text-[#1B3FA0]" href={film.url}>Open uploaded film</a>
                    </div>
                    <video className="mt-3 aspect-video w-full rounded-xl bg-[#0A1A3F]" src={film.url} controls preload="metadata" />
                  </div>
                ))}
              </div>
            ) : null}
            <ObjectList items={gameItems} />
          </Card>
        </div>
        <div className="grid gap-4">
          <StatCard label="Full Games" value={`${films.length + uploads.films.length}`} detail="Stored and indexed for recruiting workflows." icon={Video} />
          <StatCard label="AI Highlights" value={`${highlights.length}`} detail="Ranked by highlight-worthiness." icon={Clapperboard} tone="yellow" />
          <StatCard label="Stream Status" value="Ready" detail="Managed live input provisioned." icon={Radio} tone="green" />
        </div>
      </div>
    </AppShell>
  );
}
