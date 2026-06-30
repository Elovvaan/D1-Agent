import { Database, Search } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryDiscoverySections, searchPublicDirectory, type PublicDirectoryResult } from "@/lib/data/services";

function ResultCard({ result }: { result: PublicDirectoryResult }) {
  return (
    <a className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 transition hover:border-[#1B3FA0]" href={result.href}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block text-sm font-black text-[#0A1A3F]">{result.title}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-[#66718F]">{result.detail}</span>
        </span>
        <span className="flex flex-wrap gap-2">
          <Badge tone="blue">{result.typeLabel}</Badge>
          <Badge tone={result.sourceLabel === "Public Record" ? "green" : result.sourceLabel === "Source Registry" ? "silver" : "yellow"}>{result.sourceLabel}</Badge>
        </span>
      </div>
    </a>
  );
}

export default async function PublicSearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q ?? "").trim();
  const groups = searchPublicDirectory(query);
  const discoverySections = query ? [] : getPublicDirectoryDiscoverySections();
  const hasDiscoveryResults = discoverySections.some((section) => section.results.length > 0);

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Public Sports Search"
          title="Search the MyD1 sports directory"
          description="Visitors can search public athletes, schools, teams, games, tournaments, coaches, and public stats without creating an account."
        />
        <Card>
          <form className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="q">Search MyD1</label>
            <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
              <Search size={18} className="text-[#66718F]" />
              <input
                className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
                defaultValue={query}
                id="q"
                name="q"
                placeholder="Search athletes, schools, teams, games, tournaments, coaches, stats"
                type="search"
              />
            </div>
            <Button variant="primary">Search</Button>
          </form>
        </Card>

        {query ? (
          <div className="mt-6 grid gap-5">
            {groups.length ? groups.map((group) => (
              <Card key={group.group}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#0A1A3F]">{group.group}</h2>
                  <Badge tone="silver">{group.results.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {group.results.map((result) => <ResultCard key={`${result.group}-${result.id}-${result.href}`} result={result} />)}
                </div>
              </Card>
            )) : (
              <Card>
                <SectionTitle title="No Results Found" caption="No results found yet. Try another school, sport, state, or source." />
                <div className="flex flex-wrap gap-3">
                  <Button href="/admin/import-school" variant="primary"><Database size={17} /> Run Public Import</Button>
                  <Button href="/search" variant="secondary">Clear Search</Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {hasDiscoveryResults ? discoverySections.map((section) => (
              <Card key={section.title}>
                <SectionTitle
                  title={section.title}
                  caption={section.caption}
                  action={<Badge tone="silver">{section.results.length}</Badge>}
                />
                {section.results.length ? (
                  <div className="grid gap-3">
                    {section.results.map((result) => <ResultCard key={`${section.title}-${result.group}-${result.id}-${result.href}`} result={result} />)}
                  </div>
                ) : (
                  <p className="text-sm font-semibold leading-6 text-[#66718F]">0 records found for this section.</p>
                )}
              </Card>
            )) : (
              <Card>
                <SectionTitle title="No Public Data Yet" caption="No results found yet. Try another school, sport, state, or source." />
                <Button href="/admin/import-school" variant="primary"><Database size={17} /> Run Public Import</Button>
              </Card>
            )}
          </div>
        )}
      </section>
    </PublicSiteShell>
  );
}
