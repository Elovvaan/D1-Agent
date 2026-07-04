import Link from "next/link";
import { ArrowLeft, Camera, Play, Upload } from "lucide-react";

export default function AppCameraPage() {
  return (
    <main className="min-h-screen bg-[#061331] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-[#8CFF00]"><ArrowLeft size={16} /> App Home</Link>
        <section className="mt-6 rounded-[30px] border border-[#8CFF00]/30 bg-black p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Film Mode</p>
          <h1 className="mt-3 text-4xl font-black uppercase">Capture Highlights</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">V1 mobile film screen for upload, highlights, clips, and event media.</p>
          <div className="mt-6 grid aspect-video place-items-center rounded-[28px] border border-dashed border-[#F2C200]/45 bg-[#061331]"><Camera size={88} className="text-[#F2C200]" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-4 text-sm font-black uppercase text-black"><Camera size={18} /> Record</button><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-black uppercase text-white"><Upload size={18} /> Upload</button></div>
        </section>
        <section className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-4"><div className="flex gap-3"><Play className="text-[#8CFF00]" /><p className="text-sm font-semibold leading-6 text-[#C8D6FF]">Later this connects highlights to event, player profile, team, and recruiter visibility.</p></div></section>
      </div>
    </main>
  );
}
