import { AlertTriangle, ClipboardList, Database, Radio, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getAdminDashboard } from "@/lib/data/services";

export default function AdminConsolePage() {
  const dashboard = getAdminDashboard();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations"
        title="Admin Console"
        description="Moderation, dispute resolution, stream operations, entity review, user management, and trust-score audit tools."
        action={<Button href="/admin/public-data" variant="primary"><ClipboardList size={17} /> Open Review Queue</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Moderation" value="2" detail="Content items need review." icon={ShieldCheck} />
          <StatCard label="Disputes" value="1" detail="Coach correction conflict." icon={AlertTriangle} tone="yellow" />
          <StatCard label="Streams" value="5" detail="Scheduled this week." icon={Radio} tone="green" />
          <StatCard label="Entity Matches" value="18" detail="Pending public-data review." icon={Database} />
        </div>
        <Card>
          <SectionTitle title="Operational Queue" action={<Badge tone="yellow">Action required</Badge>} />
          <ObjectList
            items={
              [
                { title: "Public Data Review", detail: "Review imported Air Force roster records.", badge: "Open", icon: ClipboardList, tone: "yellow" as const },
                { title: "Import History", detail: "Audit URLs, counts, and timestamps.", badge: "History", icon: Database, tone: "blue" as const },
                ...dashboard.queue.map((item, index) => ({
                ...item,
                icon: index === 0 ? Database : index === 1 ? Users : Radio
                }))
              ]
            }
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button href="/admin/public-data" variant="primary">Review Public Data</Button>
            <Button href="/admin/import-history" variant="secondary">View Import History</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
