import { Clapperboard, CloudUpload, PlayCircle, Radio, Video } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { FilmUploadForm } from "@/components/film-upload-form";
import { UploadedVideoPreview } from "@/components/uploaded-video-preview";
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
  "film-uploaded": "Film uploaded. Playback is preparing in the library.",
  "film-upload-error": "Film could not be uploaded. Choose a supported video within the size limit."
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
    icon: game.source === "upload" ? PlayCircle : Video
  }));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Film engine"
        title="My Film"
        description="Upload, preview, and organize real game or practice film for your recruiting profile."
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
            <SectionTitle title="Upload Film" caption="The library shows the saved video as soon as upload finishes." />
            <FilmUploadForm />
          </Card>
          <Card>
            <SectionTitle title="Game Library" action={<Badge tone={uploads.films.length || films.length ? "blue" : "silver"}>{uploads.films.length + films.length} active games</Badge>} />
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
                    <UploadedVideoPreview src={film.url} title={film.title} />
                  </div>
                ))}
              </div>
            ) : null}
            <ObjectList items={gameItems} />
            {!uploads.films.length && !gameItems.length ? (
              <p className="mt-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No film uploaded yet. Upload real game or practice film to build your library.</p>
            ) : null}
          </Card>
        </div>
        <div className="grid gap-4">
          <StatCard label="Full Games" value={`${uploads.films.length + films.length}`} detail="Stored and ready for review." icon={Video} />
          <StatCard label="AI Highlights" value={`${highlights.length}`} detail={highlights.length ? "Saved highlights are available." : "No highlights generated yet."} icon={Clapperboard} tone="yellow" />
          <StatCard label="Stream Status" value="Not connected" detail="Livestream ingestion is not connected yet." icon={Radio} tone="silver" />
        </div>
      </div>
    </AppShell>
  );
}
