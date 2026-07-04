import Link from "next/link";
import { ArrowLeft, Dumbbell, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { signUpAthlete } from "../actions";

const sports = ["Basketball", "Flag Football", "Football", "Soccer", "Volleyball", "Track", "Skill Challenge"];
const positions = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center", "Quarterback", "Wide Receiver", "Running Back", "Defensive Back", "Rusher", "Forward", "Midfielder", "Defender", "Goalkeeper", "Athlete"];
const playStyles = ["Shooter", "Slasher", "Defender", "Playmaker", "Rebounder", "Deep Threat", "Route Runner", "Lockdown", "Speed", "Hands", "Finisher", "All Around"];

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input required={required} name={name} type={type} className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" /></label>;
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select name={name} className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export default function AppAthleteSignUpPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md pb-12">
        <Link href="/app/sign-in" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> Back to Sign In</Link>
        <section className="mt-5 rounded-[32px] border border-[#8CFF00]/35 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Athlete Sign Up</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Create Player Card</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Build your MYD1 athlete profile before checking in, joining teams, registering for events, and saving highlights.</p>
          <form action={signUpAthlete} className="mt-6 grid gap-4">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center gap-2 text-[#F2C200]"><UserRound size={18} /><p className="text-xs font-black uppercase tracking-[0.2em]">Account</p></div><div className="mt-4 grid gap-3"><Field label="Full Name" name="fullName" required /><Field label="Display Name / Gamer Tag" name="displayName" /><Field label="Email" name="email" type="email" /><Field label="Phone" name="phone" /><Field label="City" name="city" /></div></div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center gap-2 text-[#F2C200]"><Trophy size={18} /><p className="text-xs font-black uppercase tracking-[0.2em]">Sport Profile</p></div><div className="mt-4 grid gap-3"><Select label="Age Group" name="ageGroup" options={["Youth", "High School", "Adult", "Open"]} /><Select label="Primary Sport" name="sport" options={sports} /><Select label="Position" name="position" options={positions} /><Field label="Height Optional" name="height" /><Select label="Dominant Hand / Foot" name="dominantSide" options={["Right", "Left", "Both"]} /><Select label="Play Style" name="playStyle" options={playStyles} /></div></div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center gap-2 text-[#F2C200]"><Dumbbell size={18} /><p className="text-xs font-black uppercase tracking-[0.2em]">Team Status</p></div><div className="mt-4 grid gap-3"><Select label="Looking For Team?" name="lookingForTeam" options={["Yes", "No", "Already on a team"]} /></div></div>
            <button className="min-h-12 rounded-2xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-black" type="submit">Create Athlete Profile</button>
          </form>
        </section>
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4"><div className="flex gap-3"><ShieldCheck className="text-[#F2C200]" /><p className="text-sm font-semibold leading-6 text-[#C8D6FF]">This creates the app-side athlete profile record and signs the player into Athlete Mode.</p></div></section>
      </div>
    </main>
  );
}
