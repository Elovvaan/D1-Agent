import Link from "next/link";
import { ArrowRight, Facebook, Instagram, Youtube } from "lucide-react";
import { brandConfig } from "@/lib/domain-config";
import { myd1SocialChannels } from "@/lib/social-channels";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/schools", label: "Schools" },
  { href: "/sports", label: "Sports" },
  { href: "/games", label: "Games" }
] as const;

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube
};

export function PublicSiteShell({ children, variant = "light" }: { children: React.ReactNode; variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  const connectedSocials = myd1SocialChannels.filter((channel) => channel.status === "connected-url" && channel.url);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#061331] text-white" : "bg-[#F5F7FB] text-[#0A1A3F]"}`}>
      <img src="/brand/MYD1 LOGO.png" alt="" aria-hidden="true" className="pointer-events-none fixed bottom-6 right-6 z-0 hidden w-44 opacity-[0.06] sm:block" />
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${isDark ? "border-white/12 bg-[#061331]/92" : "border-[#DDE3EC] bg-white/92"}`}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(10,26,63,0.18)]"><img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-full w-full object-contain p-1.5" /></span><span><span className="block text-xl font-black tracking-tight">{brandConfig.primaryBrand}</span><span className={`block text-xs font-semibold ${isDark ? "text-[#C8D6FF]" : "text-[#66718F]"}`}>{brandConfig.agentProductName} Platform</span></span></Link>
          <nav className="hidden items-center gap-1 md:flex">{navItems.map((item) => <Link className={`rounded-xl px-3 py-2 text-sm font-black transition ${isDark ? "text-white hover:bg-white/10" : "text-[#0A1A3F] hover:bg-[#EAF0FF]"}`} href={item.href} key={item.href}>{item.label}</Link>)}</nav>
          <div className="flex items-center gap-2"><Link className={`hidden rounded-xl px-3 py-2 text-sm font-black sm:inline-flex ${isDark ? "text-[#AFC3FF] hover:bg-white/10" : "text-[#1B3FA0] hover:bg-[#EAF0FF]"}`} href="/sign-in">Sign In</Link><Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.25)]" href="/get-started">Get Started <ArrowRight size={16} /></Link></div>
        </div>
      </header>
      <main>{children}</main>
      <footer className={`border-t ${isDark ? "border-white/12 bg-[#0A1A3F]" : "border-[#DDE3EC] bg-white"}`}>
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-[#DDE3EC] bg-white"><img src="/brand/MYD1 LOGO.png" alt="MyD1" className="h-full w-full object-contain p-1.5" /></span><div className="text-lg font-black">{brandConfig.primaryBrand}</div></div><p className={`mt-2 max-w-2xl text-sm font-semibold leading-6 ${isDark ? "text-[#C8D6FF]" : "text-[#66718F]"}`}>Verified athletic profiles, public sports search, recruiting workflows, and career tools from youth sports through the professional level.</p></div>
          <div className={`flex flex-wrap items-center gap-3 text-sm font-black ${isDark ? "text-[#AFC3FF]" : "text-[#1B3FA0]"}`}><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link><Link href="/contact">Contact</Link>{connectedSocials.map((channel) => { const Icon = socialIcons[channel.id as keyof typeof socialIcons]; return <a className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 transition ${isDark ? "hover:bg-white/10" : "hover:bg-[#EAF0FF]"}`} href={channel.url} key={channel.id} rel="noreferrer" target="_blank">{Icon ? <Icon size={15} /> : null} {channel.label}</a>; })}</div>
        </div>
      </footer>
    </div>
  );
}
