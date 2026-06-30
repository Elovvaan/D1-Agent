import { AlertTriangle, ClipboardList, Database, Radio, Search, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getAdminDashboard, getPublicDirectoryCounters } from "@/lib/data/services";

export default function AdminConsolePage() {
  const dashboard = getAdminDashboard();
  const counters = getPublicDirectoryCounters();

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
          <StatCard label="Moderation" value="0" detail="No content moderation items are connected yet." icon={ShieldCheck} />
          <StatCard label="Disputes" value="0" detail="No active correction disputes." icon={AlertTriangle} tone="yellow" />
          <StatCard label="Streams" value="0" detail="No live stream inputs connected yet." icon={Radio} tone="silver" />
          <StatCard label="Entity Matches" value={`${counters.pendingReview}`} detail="Pending public-data review." icon={Database} />
        </div>
        <Card>
          <SectionTitle title="Operational Queue" action={<Badge tone="yellow">Action required</Badge>} />
          <ObjectList
            items={
              [
                { title: "Public Data Review", detail: counters.pendingReview ? "Review imported public records." : "No pending public-data reviews.", badge: `${counters.pendingReview}`, icon: ClipboardList, tone: counters.pendingReview ? "yellow" as const : "silver" as const },
                { title: "Roster Backfill", detail: "Run public roster URLs and build player progression edges.", badge: "Players", icon: Users, tone: "green" as const },
                { title: "School Import Wizard", detail: "Discover public school athletics pages and import selected records.", badge: "New", icon: Search, tone: "blue" as const },
                { title: "Operator Backend", detail: "Queue field media, notes, stats, and game updates for review.", badge: "Ops", icon: Radio, tone: "green" as const },
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
            <Button href="/admin/rosters" variant="secondary">Roster Backfill</Button>
            <Button href="/admin/import-school" variant="secondary">School Import Wizard</Button>
            <Button href="/admin/operator" variant="secondary">Operator Backend</Button>
            <Button href="/admin/import-history" variant="secondary">View Import History</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
