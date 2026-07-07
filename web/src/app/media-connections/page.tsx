import Link from "next/link";
import { ArrowLeft, ShieldCheck, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MediaConnectionCard } from "@/components/media-connection-card";
import { connectMediaAccount } from "@/app/actions/media-connection-actions";
import { getConnectedMediaDashboard } from "@/lib/services/media-agent-service";

export default function MediaConnectionsPage({ searchParams }: { searchParams?: { status?: string } }) {
  const dashboard = getConnectedMediaDashboard();
  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="rounded-[32px] bg-[#061331] p-6 text-white shadow-[0_24px_80px_rgba(6,19,49,0.18)]">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-black text-[#CAD7FF]"><ArrowLeft size={16} /> Back to profile</Link>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Connected Media Engine</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Connect your media</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Give MyD1 permission to organize approved highlights from the platforms you already use. Nothing publishes automatically. Media goes to review first.</p>
            </div>
            <div className="rounded-[24px] border border-[#8CFF00]/30 bg-[#8CFF00]/10 p-4"><ShieldCheck className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">Permission first</p><p className="mt-1 text-xs font-semibold leading-5 text-[#CAD7FF]">Connect account. Import media. Review. Publish.</p></div>
          </div>
          {searchParams?.status ? <div className="mt-5 rounded-2xl border border-[#8CFF00]/30 bg-[#8CFF00]/10 px-4 py-3 text-sm font-black text-[#8CFF00]">Media connection updated.</div> : null}
        </div>

        <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <form action={connectMediaAccount} className="rounded-[30px] border border-[#DDE3EC] bg-white p-5 shadow-[0_18px_50px_rgba(10,26,63,0.08)]">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]"><UploadCloud /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#1B3FA0]">Add account</p><h2 className="text-2xl font-black">Connect platform</h2></div></div>
            <input type="hidden" name="athleteId" value="athlete-current" />
            <input type="hidden" name="athleteName" value="Current Athlete" />
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-black"><span>Platform</span><select name="platform" className="min-h-12 rounded-2xl border border-[#DDE3EC] px-4 text-sm font-black"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="x">X</option><option value="facebook">Facebook</option></select></label>
              <label className="grid gap-2 text-sm font-black"><span>Handle</span><input name="handle" placeholder="@playername" className="min-h-12 rounded-2xl border border-[#DDE3EC] px-4 text-sm font-black" /></label>
              <label className="grid gap-2 text-sm font-black"><span>Profile URL</span><input name="profileUrl" placeholder="https://..." className="min-h-12 rounded-2xl border border-[#DDE3EC] px-4 text-sm font-semibold" /></label>
              <button className="min-h-12 rounded-2xl bg-[#061331] px-5 text-sm font-black uppercase text-white" type="submit">Connect Media</button>
            </div>
          </form>

          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_50px_rgba(10,26,63,0.08)]"><p className="text-xs font-black uppercase text-[#66718F]">Connected</p><p className="mt-2 text-4xl font-black text-[#061331]">{dashboard.totals.connected}</p></div>
              <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_50px_rgba(10,26,63,0.08)]"><p className="text-xs font-black uppercase text-[#66718F]">Imports</p><p className="mt-2 text-4xl font-black text-[#061331]">{dashboard.totals.imported}</p></div>
              <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_50px_rgba(10,26,63,0.08)]"><p className="text-xs font-black uppercase text-[#66718F]">Review</p><p className="mt-2 text-4xl font-black text-[#061331]">{dashboard.totals.pendingReview}</p></div>
            </div>
            <div className="grid gap-4">{dashboard.connections.length ? dashboard.connections.map((connection) => <MediaConnectionCard key={connection.id} connection={connection} />) : <div className="rounded-[30px] border border-dashed border-[#B8C3D9] bg-white p-8 text-center"><h3 className="text-2xl font-black text-[#061331]">No connected media yet</h3><p className="mt-2 text-sm font-semibold text-[#66718F]">Connect your first platform to start the permission-based media flow.</p></div>}</div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
