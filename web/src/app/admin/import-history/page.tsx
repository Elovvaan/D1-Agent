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
        description="Every public athletics URL import is tracked with source URL, imported record count, review count, and timestamp. Review sign-off now runs through Operations."
        action={<Button href="/operations?tab=reviews" variant="primary"><ListChecks size={17} /> Operations Review Queue</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Public URL Imports" action={<Badge tone="blue">{history.length} runs</Badge>} />
          {history.length ? (
            <ObjectList
              items={history.map((item) => ({
                title: item.sourceTitle ?? item.sourceUrl,
                detail: `${formatImportDate(item.fetchedAt)} - ${item.recordsImported} records - ${item.reviewCount} reviews`,
                value: `${item.reviewCount}`,
                icon: ExternalLink,
                tone: item.reviewCount ? "yellow" : "green"
              }))}
            />
          ) : (
            <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No import history yet.</p>
          )}
        </Card>
        <div className="grid h-fit gap-4">
          <StatCard label="Import Runs" value={`${history.length}`} detail="Public import sessions." icon={Database} />
          <StatCard label="Latest Records" value={`${latest?.recordsImported ?? 0}`} detail="Records in latest run." icon={Clock3} tone="blue" />
          <StatCard label="Latest Reviews" value={`${latest?.reviewCount ?? 0}`} detail="Pending sign-off in Operations." icon={ListChecks} tone="yellow" />
        </div>
      </div>
    </AppShell>
  );
}
