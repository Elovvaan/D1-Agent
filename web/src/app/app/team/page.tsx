import Link from "next/link";
import { ArrowLeft, Shirt, Trophy, Users } from "lucide-react";

export default function AppTeamPage() {
  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-black p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">My Team</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Team Card</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">V1 mobile team hub for roster, colors, uniforms, event status, and bracket placement.</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Roster</p><p className="text-xs font-semibold text-[#C8D6FF]">Players and captain approval.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Uniforms</p><p className="text-xs font-semibold text-[#C8D6FF]">Team colors, kit choice, sizes, names, and numbers.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Trophy className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Competition</p><p className="text-xs font-semibold text-[#C8D6FF]">Seed, bracket, schedule, and court assignment.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
