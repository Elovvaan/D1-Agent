import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Eye, FileText, ImageIcon, LayoutDashboard, Save, Settings, Sparkles } from "lucide-react";
import { AssetInput } from "@/components/operations/asset-input";
import { getPageProfile } from "@/lib/data/page-profiles";
import { savePageProfile, signInOperator } from "../../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

const editablePages = [
  { id: "home", label: "Home", path: "/" },
  { id: "discover", label: "Discover", path: "/discover" },
  { id: "search", label: "Search", path: "/search" },
  { id: "about", label: "About", path: "/about" },
  { id: "schools", label: "Schools", path: "/schools" },
  { id: "sports", label: "Sports", path: "/sports" },
  { id: "games", label: "Games", path: "/games" },
  { id: "locked-in", label: "Locked In", path: "/locked-in" },
  { id: "athletes", label: "Athletes", path: "/athletes" },
  { id: "parents", label: "Parents / Guardian", path: "/parents" },
  { id: "coaches", label: "Coaches", path: "/coaches" },
  { id: "recruiters", label: "Recruiters", path: "/recruiters" },
  { id: "media-partners", label: "Media Partners", path: "/media-partners" },
  { id: "organizations", label: "Schools & Organizations", path: "/organizations" }
] as const;

type EditablePageId = (typeof editablePages)[number]["id"];

