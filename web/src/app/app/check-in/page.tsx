import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2, QrCode } from "lucide-react";
import { getAppSession } from "@/lib/app-session";

export default async function AppCheckInPage() {
  const session = await getAppSession();
  if (!session) redirect("/app/sign-in");

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-md pb-20">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-[#061331] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Event Check-In</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Scan In</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Signed in as {session.fullName}. Scan the event QR code or enter a team code at the check-in table.</p>
          <div className="mt-6 grid aspect-square place-items-center rounded-[28px] border border-dashed border-[#8CFF00]/45 bg-black"><QrCode size={120} className="text-[#8CFF00]" /></div>
          <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-black" type="button"><Camera size={18} /> Open Camera Scanner</button>
          <form className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <label className="grid gap-2 text-sm font-black"><span>Manual Event / Team Code</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" placeholder="Example: LOCKED-001" /></label>
            <button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black uppercase text-black" type="button">Confirm Check-In</button>
          </form>
        </section>
        <section className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-4"><div className="flex gap-3"><CheckCircle2 className="text-[#F2C200]" /><p className="text-sm font-semibold leading-6 text-[#C8D6FF]">Check-in will confirm player, team, court, jersey color, and bracket assignment once event rosters are live.</p></div></section>
      </div>
    </main>
  );
}
