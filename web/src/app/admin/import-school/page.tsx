import { Database, ExternalLink, Globe2, ListChecks, Search, ShieldCheck } from "lucide-react";
import { discoverSchoolImportSource, importSelectedSchoolLinks } from "@/app/actions/admin-operator-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { discoveryTypeLabel, getLatestSchoolImportSession, getSchoolImportWizardState, schoolDiscoveryTypes } from "@/lib/data/school-import-wizard";

const statusMessages: Record<string, string> = {
  "invalid-url": "Enter a valid public URL.",
  "robots-blocked": "robots.txt blocks public discovery for that URL.",
  "fetch-failed": "The public URL could not be fetched.",
  discovered: "Public links discovered and classified.",
  imported: "Selected public links imported with review-safe source attribution."
};

export default async function SchoolImportWizardPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const state = getSchoolImportWizardState();
  const latestSession = getLatestSchoolImportSession();
  const linksByType = schoolDiscoveryTypes.map((type) => ({
    type,
    links: state.links.filter((link) => link.type === type)
  })).filter((group) => group.links.length > 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="School Import Wizard"
        title="Import Public School Sports Data"
        description="Enter a public school, athletics, team, conference, or league URL. MyD1 discovers public pages, classifies them, and imports selected records into review."
        action={<Button href="/admin/public-data" variant="secondary"><ListChecks size={17} /> Review Queue</Button>}
      />

      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="1. Enter Source URL" caption="Use public pages only. MyD1 checks robots.txt and does not bypass login walls." />
            <form action={discoverSchoolImportSource} className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="sourceUrl">Public school or athletics URL</label>
              <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
                <Globe2 size={17} className="text-[#66718F]" />
                <input
                  className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
                  id="sourceUrl"
                  name="sourceUrl"
                  placeholder="https://school.edu/athletics or https://team-site.com/sports/football/roster"
                  required
                  type="url"
                />
              </div>
              <Button variant="primary"><Search size={17} /> Discover</Button>
            </form>
          </Card>

          <form action={importSelectedSchoolLinks}>
            <Card>
              <SectionTitle
                title="2-4. Discover, Classify, Select"
                caption="Discovered links are grouped by type with confidence. Uncertain records stay pending review."
                action={<Badge tone="blue">{state.links.length} links</Badge>}
              />
              {linksByType.length ? (
                <div className="grid gap-5">
                  {linksByType.map((group) => (
                    <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={group.type}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#0A1A3F]">{discoveryTypeLabel(group.type)}</h2>
                        <Badge tone="silver">{group.links.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {group.links.map((link) => (
                          <label className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-4 sm:grid-cols-[auto_1fr_auto]" key={link.id}>
                            <input className="mt-1 h-4 w-4 accent-[#1B3FA0]" name="selectedLinkIds" type="checkbox" value={link.id} />
                            <span className="min-w-0">
                              <span className="block text-sm font-black text-[#0A1A3F]">{link.title}</span>
                              <span className="mt-1 block break-all text-xs font-semibold leading-5 text-[#66718F]">{link.url}</span>
                              <span className="mt-2 block text-xs font-semibold text-[#66718F]">{link.evidence.join(" ") || "Classification requires review."}</span>
                            </span>
                            <span className="flex flex-wrap items-start gap-2">
                              <Badge tone={link.confidence >= 0.9 ? "green" : link.confidence >= 0.7 ? "yellow" : "silver"}>{Math.round(link.confidence * 100)}%</Badge>
                              <Badge tone="blue">{discoveryTypeLabel(link.type)}</Badge>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="cta"><Database size={17} /> Import Selected Links</Button>
                    <Button href="/admin/public-data" variant="secondary">Open Admin Review</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold leading-6 text-[#66718F]">No discovered links yet. Enter a public URL to start discovery.</p>
              )}
            </Card>
          </form>
        </div>

        <div className="grid h-fit gap-6">
          <div className="grid gap-4">
            <StatCard label="Sources" value={`${state.sources.length}`} detail="Public source URLs fetched or blocked." icon={Globe2} />
            <StatCard label="Records Imported" value={`${latestSession?.importedRecords ?? 0}`} detail="From the latest school import session." icon={Database} tone="green" />
            <StatCard label="Needs Review" value={`${latestSession?.reviewRecords ?? 0}`} detail="Uncertain records are never verified automatically." icon={ShieldCheck} tone="yellow" />
          </div>
          <Card>
            <SectionTitle title="5-6. Import and Review Results" caption="Selected links become attributed public records." />
            {latestSession ? (
              <ObjectList
                items={[
                  { title: "Latest Source", detail: latestSession.sourceUrl, value: latestSession.status, icon: ExternalLink, tone: "blue" },
                  { title: "Imported", detail: latestSession.fetchedAt, value: String(latestSession.importedRecords), icon: Database, tone: "green" },
                  { title: "Review", detail: "Pending admin action before merge.", value: String(latestSession.reviewRecords), icon: ListChecks, tone: "yellow" }
                ]}
              />
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No import session has run from the wizard yet.</p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
