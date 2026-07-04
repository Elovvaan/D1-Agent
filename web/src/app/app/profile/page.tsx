import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Camera, ShieldCheck, Star, Trophy, UserRound } from "lucide-react";
import { competitionDivisionLabel, deriveAthleteEligibility } from "@/lib/athlete-eligibility";

type SavedProfile = { athleteId?: string; fullName?: string; dateOfBirth?: string; age?: number; competitionDivision?: string; competitionDivisionLabel?: string; verifiedAthlete?: string; currentTeam?: string; activeWristbandId?: string; lastCheckIn?: string; eventsPlayed?: number; weighIns?: number; championships?: number };
function readProfile() { try { const filePath = resolve(process.cwd(), "..", "data", "user-state", "profile.json"); if (!existsSync(filePath)) return {} as SavedProfile; return JSON.parse(readFileSync(filePath, "utf8")) as SavedProfile; } catch { return {} as SavedProfile; } }
function statusLine(value?: string | number) { return value === undefined || value === "" ? "Not set" : String(value); }

export default function AppProfilePage() {
  const profile = readProfile();
  const derived = deriveAthleteEligibility(profile.dateOfBirth);
  const division = profile.competitionDivisionLabel || competitionDivisionLabel(profile.competitionDivision || derived.competitionDivision);
  const age = profile.age ?? derived.age;
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#F2C200]/30 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Athlete Profile</p>
          <div className="mt-5 flex items-center gap-4"><div className="grid h-24 w-24 place-items-center rounded-[28px] border border-white/10 bg-black"><UserRound size={42} className="text-[#8CFF00]" /></div><div><h1 className="text-3xl font-black uppercase">{profile.fullName || "Player Card"}</h1><p className="text-sm font-semibold text-[#C8D6FF]">{division} {age ? `· Age ${age}` : ""}</p></div></div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><BadgeCheck className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">Athlete ID</p><p className="text-xs font-semibold text-[#C8D6FF]">{statusLine(profile.athleteId)}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><ShieldCheck className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Verified ID</p><p className="text-xs font-semibold text-[#C8D6FF]">{profile.verifiedAthlete || "Pending"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Star className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Current Team</p><p className="text-xs font-semibold text-[#C8D6FF]">{profile.currentTeam || "Unassigned"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Camera className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Active Wristband</p><p className="text-xs font-semibold text-[#C8D6FF]">{profile.activeWristbandId || "None"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Camera className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Last Checked In</p><p className="text-xs font-semibold text-[#C8D6FF]">{profile.lastCheckIn || "No check-in yet"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Trophy className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Events / Weigh-ins / Champions</p><p className="text-xs font-semibold text-[#C8D6FF]">{profile.eventsPlayed ?? 0} events · {profile.weighIns ?? 0} weigh-ins · {profile.championships ?? 0} championships</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
