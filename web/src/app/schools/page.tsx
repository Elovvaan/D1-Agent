import { ArrowRight, Building2, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryCounters, searchPublicDirectory } from "@/lib/data/services";

const fallbackSchools = ["Utah", "Texas", "California", "Florida", "Georgia", "Virginia", "Ohio", "Colorado", "Arizona", "Nevada", "New York", "North Carolina"];

function SchoolResultCard({ title, detail, href, badge }: { title: string; detail: string; href: string; badge: string }) {
  return (
    <a className="group rounded-2xl border border-[#E4E9F1] bg-white p-4 shadow-[0_14px_34px_rgba(10,26,63,0.05)] transition hover:-translate-y-0.5 hover:border-[#1B3FA0] hover:shadow-[0_20px_44px_rgba(10,26,63,0.1)]" href={href}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-black text-[#0A1A3F]">{title}</div>
          <div className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">{detail}</div>
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
        <PageHeader
          eyebrow="Schools"
          title="Browse schools, teams, and public athletic records."
          description="The school page should feel like a public directory, not an import tool. Search schools, browse states, and open clean public pages without entering the private app."
          action={<Button href="/search?q=school" variant="primary"><Search size={17} /> Search Schools</Button>}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Schools" value={`${counters.schools}`} detail="Public school records discovered." icon={Building2} />
          <StatCard label="Teams" value={`${counters.teams}`} detail="Team records connected." icon={Users} tone="blue" />
          <StatCard label="Public Data" value="Clean" detail="Import details hidden from visitors." icon={ShieldCheck} tone="green" />
          <StatCard label="Browse" value="States" detail="Start by location or sport." icon={MapPin} tone="yellow" />
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="green">Schools</Badge><Badge tone="blue">Teams</Badge><Badge tone="yellow">Athletics</Badge></div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A1A3F] sm:text-4xl">A cleaner school directory.</h2>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-[#66718F]">Schools should be searchable by name, state, sport, team, and public athletic source. Operator import records stay behind the scenes.</p>
              <form className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]" action="/search">
                <label className="sr-only" htmlFor="school-search">Search schools</label>
                <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
                  <Search size={18} className="text-[#66718F]" />
                  <input className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none" id="school-search" name="q" type="search" />
                </div>
                <Button variant="primary">Search</Button>
              </form>
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">School view</div>
              <div className="mt-3 text-2xl font-black">Public-facing only.</div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">No sidebar. No Command Center. No operator language. Just schools, teams, states, and sports.</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <Card>
            <SectionTitle title="School Directory" caption="Clean public school results. Search results expand as more records are reviewed." action={<Badge tone="silver">{schoolResults.length || fallbackSchools.length}</Badge>} />
            <div className="grid gap-3">
              {schoolResults.length ? schoolResults.map((school) => (
                <SchoolResultCard key={school.id} title={school.title} detail={school.detail} href={school.href} badge={school.typeLabel} />
              )) : fallbackSchools.map((state) => (
                <SchoolResultCard key={state} title={`${state} Schools`} detail={`Browse public school and team results for ${state}.`} href={`/search?q=${encodeURIComponent(`${state} school`)}`} badge="State" />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Browse by State" caption="Quick paths for the public school side." />
            <div className="grid gap-3 sm:grid-cols-2">
              {fallbackSchools.map((state) => (
                <a className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] px-4 py-3 text-center text-sm font-black text-[#0A1A3F] transition hover:border-[#1B3FA0] hover:bg-white" href={`/search?q=${encodeURIComponent(`${state} school`)}`} key={state}>{state}</a>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PublicSiteShell>
  );
}