function formatTitle(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function TextInput({ label, name, defaultValue, helper }: { label: string; name: string; defaultValue?: string; helper?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-11 rounded-2xl border border-white/10 bg-white px-4 text-sm font-black text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name={name} defaultValue={defaultValue ?? ""} />{helper ? <span className="text-[11px] font-semibold leading-5 text-[#9DB5FF]">{helper}</span> : null}</label>;
}

function ColorInput({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><span className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white px-3"><input type="color" name={name} defaultValue={defaultValue} className="h-8 w-12 cursor-pointer rounded-xl border-0 bg-transparent" /><span className="text-xs font-black text-[#061331]">{defaultValue}</span></span></label>;
}

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Operations Builder</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Builder</button></form></div></main>;
}

function SectionRail({ activePage }: { activePage: EditablePageId }) {
  const sections = activePage === "locked-in" ? ["Hero", "Event Card", "Format Cards", "Bracket Preview", "Registration CTA"] : ["Hero", "Media", "Copy", "CTA", "Page Settings"];
  return <aside className="rounded-[28px] border border-white/10 bg-white/[0.07] p-3"><p className="px-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Sections</p><div className="mt-3 grid gap-2">{sections.map((section, index) => <a key={section} href={`#section-${index}`} className="rounded-2xl border border-white/10 bg-[#071A43] px-3 py-3 text-sm font-black text-white hover:border-[#F2C200]/50"><span className="mr-2 text-[#F2C200]">{index + 1}.</span>{section}</a>)}</div></aside>;
}

export default async function OperationsEditorPage({ params, searchParams }: { params: Promise<{ pageKey: string }>; searchParams?: Promise<{ status?: string }> }) {
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;

  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const page = editablePages.find((item) => item.id === resolvedParams.pageKey) ?? editablePages[0];
  const pageKey = page.id as EditablePageId;
  const profile = getPageProfile(pageKey);
  const previewPath = page.path;
  const previewSrc = `/operations/preview?path=${encodeURIComponent(previewPath)}&back=${encodeURIComponent(`/operations/editor/${pageKey}`)}`;

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#061331]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Link href={`/operations?tab=${pageKey}`} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.07]"><ArrowLeft size={18} /></Link><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Operations Page Builder</p><h1 className="text-2xl font-black">{page.label}</h1></div></div>
          <div className="flex flex-wrap items-center gap-2"><Link href={previewSrc} className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-black text-white"><Eye size={16} /> Preview</Link><Link href="/operations" className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#F2C200] px-4 text-sm font-black text-[#061331]"><LayoutDashboard size={16} /> Operations</Link></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)_390px] lg:px-8">
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-3"><p className="px-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">Pages</p><div className="mt-3 grid gap-1.5">{editablePages.map((item) => <Link key={item.id} href={`/operations/editor/${item.id}`} className={`rounded-2xl px-3 py-2 text-sm font-black ${item.id === pageKey ? "bg-[#F2C200] text-[#061331]" : "bg-[#071A43] text-white hover:bg-white/[0.1]"}`}>{item.label}</Link>)}</div></div>
          <SectionRail activePage={pageKey} />
        </aside>

        <section className="min-w-0 rounded-[34px] border border-white/10 bg-[#071A43] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Live Canvas</p><h2 className="text-2xl font-black">{page.label} public preview</h2></div>{resolvedSearch.status ? <div className="rounded-2xl border border-[#8CFF00]/35 bg-[#8CFF00]/10 px-4 py-2 text-sm font-black text-[#8CFF00]">Saved</div> : null}</div>
          <div className="overflow-hidden rounded-[28px] border border-white/12 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.35)]"><iframe title={`${page.label} preview`} src={previewSrc} className="h-[780px] w-full bg-white" /></div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form action={savePageProfile} encType="multipart/form-data" className="rounded-[34px] border border-white/10 bg-[#0A1A3F] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <input type="hidden" name="pageKey" value={pageKey} />
            <input type="hidden" name="stateCode" value="" />
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Properties</p><h3 className="text-2xl font-black">Edit {formatTitle(pageKey)}</h3><p className="mt-1 text-xs font-semibold leading-5 text-[#9DB5FF]">Same editor flow for every public page.</p></div><button className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save</button></div>

            <div id="section-0" className="mt-5 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] p-4"><div className="flex items-center gap-2 text-sm font-black text-white"><Sparkles className="text-[#F2C200]" size={16} /> Hero</div><TextInput label="Headline" name="headline" defaultValue={profile?.headline} /><TextInput label="Subheadline" name="subheadline" defaultValue={profile?.subheadline} /><label className="grid gap-2 text-sm font-black text-white"><span>Body copy</span><textarea className="min-h-32 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none focus:ring-2 focus:ring-[#F2C200]" name="body" defaultValue={profile?.body ?? ""} /></label></div>

            <div id="section-1" className="mt-4 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] p-4"><div className="flex items-center gap-2 text-sm font-black text-white"><ImageIcon className="text-[#F2C200]" size={16} /> Media</div><AssetInput label="Cover image" fieldName="coverImageUrl" currentUrl={profile?.coverImageUrl} accept="image/*" helper="Upload, replace, or clear the public page cover." /><AssetInput label="Badge / icon" fieldName="badgeImageUrl" currentUrl={profile?.badgeImageUrl} accept="image/*" helper="Use a logo, badge, or page icon." /><AssetInput label="Feature video" fieldName="featureVideoUrl" currentUrl={profile?.featureVideoUrl} accept="video/*" helper="Attach a video for this page when needed." /></div>

            <div id="section-2" className="mt-4 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] p-4"><div className="flex items-center gap-2 text-sm font-black text-white"><FileText className="text-[#F2C200]" size={16} /> CTA</div><TextInput label="CTA label" name="ctaLabel" defaultValue={profile?.ctaLabel} helper="Button text shown on the public page." /><TextInput label="CTA link" name="ctaHref" defaultValue={profile?.ctaHref} helper="Example: /locked-in/register" /></div>

            <div id="section-3" className="mt-4 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] p-4"><div className="flex items-center gap-2 text-sm font-black text-white"><Settings className="text-[#F2C200]" size={16} /> Style</div><ColorInput label="Background color" name="backgroundColor" defaultValue="#061331" /><ColorInput label="Accent color" name="accentColor" defaultValue="#F2C200" /></div>
          </form>
        </aside>
      </div>
    </main>
  );
}
