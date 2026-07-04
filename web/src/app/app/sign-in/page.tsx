import Link from "next/link";
import { ShieldCheck, Smartphone, Trophy, UserRound } from "lucide-react";
import { signInAppUser } from "../actions";

export default function AppSignInPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <section className="rounded-[32px] border border-[#8CFF00]/35 bg-[#061331] p-5">
          <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white"><img src="/brand/MYD1 LOGO.png" alt="MYD1" className="h-full w-full object-contain p-1.5" /></span><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#8CFF00]">MYD1 App</p><h1 className="text-3xl font-black uppercase">Athlete Access</h1></div></div>
          <p className="mt-4 text-sm font-semibold leading-6 text-[#C8D6FF]">Sign in if you already have a MYD1 athlete profile, or create a new player card before checking in, joining events, building a team, or uploading highlights.</p>
          <Link href="/app/sign-up" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-black">Create Athlete Profile</Link>
          <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs font-black uppercase tracking-[0.18em] text-[#C8D6FF]">or sign in</span><div className="h-px flex-1 bg-white/10" /></div>
          <form action={signInAppUser} className="grid gap-3">
            <label className="grid gap-2 text-sm font-black"><span>Full Name</span><input name="fullName" required className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" /></label>
            <label className="grid gap-2 text-sm font-black"><span>Email</span><input name="email" type="email" className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" /></label>
            <label className="grid gap-2 text-sm font-black"><span>Phone</span><input name="phone" className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" /></label>
            <label className="grid gap-2 text-sm font-black"><span>City</span><input name="city" className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" /></label>
            <button className="mt-2 min-h-12 rounded-2xl border border-white/10 bg-white/[0.08] px-5 text-sm font-black uppercase text-white" type="submit">Enter Athlete Mode</button>
          </form>
        </section>
        <section className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><UserRound className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Athlete Profile</p><p className="text-xs font-semibold text-[#C8D6FF]">Your identity connects to events, teams, highlights, and stats.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Trophy className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Event Check-In</p><p className="text-xs font-semibold text-[#C8D6FF]">Sign in first, then check in to your event.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><Smartphone className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">Install MYD1</p><p className="text-xs font-semibold text-[#C8D6FF]">Add to your home screen after signing in.</p></div>
        </section>
        <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#8CFF00]"><ShieldCheck size={16} /> Back to public site</Link>
      </div>
    </main>
  );
}
