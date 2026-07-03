import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarDays, Film, Save, Trophy } from "lucide-react";
import { GameIntakeForm } from "@/components/operations/game-intake-form";
import { signInOperator } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Operations</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Operations</button></form></div></main>;
}

export default async function OperationsGamesPage({ searchParams }: { searchParams?: Promise<{ status?: string; game?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;

  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Operations Intake Room</p>
              <h1 className="mt-2 text-4xl font-black">Game Intake</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Enter a game once, upload the media once, and render it on the public Games hub.</p>
            </div>
            <div className="flex flex-wrap gap-2"><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white" href="/operations">Back to Operations</Link><Link className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" href="/games">Preview Games</Link></div>
          </div>
          {params.status ? <div className="mt-4 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">{params.status === "game-saved" ? "Game saved." : params.status}</div> : null}
        </header>
        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Save className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">1</div><p className="text-sm font-semibold text-[#C8D6FF]">Save record</p></div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Film className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">2</div><p className="text-sm font-semibold text-[#C8D6FF]">Upload media</p></div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Trophy className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">3</div><p className="text-sm font-semibold text-[#C8D6FF]">Add score</p></div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><CalendarDays className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">4</div><p className="text-sm font-semibold text-[#C8D6FF]">Render public</p></div>
        </section>
        <section className="mt-6"><GameIntakeForm /></section>
      </div>
    </main>
  );
}
