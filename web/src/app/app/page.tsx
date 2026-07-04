import Link from "next/link";
import { Bell, CalendarDays, Camera, ChevronRight, QrCode, Search, Shirt, Trophy, UserRound, Users } from "lucide-react";
import { InstallMyd1Card } from "@/components/install-myd1-card";

const quickActions = [
  { label: "Scan Check-In", href: "/app/check-in", icon: QrCode },
  { label: "Events", href: "/app/events", icon: Trophy },
  { label: "My Team", href: "/app/team", icon: Users },
  { label: "Search", href: "/app/search", icon: Search }
];

const upcoming = [
  { label: "Next Event", value: "Open registration from Locked In", href: "/app/events" },
  { label: "Profile", value: "Complete athlete card", href: "/app/profile" },
  { label: "Uniform", value: "Team colors + kit choice", href: "/app/uniform" }
];

export default function MobileAppHomePage() {
  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <InstallMyd1Card />
      <section className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white"><img src="/brand/MYD1 LOGO.png" alt="MYD1" className="h-full w-full object-contain p-1.5" /></span><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#8CFF00]">MYD1 App</p><h1 className="text-xl font-black">Athlete Home</h1></div></div>
          <Link href="/app/notifications" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.08]"><Bell size={18} /></Link>
        </header>

        <div className="mt-5 overflow-hidden rounded-[30px] border border-[#8CFF00]/35 bg-black p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8CFF00]">Locked In</p>
          <h2 className="mt-3 text-4xl font-black uppercase italic leading-none">Your game.<br /><span className="text-[#F2C200]">Your moment.</span></h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Install MYD1 on your phone for events, check-ins, teams, brackets, uniforms, highlights, and athlete profiles.</p>
          <div className="mt-5 grid grid-cols-2 gap-3"><Link href="/app/events" className="rounded-2xl bg-[#8CFF00] px-4 py-3 text-center text-sm font-black uppercase text-[#061331]">Find Event</Link><Link href="/app/check-in" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-center text-sm font-black uppercase text-white">Check In</Link></div>
        </div>

        <section className="mt-5 grid grid-cols-2 gap-3">
          {quickActions.map((item) => <Link key={item.label} href={item.href} className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4"><item.icon className="text-[#F2C200]" /><p className="mt-3 text-sm font-black uppercase">{item.label}</p></Link>)}
        </section>

        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Today</p><CalendarDays className="text-[#8CFF00]" size={18} /></div>
          <div className="mt-4 grid gap-3">{upcoming.map((item) => <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#071A43] p-3"><span><span className="block text-sm font-black">{item.label}</span><span className="block text-xs font-semibold text-[#C8D6FF]">{item.value}</span></span><ChevronRight size={18} /></Link>)}</div>
        </section>

        <section className="mt-5 grid gap-3">
          <div className="rounded-[24px] border border-[#F2C200]/25 bg-[#F2C200]/10 p-4"><div className="flex items-center gap-3"><Trophy className="text-[#F2C200]" /><div><p className="text-sm font-black uppercase">Event Mode</p><p className="text-xs font-semibold text-[#C8D6FF]">Live scores, brackets, court assignment, and prize events.</p></div></div></div>
          <div className="rounded-[24px] border border-[#8CFF00]/25 bg-[#8CFF00]/10 p-4"><div className="flex items-center gap-3"><Shirt className="text-[#8CFF00]" /><div><p className="text-sm font-black uppercase">Team Identity</p><p className="text-xs font-semibold text-[#C8D6FF]">Team colors, jerseys, shorts, numbers, and roster cards.</p></div></div></div>
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-white/10 bg-[#061331]/95 px-4 py-3 backdrop-blur">
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-black uppercase text-[#C8D6FF]"><Link href="/app" className="grid gap-1 text-[#8CFF00]"><UserRound className="mx-auto" size={18} />Home</Link><Link href="/app/events" className="grid gap-1"><Trophy className="mx-auto" size={18} />Events</Link><Link href="/app/check-in" className="grid gap-1"><QrCode className="mx-auto" size={18} />Scan</Link><Link href="/app/team" className="grid gap-1"><Users className="mx-auto" size={18} />Team</Link><Link href="/app/camera" className="grid gap-1"><Camera className="mx-auto" size={18} />Film</Link></div>
        </nav>
      </section>
    </main>
  );
}
