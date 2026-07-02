import Link from "next/link";

export default async function OperationsPreviewPage({ searchParams }: { searchParams?: Promise<{ path?: string; back?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const rawPath = params.path || "/";
  const safePath = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "/";
  const back = params.back && params.back.startsWith("/operations") ? params.back : "/operations";

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071634] px-4 py-3">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Backend preview</p>
            <h1 className="text-xl font-black">Public view inside Operations</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={back} className="rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]">Back to editor</Link>
            <Link href={safePath} target="_blank" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white">Open new tab</Link>
          </div>
        </div>
      </header>
      <iframe title="Public page preview" src={safePath} className="h-[calc(100vh-73px)] w-full border-0 bg-white" />
    </main>
  );
}
