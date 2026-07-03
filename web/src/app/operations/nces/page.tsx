import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Database, LinkIcon, Upload } from "lucide-react";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { ingestNcesCcdCsv } from "../actions";
import { syncNcesCcdFromSource } from "../nces-sync-actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type NcesRun = { id: string; fileName?: string; sourceUrl?: string; proposalCount?: number; autoSeeded?: number; status?: string; detection?: { confidence?: number } };

function readRuns() {
  return readJsonSync<{ items?: NcesRun[] }>(userStatePath("operator-nces-runs.json"), { items: [] }).items ?? [];
}

export default async function NcesOperationsPage({ searchParams }: { searchParams?: Promise<{ status?: string; count?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  const runs = readRuns();
  if (!isOperator) return <main className="min-h-screen bg-[#061331] p-8 text-white"><Link className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/operations">Unlock Operations</Link></main>;
  return (
    <main className="min-h-screen bg-[#061331] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black" href="/operations?tab=schools"><ArrowLeft size={16} /> Back to Operations</Link>
        <section className="mt-5 rounded-[32px] border border-white/10 bg-[#10224D] p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Adapter #2 · NCES CCD</p>
          <h1 className="mt-3 text-4xl font-black">NCES CCD Source Sync</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Pull the school directory from an NCES CCD CSV source, normalize it through the adapter, and let the public school directory read those synced records automatically.</p>
          {params.status ? <div className="mt-4 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-3 text-sm font-black text-[#FFE27A]">{params.status === "nces-source-synced" ? `NCES source synced${params.count ? ` · ${params.count} schools` : ""}.` : params.status === "nces-ingested" ? "NCES CSV processed." : params.status}</div> : null}
        </section>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <form action={syncNcesCcdFromSource} className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5">
            <div className="flex items-center gap-3"><LinkIcon className="text-[#F2C200]" /><h2 className="text-2xl font-black">Sync from source URL</h2></div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#CAD7FF]">Use this as the preferred flow. Paste the NCES CCD CSV URL, or leave it blank after setting <span className="font-black text-[#F2C200]">MYD1_NCES_CCD_CSV_URL</span> in Railway.</p>
            <label className="mt-5 grid gap-2 text-sm font-black"><span>Source name</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331]" name="sourceName" defaultValue="NCES CCD Source Sync" /></label>
            <label className="mt-4 grid gap-2 text-sm font-black"><span>NCES CSV source URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331]" name="sourceUrl" placeholder="https://.../ccd-directory.csv" /></label>
            <button className="mt-5 rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit">Fetch + Sync Schools</button>
          </form>
          <form action={ingestNcesCcdCsv} className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5">
            <div className="flex items-center gap-3"><Upload className="text-[#F2C200]" /><h2 className="text-2xl font-black">Manual CSV fallback</h2></div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#CAD7FF]">Keep this fallback for one-off files or offline imports.</p>
            <label className="mt-5 grid gap-2 text-sm font-black"><span>Source name</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331]" name="sourceName" defaultValue="NCES CCD Directory" /></label>
            <label className="mt-4 grid gap-2 text-sm font-black"><span>CSV file</span><input className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#061331]" name="ncesFile" type="file" accept=".csv,text/csv" required /></label>
            <button className="mt-5 rounded-2xl bg-white/[0.12] px-5 py-3 text-sm font-black text-white" type="submit">Detect + Extract</button>
          </form>
        </div>
        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.08] p-5">
          <div className="flex items-center gap-3"><Database className="text-[#F2C200]" /><h2 className="text-2xl font-black">Latest Runs</h2></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {runs.length ? runs.slice(0, 10).map((run) => <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4" key={run.id}><div className="text-sm font-black">{run.sourceUrl ?? run.fileName ?? run.id}</div><div className="mt-1 text-xs font-semibold text-[#9DB5FF]">{run.status ?? "queued"} · {run.autoSeeded ?? 0} schools · {Math.round((run.detection?.confidence ?? 0) * 100)}%</div></div>) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-black text-[#CAD7FF]">No NCES runs yet.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
