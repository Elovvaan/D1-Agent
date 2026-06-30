import { ArrowRight, Flame, MapPin, Search, ShieldCheck, Trophy, Users, Video } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { searchPublicDirectory, type PublicDirectoryResult } from "@/lib/data/services";

const browseSports = ["Football", "Basketball", "Baseball", "Soccer", "Track & Field", "Volleyball", "Wrestling", "Softball", "Tennis", "Golf", "Lacrosse", "Swimming"];
const browseStates = ["Utah", "Texas", "California", "Florida", "Georgia", "Ohio", "Virginia", "Colorado", "Arizona", "Nevada", "New York", "North Carolina"];
const featuredSearches = ["Utah football", "Basketball rankings", "2027 quarterbacks", "California basketball", "Top schools", "Latest highlights"];

function toneForGroup(group: string) {
  if (group === "Schools") return "green" as const;
  if (group === "Athletes") return "yellow" as const;
  if (group === "Teams") return "blue" as const;
  return "silver" as const;
}

function ResultCard({ result }: { result: PublicDirectoryResult }) {
  return (
    <a className="group rounded-2xl border border-[#E4E9F1] bg-white p-4 shadow-[0_14px_34px_rgba(10,26,63,0.05)] transition hover:-translate-y-0.5 hover:border-[#1B3FA0] hover:shadow-[0_20px_44px_rgba(10,26,63,0.1)]" href={result.href}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block text-sm font-black text-[#0A1A3F]">{result.title}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-[#66718F]">{result.detail}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={toneForGroup(result.group)}>{result.typeLabel}</Badge>
          <ArrowRight className="text-[#1B3FA0] transition group-hover:translate-x-1" size={16} />
        </span>
      </div>
    </a>
  );
}

function BrowsePill({ label }: { label: string }) {
  return (
    <a className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] px-4 py-3 text-center text-sm font-black text-[#0A1A3F] transition hover:border-[#1B3FA0] hover:bg-white" href={`/search?q=${encodeURIComponent(label)}`}>
      {label}
    </a>
  );
}

function DiscoverySection({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <Card>
      <SectionTitle title={title} caption={caption} />
      {children}
    </Card>
  );
}

export default async function PublicSearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q ?? "").trim();
  const groups = searchPublicDirectory(query);
  const flatResults = groups.flatMap((group) => group.results).filter((result) => result.group !== "Sources" && result.group !== "Organizations");
  const schools = flatResults.filter((result) => result.group === "Schools").slice(0, 5);
  const teams = flatResults.filter((result) => result.group === "Teams").slice(0, 5);
  const athletes = flatResults.filter((result) => result.group === "Athletes").slice(0, 5);
  const rankings = flatResults.filter((result) => result.group === "Rankings").slice(0, 5);
  const fallbackResults = flatResults.slice(0, 8);

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Public Sports Search"
          title="Discover athletes, schools, teams, rankings, and film"
          description="Search the public MyD1 sports network. The public side stays clean; operator import details stay behind the scenes."
        />

        <Card className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <form className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="sr-only" htmlFor="q">Search MyD1</label>
                <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4 shadow-[0_10px_30px_rgba(10,26,63,0.04)]">
                  <Search size={20} className="text-[#66718F]" />
                  <input className="min-h-11 flex-1 bg-transparent text-base font-semibold text-[#0A1A3F] outline-none" defaultValue={query} id="q" name="q" type="search" />
                </div>
                <Button variant="primary">Search</Button>
              </form>
              {!query ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredSearches.map((term) => <BrowsePill key={term} label={term} />)}
                </div>
              ) : null}
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">MyD1 Discovery</div>
              <div className="mt-3 text-2xl font-black">Public first. App second.</div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">Visitors can explore public sports data without seeing dashboards, private tools, or raw import records.</p>
            </div>
          </div>
        </Card>

        {query ? (
          <div className="mt-6 grid gap-5">
            {flatResults.length ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard label="Schools" value={`${schools.length}`} detail="School matches." icon={MapPin} tone="green" />
                  <StatCard label="Teams" value={`${teams.length}`} detail="Team matches." icon={Users} tone="blue" />
                  <StatCard label="Athletes" value={`${athletes.length}`} detail="Athlete matches." icon={Flame} tone="yellow" />
                  <StatCard label="Rankings" value={`${rankings.length}`} detail="Ranking matches." icon={Trophy} tone="silver" />
                </div>
                {groups
                  .map((group) => ({ ...group, results: group.results.filter((result) => result.group !== "Sources" && result.group !== "Organizations") }))
                  .filter((group) => group.results.length)
                  .map((group) => (
                    <Card key={group.group}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#0A1A3F]">{group.group}</h2>
                        <Badge tone="silver">{group.results.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {group.results.map((result) => <ResultCard key={`${result.group}-${result.id}-${result.href}`} result={result} />)}
                      </div>
                    </Card>
                  ))}
              </>
            ) : (
              <Card>
                <SectionTitle title="No Results Found" caption="Try another athlete, school, sport, state, ranking, or team." />
                <Button href="/search" variant="secondary">Clear Search</Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Public Search" value="Live" detail="Search athletes, schools, teams, rankings, and games." icon={Search} />
              <StatCard label="Highlights" value="Soon" detail="Public film discovery layer." icon={Video} tone="yellow" />
              <StatCard label="Sources" value="Hidden" detail="Import tools stay private." icon={ShieldCheck} tone="green" />
              <StatCard label="Profiles" value="Clean" detail="No private app sidebar." icon={Users} tone="blue" />
            </div>

            <DiscoverySection title="Trending Searches" caption="Fast entry points into the public sports network.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featuredSearches.map((term) => <BrowsePill key={term} label={term} />)}
              </div>
            </DiscoverySection>

            {fallbackResults.length ? (
              <DiscoverySection title="Explore Public Results" caption="Curated public results from the sports directory, without exposing import metadata.">
                <div className="grid gap-3">
                  {fallbackResults.map((result) => <ResultCard key={`${result.group}-${result.id}-${result.href}`} result={result} />)}
                </div>
              </DiscoverySection>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-2">
              <DiscoverySection title="Browse Sports" caption="Search by sport and build from there.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {browseSports.map((sport) => <BrowsePill key={sport} label={sport} />)}
                </div>
              </DiscoverySection>
              <DiscoverySection title="Browse States" caption="Start with a state, then narrow by school, athlete, or team.">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {browseStates.map((state) => <BrowsePill key={state} label={state} />)}
                </div>
              </DiscoverySection>
            </div>
          </div>
        )}
      </section>
    </PublicSiteShell>
  );
}
