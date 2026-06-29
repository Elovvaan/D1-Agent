import { Search } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { searchPublicDirectory } from "@/lib/data/services";

export default async function PublicSearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q ?? "").trim();
  const groups = searchPublicDirectory(query);

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
                  {group.results.map((result) => (
                    <a className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 transition hover:border-[#1B3FA0]" href={result.href} key={result.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          <span className="block text-sm font-black text-[#0A1A3F]">{result.title}</span>
                          <span className="mt-1 block text-xs font-semibold leading-5 text-[#66718F]">{result.detail}</span>
                        </span>
                        <span className="flex flex-wrap gap-2">
                          <Badge tone="blue">{result.typeLabel}</Badge>
                          <Badge tone={result.sourceLabel === "Public Record" ? "green" : "yellow"}>{result.sourceLabel}</Badge>
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            )) : <p className="text-sm font-black text-[#66718F]">No results found.</p>}
          </div>
        ) : null}
      </section>
    </PublicSiteShell>
  );
}
