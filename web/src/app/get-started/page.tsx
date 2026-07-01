import { ArrowRight, Building2, Camera, GraduationCap, Lock, ShieldCheck, UserRound, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";

const roles = [
  { title: "Athlete", detail: "Create or claim your athlete profile, connect school data, upload film, and enter Command Center.", icon: UserRound, href: "/sign-in?role=athlete&next=/onboarding/athlete", tone: "blue" },
  { title: "Parent / Guardian", detail: "Support a minor athlete with consent, safety controls, profile approvals, and contact requests.", icon: ShieldCheck, href: "/sign-in?role=athlete&next=/onboarding/athlete", tone: "green" },
  { title: "Coach", detail: "Find your school, verify coaching affiliation, and manage athlete verification queues.", icon: Users, href: "/sign-in?role=coach&next=/coach", tone: "yellow" },
  { title: "Recruiter", detail: "Sign in to discover athletes, review verified profiles, and manage recruiting boards.", icon: GraduationCap, href: "/sign-in?role=recruiter&next=/recruiter", tone: "purple" },
  { title: "Media Partner", detail: "Create a media profile, upload photos or video, tag athletes, and submit to review.", icon: Camera, href: "/sign-in?role=media_partner&next=/media", tone: "orange" },
  { title: "School / Organization", detail: "Set up school data, import public athletics pages, and prepare team workflows.", icon: Building2, href: "/sign-in?role=admin&next=/admin/import-school", tone: "blue" }
] as const;

function toneClasses(tone: string) {
  if (tone === "green") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-300";
  if (tone === "yellow") return "border-[#F2C200]/40 bg-[#F2C200]/18 text-[#F2C200]";
  if (tone === "purple") return "border-purple-400/30 bg-purple-500/15 text-purple-300";
  if (tone === "orange") return "border-orange-400/30 bg-orange-500/15 text-orange-300";
  return "border-[#5475FF]/35 bg-[#325CFF]/22 text-[#AFC3FF]";
}

export default function GetStartedPage() {
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.58),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute -left-20 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200] shadow-[0_0_90px_rgba(242,194,0,0.34)]" />
        <div className="absolute left-32 top-0 h-full w-28 skew-x-[-12deg] border-r border-[#F2C200]/35 bg-[#0A1A3F]/55" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <img src="/brand/MYD1 LOGO.png" alt="MyD1" className="mb-6 h-16 w-auto rounded-xl border border-white/12 object-contain" />
          <div className="border-b border-white/12 pb-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">Get Started</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Choose your <span className="text-[#F2C200]">role</span></h1>
            <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-[#C8D6FF]">MyD1 routes every visitor to the right onboarding path. There is one platform, but each role starts with the workflow that matches their responsibility.</p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <a key={role.title} href={role.href} className="group rounded-[26px] border border-white/14 bg-white/[0.055] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur transition hover:-translate-y-1 hover:border-[#F2C200]/60 hover:bg-white/[0.08]">
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${toneClasses(role.tone)}`}><role.icon size={24} /></span>
                  <span className={`rounded-xl border px-3 py-1 text-xs font-black ${toneClasses(role.tone)}`}>Onboarding</span>
                </div>
                <h2 className="mt-6 text-2xl font-black tracking-tight text-white">{role.title}</h2>
                <p className="mt-4 min-h-24 text-sm font-semibold leading-7 text-[#DCE7FF]">{role.detail}</p>
                <span className="mt-6 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F] shadow-[0_16px_36px_rgba(242,194,0,0.22)]">Continue <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
              </a>
            ))}
          </div>
          <div className="mt-6 grid gap-4 rounded-[24px] border border-white/14 bg-white/[0.055] p-5 backdrop-blur md:grid-cols-2">
            <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#F2C200]"><ShieldCheck size={22} /></span><div><div className="font-black">One platform. Six paths. All built for verified sports.</div><p className="text-sm font-semibold text-[#C8D6FF]">Start with the workflow that matches your responsibility.</p></div></div>
            <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#F2C200]"><Lock size={22} /></span><div><div className="font-black">Secure. Private. Trusted.</div><p className="text-sm font-semibold text-[#F2C200]">Built for the future of sports.</p></div></div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
