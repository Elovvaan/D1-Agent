import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

const sports = ["Basketball", "Flag Football", "Football Drills", "Soccer", "Volleyball", "Track", "Skill Challenge"];
const eventTypes = ["Team Tournament", "1v1 Battle", "3v3", "5v5", "Skill Challenge", "Combine Drill", "Position Battle"];
const basketballPositions = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"];
const flagFootballPositions = ["Quarterback", "Wide Receiver", "Running Back", "Defensive Back", "Rusher", "Center"];
const soccerPositions = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const playStyles = ["Shooter", "Slasher", "Defender", "Playmaker", "Rebounder", "Deep Threat", "Route Runner", "Lockdown", "Speed", "Hands", "Finisher"];

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none ring-[#8CFF00] placeholder:text-white/35 focus:ring-2" name={name} type={type} placeholder={placeholder} /></label>;
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name={name}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function MultiOptions({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#8CFF00]">{title}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <label key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-2 text-xs font-black text-white"><input name={title.toLowerCase().replaceAll(" ", "-")} type="checkbox" value={item} /> {item}</label>)}</div></div>;
}

export default function LockedInRegisterPage() {
  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/locked-in" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> Back to Locked In</Link>
          <header className="mt-6 rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8CFF00]">Locked In Mode</p>
            <h1 className="mt-3 text-4xl font-black uppercase text-[#F2C200]">Competition Registration</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">This is a separate sport-first competition intake. No MyD1 Pro role onboarding, no recruiting profile, no Choose Your Role screen.</p>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="rounded-[30px] border border-white/12 bg-[#050505] p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><Trophy className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">1 Sport</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">2 Account</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><ShieldCheck className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">3 Team / Players</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><CreditCard className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">4 Event + Payment</p></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport + Competition</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SelectField label="Sport" name="sport" options={sports} />
                  <SelectField label="Competition Type" name="eventType" options={eventTypes} />
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Locked In Account</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Display Name / Gamer Tag" name="displayName" placeholder="How you show up on Locked In" />
                  <Field label="Full Name" name="fullName" placeholder="Player name" />
                  <Field label="Phone" name="phone" placeholder="(555) 123-4567" />
                  <Field label="Email" name="email" type="email" placeholder="you@email.com" />
                  <Field label="Home City" name="city" placeholder="Ogden" />
                  <Field label="Profile Photo" name="profilePhoto" type="file" />
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport Profile</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SelectField label="Basketball Position" name="basketballPosition" options={["Not Basketball", ...basketballPositions]} />
                  <SelectField label="Flag Football Position" name="flagFootballPosition" options={["Not Flag Football", ...flagFootballPositions]} />
                  <SelectField label="Soccer Position" name="soccerPosition" options={["Not Soccer", ...soccerPositions]} />
                  <SelectField label="Looking For Team" name="lookingForTeam" options={["Yes", "No"]} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Height Optional" name="height" placeholder="5'10" />
                  <SelectField label="Dominant Hand / Foot" name="dominantSide" options={["Right", "Left", "Both"]} />
                </div>
                <div className="mt-4"><MultiOptions title="Play Style" items={playStyles} /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team / Event</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Team Name Optional" name="teamName" placeholder="Leave blank for solo drills or looking for team" />
                  <Field label="Captain Name Optional" name="captainName" placeholder="Captain name" />
                  <label className="grid gap-2 text-sm font-black text-white"><span>Event</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name="event"><option>Saturday, May 24 — 2:00 PM — Riverside Park</option><option>Flag Football WR Battle — Coming Soon</option><option>Speed + Agility Challenge — Coming Soon</option></select></label>
                  <label className="grid gap-2 text-sm font-black text-white"><span>Entry Fee</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-[#8CFF00] outline-none" readOnly value="$30.00 team / event price varies" /></label>
                </div>
              </div>

              <button className="mt-8 min-h-12 w-full rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black" type="button">Create Locked In Account + Reserve Slot</button>
            </form>

            <aside className="rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Layer 1 Rules</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-black p-4">Locked In is for all sports and sport competitions.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Players can create an account before joining an event.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Teams, waitlists, drills, and position battles can all use the same account.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">This intake does not create a MyD1 Pro recruiting profile.</div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}
