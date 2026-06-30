import { Calendar, Clapperboard, Radio, ShieldCheck, Upload, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getAdminDashboard, getPublicDirectoryCounters } from "@/lib/data/services";

export default function AdminConsolePage() {
  const dashboard = getAdminDashboard();
  const counters = getPublicDirectoryCounters();

  return (
    <AppShell>
      <PageHeader
        eyebrow="School athletics"
        title="Admin Console"
        description="Upload school, team, game, and event media. Athlete profile edits stay with the athlete, guardian, and authorized coach workflows."
        action={<Button href="/film" variant="primary"><Upload size={17} /> Upload Game Film</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Game Film" value="Upload" detail="School and team video only." icon={Video} />
          <StatCard label="Schedules" value="Ready" detail="School event updates." icon={Calendar} tone="yellow" />
          <StatCard label="Streams" value="0" detail="No live inputs connected yet." icon={Radio} tone="silver" />
          <StatCard label="Review Boundaries" value="Locked" detail="Athlete data edits are blocked here." icon={ShieldCheck} tone="green" />
        </div>
        <Card>
          <SectionTitle title="School Media Queue" action={<Badge tone="green">Limited admin</Badge>} />
          <ObjectList
            items={[
              { title: "Upload Game Film", detail: "Add full game, practice, and team video for review.", badge: "Film", icon: Video, tone: "green" as const },
              { title: "Upload Event Media", detail: "Add school event clips and official team media.", badge: "Media", icon: Clapperboard, tone: "blue" as const },
              { title: "Stream Operations", detail: "Connect livestream inputs when the production pipeline is ready.", badge: "Streams", icon: Radio, tone: "silver" as const },
              { title: "Public Data Review", detail: counters.pendingReview ? "Review school-level public records only." : "No school-level reviews pending.", badge: `${counters.pendingReview}`, icon: ShieldCheck, tone: counters.pendingReview ? "yellow" as const : "silver" as const },
              ...dashboard.queue.map((item) => ({
                ...item,
                detail: item.detail.replace(/player|athlete|profile/gi, "school media"),
                icon: ShieldCheck,
                tone: "silver" as const
              }))
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button href="/film" variant="primary">Upload Game Film</Button>
            <Button href="/calendar" variant="secondary">Manage Schedule</Button>
            <Button href="/admin/public-data" variant="secondary">Review School Records</Button>
            <Button href="/admin/operator" variant="secondary">Media Operations</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
