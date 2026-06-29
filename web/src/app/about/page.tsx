import { Bot, ShieldCheck, Trophy } from "lucide-react";
import { Card, ObjectList, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function AboutPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="About" title="MyD1 is the athletic career platform." description="MyD1 helps athletes build a verified public profile, organize film, connect with coaches, and progress from early development through elite opportunities." />
        <Card>
          <ObjectList
            items={[
              { title: "Verified career identity", detail: "Profiles combine athlete-entered data, public records, documents, coach verification, and review-safe source labels.", icon: ShieldCheck, tone: "green" },
              { title: "One Agent", detail: "The D1 Agent infers scouting, recruiting, brand, marketing, and career-development intent behind the scenes.", icon: Bot, tone: "blue" },
              { title: "Full progression path", detail: "A1 Foundation, B1 Recruit, C1 College, and D1 Elite keep every athlete moving toward the next level.", icon: Trophy, tone: "yellow" }
            ]}
          />
        </Card>
      </section>
    </PublicSiteShell>
  );
}
