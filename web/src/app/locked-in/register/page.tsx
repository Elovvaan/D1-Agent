import Link from "next/link";
import { ArrowLeft, CreditCard, DollarSign, Palette, Receipt, ShieldCheck, Shirt, Trophy, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

const sports = ["Basketball", "Flag Football", "Football Drills", "Soccer", "Volleyball", "Track", "Skill Challenge"];
const eventTypes = ["Team Tournament", "1v1 Battle", "3v3", "5v5", "Skill Challenge", "Combine Drill", "Position Battle"];
const basketballPositions = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"];
const flagFootballPositions = ["Quarterback", "Wide Receiver", "Running Back", "Defensive Back", "Rusher", "Center"];
const soccerPositions = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const playStyles = ["Shooter", "Slasher", "Defender", "Playmaker", "Rebounder", "Deep Threat", "Route Runner", "Lockdown", "Speed", "Hands", "Finisher"];
const jerseySizes = ["Youth M", "Youth L", "S", "M", "L", "XL", "2XL", "3XL"];
const uniformOptions = [
  { name: "Bring My Own", price: "$0", detail: "Player brings a jersey that matches the team color. MY D1 number can be assigned digitally." },
  { name: "MY D1 Basic Kit", price: "Add-on", detail: "Jersey + shorts with heat-pressed MY D1 logo, name, and number." },
  { name: "MY D1 Elite Kit", price: "Premium", detail: "Premium kit with upgraded patches, stitched look, season badge, and collector finish." }
];

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white outline-none ring-[#8CFF00] placeholder:text-white/35 focus:ring-2" name={name} type={type} placeholder={placeholder} /></label>;
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name={name}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><span className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black px-3"><input className="h-8 w-12 cursor-pointer rounded-lg border-0 bg-transparent" name={name} type="color" defaultValue={defaultValue} /><span className="text-xs font-black uppercase text-white/70">{defaultValue}</span></span></label>;
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
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Team creation, team colors, and uniform choices are now part of registration so each squad can build its own MY D1 identity.</p>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="rounded-[30px] border border-white/12 bg-[#050505] p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="rounded-2xl border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><Trophy className="text-[#8CFF00]" /><p className="mt-3 text-sm font-black uppercase">1 Sport</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Users className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">2 Account</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Palette className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">3 Identity</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Shirt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">4 Uniform</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Receipt className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">5 Confirm</p></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport + Competition</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Sport" name="sport" options={sports} /><SelectField label="Competition Type" name="eventType" options={eventTypes} /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Locked In Account</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Display Name / Gamer Tag" name="displayName" placeholder="How you show up on Locked In" /><Field label="Full Name" name="fullName" placeholder="Player name" /><Field label="Phone" name="phone" placeholder="(555) 123-4567" /><Field label="Email" name="email" type="email" placeholder="you@email.com" /><Field label="Home City" name="city" placeholder="Ogden" /><Field label="Profile Photo" name="profilePhoto" type="file" /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Sport Profile</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Basketball Position" name="basketballPosition" options={["Not Basketball", ...basketballPositions]} /><SelectField label="Flag Football Position" name="flagFootballPosition" options={["Not Flag Football", ...flagFootballPositions]} /><SelectField label="Soccer Position" name="soccerPosition" options={["Not Soccer", ...soccerPositions]} /><SelectField label="Looking For Team" name="lookingForTeam" options={["Yes", "No"]} /></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Height Optional" name="height" placeholder="5'10" /><SelectField label="Dominant Hand / Foot" name="dominantSide" options={["Right", "Left", "Both"]} /></div>
                <div className="mt-4"><MultiOptions title="Play Style" items={playStyles} /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Team Identity</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Team Name" name="teamName" placeholder="Southside Kings" /><Field label="Captain Name Optional" name="captainName" placeholder="Captain name" /><Field label="Team City / Area" name="teamCity" placeholder="Ogden / Alabama / Riverside" /><SelectField label="Roster Role" name="rosterRole" options={["Captain", "Player", "Free Agent", "Substitute"]} /></div>
                <div className="mt-4 grid gap-4 md:grid-cols-3"><ColorField label="Primary Color" name="primaryColor" defaultValue="#000000" /><ColorField label="Secondary Color" name="secondaryColor" defaultValue="#8CFF00" /><ColorField label="Accent Color" name="accentColor" defaultValue="#F2C200" /></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Uniform Base" name="uniformBase" options={["Predominantly Black", "Predominantly White", "Primary Color Heavy", "Light/Dark Alternate"]} /><Field label="Team Logo Optional" name="teamLogo" type="file" /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Uniform Choice</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">{uniformOptions.map((option) => <label key={option.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className="flex items-center justify-between gap-3"><span className="text-sm font-black uppercase text-white">{option.name}</span><span className="rounded-full bg-[#8CFF00] px-2 py-1 text-[10px] font-black uppercase text-black">{option.price}</span></span><p className="mt-3 text-xs font-semibold leading-5 text-[#C8D6FF]">{option.detail}</p><input className="mt-4" name="uniformChoice" type="radio" value={option.name} /></label>)}</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Jersey Size" name="jerseySize" options={jerseySizes} /><SelectField label="Shorts Size" name="shortsSize" options={jerseySizes} /><Field label="Jersey Name" name="jerseyName" placeholder="Name on back" /><Field label="Preferred Number" name="preferredNumber" placeholder="23" /></div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event + Payment</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-black text-white"><span>Event</span><select className="min-h-12 rounded-xl border border-[#8CFF00]/35 bg-black px-4 text-sm font-black text-white outline-none" name="event"><option>Saturday, May 24 — 2:00 PM — Riverside Park</option><option>Flag Football WR Battle — Coming Soon</option><option>Speed + Agility Challenge — Coming Soon</option></select></label><label className="grid gap-2 text-sm font-black text-white"><span>Entry Fee</span><input className="min-h-12 rounded-xl border border-white/10 bg-black px-4 text-sm font-black text-[#8CFF00] outline-none" readOnly value="$30.00 team / uniform add-ons optional" /></label></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="rounded-2xl border border-[#8CFF00]/35 bg-[#8CFF00]/10 p-4"><span className="flex items-center gap-2 text-sm font-black text-[#8CFF00]"><DollarSign size={16} /> Cash App</span><p className="mt-3 text-2xl font-black text-white">$Larenzo3622</p><p className="mt-2 text-xs font-semibold leading-5 text-[#C8D6FF]">Memo: Team name + event date</p><input className="mt-3" name="paymentMethod" type="radio" value="cash-app" /></label><label className="rounded-2xl border border-[#F2C200]/35 bg-[#F2C200]/10 p-4"><span className="flex items-center gap-2 text-sm font-black text-[#F2C200]"><CreditCard size={16} /> Venmo</span><p className="mt-3 text-2xl font-black text-white">@Olajuwaan-Lewis</p><p className="mt-2 text-xs font-semibold leading-5 text-[#C8D6FF]">Memo: Team name + event date</p><input className="mt-3" name="paymentMethod" type="radio" value="venmo" /></label></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Transaction ID Optional" name="transactionId" placeholder="Cash App / Venmo confirmation" /><Field label="Upload Payment Screenshot Optional" name="paymentReceipt" type="file" /></div>
                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold leading-6 text-white"><input className="mt-1" name="paymentSent" type="checkbox" value="yes" /> I sent the payment or understand my slot stays pending until payment is confirmed.</label>
              </div>

              <button className="mt-8 min-h-12 w-full rounded-xl bg-[#F2C200] px-6 text-sm font-black uppercase text-black" type="button">Create Team + Reserve Slot</button>
            </form>

            <aside className="rounded-[30px] border border-[#8CFF00]/25 bg-[#070707] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Locked Layer</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-white">
                <div className="rounded-2xl border border-white/10 bg-black p-4">Captain can choose custom team colors instead of being forced into one of eight presets.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Uniforms are optional: bring your own, buy Basic, or buy Elite.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Every team still uses the MY D1 visual standard, so the league stays consistent.</div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Cash App: <span className="font-black text-[#8CFF00]">$Larenzo3622</span></div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Venmo: <span className="font-black text-[#F2C200]">@Olajuwaan-Lewis</span></div>
                <div className="rounded-2xl border border-white/10 bg-black p-4">Teams stay pending until payment is confirmed in Operations.</div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}
