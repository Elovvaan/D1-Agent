import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none ring-[#8CFF00] placeholder:text-white/35 focus:ring-2" name={name} type={type} placeholder={placeholder} /></label>;
}

export default function LockedInRegisterPage() {
  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/locked-in" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> Back to Locked In</Link>
          <header className="mt-6 rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8CFF00]">Locked In Mode</p>
            <h1 className="mt-3 text-4xl font-black uppercase text-[#F2C200]">Team Registration</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">This is a separate competition intake. No MyD1 athlete profile, no Choose Your Role screen, no recruiting onboarding.</p>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="rounded-[30px] border border-white/12 bg-[#050505] p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><Users className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">1 Team Info</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><ShieldCheck className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">2 Add Players</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><CreditCard className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">3 Event + Payment</p></div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Team Name" name="teamName" placeholder="Enter team name" />
                <Field label="Team Captain" name="captainName" placeholder="Captain name" />
                <Field label="Captain Phone" name="captainPhone" placeholder="(555) 123-4567" />
                <Field label="Captain Email" name="captainEmail" type="email" placeholder="you@email.com" />
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Players</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Player 1" name="player1" placeholder="Player name" />
                  <Field label="Player 2" name="player2" placeholder="Player name" />
                  <Field label="Player 3" name="player3" placeholder="Player name" />
                  <Field label="Player 4 Optional Sub" name="player4" placeholder="Optional" />
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-black text-white"><span>Event</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name="event"><option>Saturday, May 24 — 2:00 PM — Riverside Park</option></select></label>
                  <label className="grid gap-2 text-sm font-black text-white"><span>Team Entry Fee</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-[#8CFF00] outline-none" readOnly value="$30.00" /></label>
                </div>
              </div>

              <button className="mt-8 min-h-12 w-full rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black" type="button">Reserve Team Slot</button>
            </form>

            <aside className="rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Slot Rules</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-black p-4">First 8 paid teams are confirmed.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Next 4 teams are waitlisted.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Check-in closes 30 minutes before tipoff.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">This intake does not create a MyD1 Pro profile.</div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}
