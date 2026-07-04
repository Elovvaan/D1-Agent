import Link from "next/link";
import { ArrowLeft, Camera, Star, Trophy, UserRound } from "lucide-react";

export default function AppProfilePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#F2C200]/30 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Athlete Profile</p>
          <div className="mt-5 flex items-center gap-4"><div className="grid h-24 w-24 place-items-center rounded-[28px] border border-white/10 bg-black"><UserRound size={42} className="text-[#8CFF00]" /></div><div><h1 className="text-3xl font-black uppercase">Player Card</h1><p className="text-sm font-semibold text-[#C8D6FF]">Profile, stats, highlights, teams, awards.</p></div></div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Star className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Rank + Reputation</p><p className="text-xs font-semibold text-[#C8D6FF]">Build profile value through real games and events.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Camera className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Highlights</p><p className="text-xs font-semibold text-[#C8D6FF]">Film clips and event media attached to the athlete card.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Trophy className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Awards</p><p className="text-xs font-semibold text-[#C8D6FF]">Champion, MVP, season badges, and verified achievements.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
