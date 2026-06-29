import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brandConfig } from "@/lib/domain-config";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/schools", label: "Schools" },
  { href: "/sports", label: "Sports" }
] as const;

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0A1A3F]">
      <header className="sticky top-0 z-30 border-b border-[#DDE3EC] bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0A1A3F] text-white shadow-[0_10px_30px_rgba(10,26,63,0.18)]">
              <span className="text-lg font-black tracking-tight">D1</span>
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">{brandConfig.primaryBrand}</span>
              <span className="block text-xs font-semibold text-[#66718F]">{brandConfig.agentProductName} Platform</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link className="rounded-xl px-3 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#EAF0FF]" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link className="hidden rounded-xl px-3 py-2 text-sm font-black text-[#1B3FA0] hover:bg-[#EAF0FF] sm:inline-flex" href="/sign-in">
              Sign In
            </Link>
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.25)]" href="/get-started">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-[#DDE3EC] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="text-lg font-black">{brandConfig.primaryBrand}</div>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#66718F]">
              Verified athletic profiles, public sports search, recruiting workflows, and career tools from youth sports through the professional level.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-black text-[#1B3FA0]">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/support">Support</Link>
            <Link href="/contact">Contact</Link>
            <a href="https://instagram.com" rel="noreferrer" target="_blank">Instagram</a>
            <a href="https://x.com" rel="noreferrer" target="_blank">X</a>
            <a href="https://youtube.com" rel="noreferrer" target="_blank">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
