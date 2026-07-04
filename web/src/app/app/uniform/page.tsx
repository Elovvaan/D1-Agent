import Link from "next/link";
import { ArrowLeft, Palette, Shirt } from "lucide-react";

export default function AppUniformPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Uniform Mode</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Team Kit</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Mobile view for team colors, jersey option, sizes, numbers, and kit status.</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Palette className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Colors</p><p className="text-xs font-semibold text-[#C8D6FF]">Primary, secondary, and accent.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Kit Choice</p><p className="text-xs font-semibold text-[#C8D6FF]">Bring your own, Basic, or Elite.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
