import { Download, PlayCircle, Scissors, Share2, Sparkles } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recordUnavailableAction, saveHighlightUpload } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/design-system";
import { getHighlights } from "@/lib/data/services";

function readUploads() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "uploads.json");
    if (!existsSync(filePath)) {
      return { highlights: [] as Array<{ title: string; name: string; url: string; uploadedAt: string }> };
    }
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { highlights?: Array<{ title: string; name: string; url: string; uploadedAt: string }> };
    return { highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [] };
  } catch {
    return { highlights: [] as Array<{ title: string; name: string; url: string; uploadedAt: string }> };
  }
}

const statusCopy: Record<string, string> = {
  "highlight-uploaded": "Highlight uploaded and added to your reel builder.",
  "generate-starter-reel-unavailable": "Starter reel generation is intentionally unavailable until the media processing backend is connected.",
  "open-editor-unavailable": "The highlight editor is intentionally unavailable until media processing is connected.",
  "share-highlight-unavailable": "Highlight sharing is intentionally unavailable until published reel storage is connected.",
  "export-highlight-unavailable": "Highlight export is intentionally unavailable until the media rendering backend is connected."
};

function UnavailableButton({ action, children, variant = "secondary" }: { action: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <form action={recordUnavailableAction}>
      <input type="hidden" name="returnTo" value="/highlights" />
      <input type="hidden" name="action" value={action} />
      <Button variant={variant}>{children}</Button>
    </form>
  );
}

export default async function HighlightsPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const clips = getHighlights();
  const uploads = readUploads();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Highlight engine"
        title="Highlights"
        description="AI-generated clips are scored, labeled, ordered, and prepared for reels without making the athlete operate a video editor."
        action={<UnavailableButton action="generate-starter-reel" variant="primary"><Sparkles size={17} /> Generate Starter Reel</UnavailableButton>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <Card className="mb-6">
        <SectionTitle title="Upload Highlight" caption="Uploaded highlights are stored locally and displayed in the reel builder immediately." />
        <form action={saveHighlightUpload} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
            Highlight title
            <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="title" placeholder="Fourth quarter touchdown" required />
          </label>
          <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
            Highlight file
            <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="highlight" type="file" accept="video/*" required />
          </label>
          <Button variant="cta">Upload Highlight</Button>
        </form>
      </Card>
      <Card>
        <SectionTitle title="Reel Builder" action={<UnavailableButton action="open-editor"><Scissors size={16} /> Open Editor</UnavailableButton>} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {uploads.highlights.map((clip) => (
            <article className="overflow-hidden rounded-[18px] border border-[#DDE3EC] bg-white shadow-[0_14px_34px_rgba(10,26,63,0.08)]" key={`${clip.url}-${clip.uploadedAt}`}>
              <video className="aspect-video w-full bg-[#0A1A3F]" src={clip.url} controls preload="metadata" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-black">{clip.title}</h2>
                  <Badge tone="green">Uploaded</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-[#66718F]">{clip.name} - uploaded {new Date(clip.uploadedAt).toLocaleString()}.</p>
                <div className="mt-4 flex gap-2">
                  <UnavailableButton action="share-highlight"><Share2 size={15} /> Share</UnavailableButton>
                  <UnavailableButton action="export-highlight" variant="ghost"><Download size={15} /> Export</UnavailableButton>
                </div>
              </div>
            </article>
          ))}
          {clips.map((clip, index) => (
            <article className="overflow-hidden rounded-[18px] border border-[#DDE3EC] bg-white shadow-[0_14px_34px_rgba(10,26,63,0.08)]" key={clip.id}>
              <div className="grid aspect-video place-items-center bg-[#0A1A3F] text-white">
                <PlayCircle size={42} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-black">{clip.title}</h2>
                  <Badge tone={clip.score >= 90 ? "yellow" : "blue"}>{clip.score >= 90 ? "Elite" : "AI"}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-[#66718F]">Score {clip.score} - {clip.verified ? "verified roster context attached" : "verification pending"}.</p>
                <div className="mt-4 flex gap-2">
                  <UnavailableButton action="share-highlight"><Share2 size={15} /> Share</UnavailableButton>
                  <UnavailableButton action="export-highlight" variant="ghost"><Download size={15} /> Export</UnavailableButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
