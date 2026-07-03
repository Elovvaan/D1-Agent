import { CalendarDays, Film, MapPin, Trophy } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GamesPage() {
  return (
    <PublicSiteShell variant="dark">
      <main className="min-h-screen bg-[#061331] text-white">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(27,63,160,0.55),transparent_32%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-[1440px]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Games</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">Game hub coming online.</h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[#C8D6FF]">This page will show approved games entered through Operations: schedules, scores, media, teams, schools, and state filters.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><CalendarDays className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Schedule</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Upcoming and completed games.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><Trophy className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Scores</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Final scores after approval.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><Film className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">Media</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Game film, thumbnails, and highlights.</p></div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5"><MapPin className="text-[#F2C200]" /><h2 className="mt-4 text-lg font-black">States</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Filter games by location.</p></div>
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
