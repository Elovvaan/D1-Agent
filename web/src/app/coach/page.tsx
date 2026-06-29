import { CheckCircle2, ClipboardCheck, Radio, ShieldCheck, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ActivityItem, Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getCoachImportedVerificationQueue } from "@/lib/data/public-imports";
import { getCoachDashboard } from "@/lib/data/services";

export default async function CoachCommandCenterPage() {
  const dashboard = getCoachDashboard();
  const importedQueue = await getCoachImportedVerificationQueue();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Coach agent"
        title="Good Morning, Coach Davis."
        description="The Coach Agent ranks roster-wide priorities by recruiting impact so your verification work moves the right athletes first."
        action={<Button href="/coach/imported-verification" variant="primary"><ClipboardCheck size={17} /> Open Verification Queue</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Verification Queue" value={`${importedQueue.length}`} detail="Imported roster/player records pending." icon={ClipboardCheck} />
            <StatCard label="Team Trust" value="74" detail="Average score, two athletes rising." icon={ShieldCheck} tone="green" />
            <StatCard label="Livestream" value="Ready" detail="Friday input is provisioned." icon={Radio} tone="yellow" />
          </div>
          <Card>
            <SectionTitle title="Today's Priorities" action={<Badge tone="yellow">Ranked by Agent</Badge>} />
            {dashboard.priorities.map((priority, index) => (
              <ActivityItem
                key={priority.title}
                icon={index === 0 ? ClipboardCheck : index === 1 ? Trophy : index === 2 ? ShieldCheck : Users}
                title={priority.title}
                detail={priority.detail}
                tone={priority.tone}
              />
            ))}
          </Card>
        </div>
        <Card>
          <SectionTitle title="Mission Cards" />
          <ObjectList
            items={
              dashboard.missionCards.map((card, index) => ({
                ...card,
                icon: index === 0 ? ClipboardCheck : index === 1 ? ShieldCheck : index === 2 ? Trophy : Radio
              }))
            }
          />
          <div className="mt-6">
            <Button href="/coach/imported-verification" variant="cta" className="w-full"><CheckCircle2 size={17} /> Verify Highest Impact Item</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
