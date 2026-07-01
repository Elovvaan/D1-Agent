import { ArrowRight, Building2, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryCounters, searchPublicDirectory } from "@/lib/data/services";

function SchoolResultCard({ id, title, detail, href, badge }: { id: string; title: string; detail: string; href: string; badge: string }) {
  return (
    <a className="group rounded-2xl border border-[#E4E9F1] bg-white p-4 shadow-[0_14px_34px_rgba(10,26,63,0.05)] transition hover:-translate-y-0.5 hover:border-[#1B3FA0] hover:shadow-[0_20px_44px_rgba(10,26,63,0.1)]" href={href}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <EntityMark entity={{ ref_type: "School", ref_id: id, display_name: title }} kind="logo" />
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[#0A1A3F]">{title}</div>
            <div className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">{detail}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="green">{badge}</Badge>
          <ArrowRight className="text-[#1B3FA0] transition group-hover:translate-x-1" size={16} />
        </div>
      </div>
    </a>
  );
}

export default function SchoolsPage() {
  const counters = getPublicDirectoryCounters();
  const schoolResults = searchPublicDirectory("school").find((group) => group.group === "Schools")?.results.slice(0, 12) ?? [];

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Schools" title="Browse schools, teams, and public athletic records." description="Search school and team records from the public MyD1 directory." action={<Button href="/search?q=school" variant="primary"><Search size={17} /> Search Schools</Button>} />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Schools" value={`${counters.schools}`} detail="Public school records discovered." icon={Building2} />
          <StatCard label="Teams" value={`${counters.teams}`} detail="Team records connected." icon={Users} tone="blue" />
          <StatCard label="Public Data" value="Clean" detail="Private review details stay hidden." icon={ShieldCheck} tone="green" />
          <StatCard label="Browse" value="Search" detail="Start by school, team, or sport." icon={MapPin} tone="yellow" />
        </div>
        <Card className="mt-6 overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="green">Schools</Badge><Badge tone="blue">Teams</Badge><Badge tone="yellow">Athletics</Badge></div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A1A3F] sm:text-4xl">A cleaner school directory.</h2>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-[#66718F]">Schools are rendered from canonical directory records with deterministic identity marks until approved logos are available.</p>
              <form className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]" action="/search">
                <label className="sr-only" htmlFor="school-search">Search schools</label>
                <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4"><Search size={18} className="text-[#66718F]" /><input className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none" id="school-search" name="q" type="search" /></div>
                <Button variant="primary">Search</Button>
              </form>
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]"><div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">School view</div><div className="mt-3 text-2xl font-black">Entity-driven.</div><p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">Every school card uses the same resolver and can upgrade from initials to approved branding.</p></div>
          </div>
        </Card>
        <Card className="mt-6">
          <SectionTitle title="School Directory" caption="Clean public school results." action={<Badge tone="silver">{schoolResults.length}</Badge>} />
          {schoolResults.length ? <div className="grid gap-3">{schoolResults.map((school) => <SchoolResultCard key={school.id} id={school.id} title={school.title} detail={school.detail} href={school.href} badge={school.typeLabel} />)}</div> : <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-5 text-sm font-semibold leading-6 text-[#66718F]">No reviewed school records are ready yet. Use search after imports are reviewed.</div>}
        </Card>
      </section>
    </PublicSiteShell>
  );
}
