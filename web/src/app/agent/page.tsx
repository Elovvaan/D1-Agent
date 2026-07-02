import { Bot, MessageSquare, Search, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";

export default function AgentPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Assistant"
        title="Role Agent"
        description="A guided assistant space for profile work, search, messages, uploads, verification, and next-step support by account type."
        action={<Badge tone="yellow">Workspace helper</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <SectionTitle title="Quick Actions" caption="These actions route users into the working platform sections instead of dead buttons." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/search"><Button variant="primary"><Search size={17} /> Search Records</Button></Link>
            <Link href="/messages"><Button variant="secondary"><MessageSquare size={17} /> Open Messages</Button></Link>
            <Link href="/settings"><Button variant="secondary"><ShieldCheck size={17} /> Account Settings</Button></Link>
            <Link href="/notifications"><Button variant="secondary"><Sparkles size={17} /> Notifications</Button></Link>
          </div>
        </Card>
        <div className="grid h-fit gap-4">
          <StatCard label="Assistant" value="Ready" detail="Routes users to active tools." icon={Bot} tone="yellow" />
          <StatCard label="Search" value="Live" detail="Public directory search is connected." icon={Search} />
          <StatCard label="Messages" value="Gated" detail="Inbox displays threads; sending waits for backend connection." icon={MessageSquare} tone="silver" />
        </div>
        <Card>
          <SectionTitle title="Agent Support Areas" />
          <ObjectList
            items={[
              { title: "Profile setup", detail: "Help each role complete identity, media, and page settings.", badge: "Setup", icon: ShieldCheck, tone: "green" },
              { title: "Discovery", detail: "Guide users through search, schools, athletes, teams, and coaches.", badge: "Search", icon: Search, tone: "blue" },
              { title: "Communication", detail: "Route users to inbox and notification workflows.", badge: "Inbox", icon: MessageSquare, tone: "yellow" }
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}
