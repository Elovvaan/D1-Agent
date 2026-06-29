import { Activity, Clapperboard, Trophy } from "lucide-react";
import { Button, Card, ObjectList, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function SportsPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Sports" title="Built for every athlete progression path." description="MyD1 supports public records, media, highlights, verified stats, recruiting, and career development across youth, high school, college, and elite levels." action={<Button href="/get-started" variant="cta">Choose Your Role</Button>} />
        <Card>
          <ObjectList
            items={[
              { title: "Performance", detail: "Track public stats, manual stats, game logs, imported stats, records, and awards with source labels.", icon: Activity, tone: "green" },
              { title: "Film and highlights", detail: "Organize athlete uploads, media partner uploads, short clips, highlight reels, and public profile media.", icon: Clapperboard, tone: "blue" },
              { title: "Career stages", detail: "A1, B1, C1, and D1 milestones make the platform useful from foundation to elite readiness.", icon: Trophy, tone: "yellow" }
            ]}
          />
        </Card>
      </section>
    </PublicSiteShell>
  );
}
