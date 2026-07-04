import Link from "next/link";
import { ArrowLeft, Search, Trophy, UserRound, Users } from "lucide-react";

export default function AppSearchPage() {
  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white">
      <div className="mx-auto max-w-md pb-20">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-black p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">App Search</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Find</h1>
          <label className="mt-5 flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 text-[#061331]"><Search size={18} /><input className="w-full bg-transparent text-sm font-black outline-none" placeholder="Search athletes, teams, events" /></label>
        </section>
        <section className="mt-5 grid gap-3">
          <Link href="/app/events" className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4"><Trophy className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Events</p><p className="text-xs font-semibold text-[#C8D6FF]">Find competitions and registration.</p></Link>
          <Link href="/app/team" className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Teams</p><p className="text-xs font-semibold text-[#C8D6FF]">Find rosters and team identity.</p></Link>
          <Link href="/app/profile" className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4"><UserRound className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Athletes</p><p className="text-xs font-semibold text-[#C8D6FF]">Find athlete cards and highlights.</p></Link>
        </section>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-white/10 bg-[#061331]/95 px-4 py-3 backdrop-blur"><div className="grid grid-cols-5 gap-2 text-center text-[10px] font-black uppercase text-[#C8D6FF]"><Link href="/app">Home</Link><Link href="/app/events">Events</Link><Link href="/app/check-in">Scan</Link><Link href="/app/team">Team</Link><Link href="/app/profile">Profile</Link></div></nav>
      </div>
    </main>
  );
}
