import { Building2, Database, Search } from "lucide-react";
import { Button, Card, ObjectList, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function SchoolsPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Schools" title="School and team data belongs in one trusted directory." description="MyD1 discovers public school athletics pages, imports source-attributed records, and keeps uncertain data in review." action={<Button href="/search?q=school" variant="primary">Search Schools</Button>} />
        <Card>
          <ObjectList
            items={[
              { title: "School Import Wizard", detail: "Operators can discover public athletics homepages, rosters, schedules, stats, coaches, livestreams, camps, and events.", icon: Database, tone: "blue" },
              { title: "Team and roster matching", detail: "Imported records can connect to teams, games, athletes, and review queues without becoming verified automatically.", icon: Building2, tone: "green" },
              { title: "Public search", detail: "Visitors can search imported school, team, game, coach, and public stat records without an account.", icon: Search, tone: "yellow" }
            ]}
          />
        </Card>
      </section>
    </PublicSiteShell>
  );
}
