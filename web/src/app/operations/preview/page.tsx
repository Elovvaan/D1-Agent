import Link from "next/link";
import { Save } from "lucide-react";
import { getPageProfile } from "@/lib/data/page-profiles";
import { savePreviewPageProfile } from "./actions";

type PreviewPageKey = "home" | "discover" | "search" | "about" | "schools" | "sports" | "games" | "events" | "locked-in";

const editablePages = new Set<PreviewPageKey>(["home", "discover", "search", "about", "schools", "sports", "games", "events", "locked-in"]);

function pathToPageKey(path: string): PreviewPageKey {
  const clean = path.split("?")[0].replace(/^\//, "").split("/")[0] || "home";
  return editablePages.has(clean as PreviewPageKey) ? clean as PreviewPageKey : "home";
}

function labelFor(pageKey: string) {
  return pageKey.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function TextInput({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-white"><span>{label}</span><input name={name} defaultValue={defaultValue ?? ""} className="min-h-11 rounded-xl bg-white px-3 text-sm font-black normal-case tracking-normal text-[#061331] outline-none" /></label>;
}

function AssetInput({ label, name, currentUrl, accept }: { label: string; name: string; currentUrl?: string; accept: string }) {
  const hiddenName = name === "coverImageFile" ? "coverImageUrl" : name === "badgeImageFile" ? "badgeImageUrl" : "featureVideoUrl";
  return <label className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs font-black uppercase tracking-[0.08em] text-white"><span>{label}</span><input type="hidden" name={hiddenName} value={currentUrl ?? ""} /><input name={name} type="file" accept={accept} className="text-xs font-semibold text-[#CAD7FF] file:mr-3 file:rounded-xl file:border-0 file:bg-[#F2C200] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#061331]" />{currentUrl ? <span className="truncate text-[11px] font-semibold normal-case tracking-normal text-[#9DB5FF]">Current asset loaded</span> : null}</label>;
}

export default async function OperationsPreviewPage({ searchParams }: { searchParams?: Promise<{ path?: string; back?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const rawPath = params.path || "/";
  const safePath = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "/";
  const back = params.back && params.back.startsWith("/operations") ? params.back : "/operations";
  const pageKey = pathToPageKey(safePath);
  const canEdit = editablePages.has(pageKey);
  const profile = getPageProfile(pageKey);

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071634] px-4 py-3">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Backend preview</p>
            <h1 className="text-xl font-black">Public view inside Operations</h1>
            {params.status ? <p className="mt-1 text-xs font-black text-[#8CFF00]">Preview edits saved.</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={back} className="rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]">Back to editor</Link>
            <Link href={safePath} target="_blank" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white">Open new tab</Link>
          </div>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[360px_1fr]">
        {canEdit ? <aside className="border-r border-white/10 bg-[#0A1A3F] p-4 lg:h-[calc(100vh-73px)] lg:overflow-y-auto">
          <form action={savePreviewPageProfile} encType="multipart/form-data" className="grid gap-4">
            <input type="hidden" name="pageKey" value={pageKey} />
            <input type="hidden" name="previewPath" value={safePath} />
            <input type="hidden" name="back" value={back} />
            <div className="rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2C200]">Preview edit layer</p>
              <h2 className="mt-1 text-2xl font-black">Edit {labelFor(pageKey)}</h2>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#CAD7FF]">Operations-only editor. Saves to the same public page profile used by the front end.</p>
            </div>
            <TextInput label="Hero headline" name="headline" defaultValue={profile?.headline} />
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-white"><span>Subheadline</span><textarea name="subheadline" defaultValue={profile?.subheadline ?? ""} className="min-h-24 rounded-xl bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#061331] outline-none" /></label>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <TextInput label="CTA label" name="ctaLabel" defaultValue={profile?.ctaLabel} />
              <TextInput label="CTA link" name="ctaHref" defaultValue={profile?.ctaHref} />
            </div>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-white"><span>Body / public copy</span><textarea name="body" defaultValue={profile?.body ?? ""} className="min-h-32 rounded-xl bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#061331] outline-none" /></label>
            <AssetInput label="Cover image" name="coverImageFile" accept="image/*" currentUrl={profile?.coverImageUrl} />
            <AssetInput label="Badge / icon" name="badgeImageFile" accept="image/*" currentUrl={profile?.badgeImageUrl} />
            <AssetInput label="Feature video" name="featureVideoFile" accept="video/*" currentUrl={profile?.featureVideoUrl} />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save preview edits</button>
          </form>
        </aside> : null}
        <iframe title="Public page preview" src={safePath} className="h-[calc(100vh-73px)] w-full border-0 bg-white" />
      </div>
    </main>
  );
}
