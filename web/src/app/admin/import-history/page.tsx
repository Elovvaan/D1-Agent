import { Clock3, Database, ExternalLink, ListChecks } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { formatImportDate, getImportHistory } from "@/lib/data/public-imports";

export default async function ImportHistoryPage() {
  const history = await getImportHistory();
  const latest = history[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Importer audit"
        title="Import History"
        description="Every public athletics URL import is tracked with source URL, imported record count, review count, and timestamp."
        action={<Button href="/admin/public-data" variant="primary"><ListChecks size={17} /> Review Queue</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Public URL Imports" action={<Badge tone="blue">{history.length} runs</Badge>} />
          <div className="grid gap-4">
            {history.map((item) => (
              <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={item.runId}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="green">{item.recordsImported} imported</Badge>
                      <Badge tone={item.reviewCount > 0 ? "yellow" : "green"}>{item.reviewCount} review</Badge>
                    </div>
                    <h2 className="mt-3 text-lg font-black text-[#0A1A3F]">{item.sourceTitle ?? item.sourceUrl}</h2>
                    <p className="mt-2 truncate text-sm font-semibold text-[#66718F]">{item.sourceUrl}</p>
                  </div>
                  <div className="text-sm font-black text-[#1B3FA0]">{formatImportDate(item.fetchedAt)}</div>
                </div>
              </article>
            ))}
          </div>
        </Card>
        <div className="grid h-fit gap-4">
          <StatCard label="Latest Records" value={`${latest?.recordsImported ?? 0}`} detail="Imported from the newest URL artifact." icon={Database} />
          <StatCard label="Latest Review" value={`${latest?.reviewCount ?? 0}`} detail="Records waiting for admin action." icon={ListChecks} tone="yellow" />
          <Card>
            <SectionTitle title="Latest Source" />
            {latest ? (
              <ObjectList
                items={[
                  { title: latest.sourceTitle ?? "Public athletics URL", detail: latest.sourceUrl, badge: "Source", icon: ExternalLink },
                  { title: "Fetched", detail: formatImportDate(latest.fetchedAt), badge: "Audit", icon: Clock3, tone: "green" }
                ]}
              />
            ) : (
              <p className="text-sm font-semibold text-[#66718F]">No public imports have been written yet.</p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
