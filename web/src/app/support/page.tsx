import { LifeBuoy } from "lucide-react";
import { Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function SupportPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Support" title="Support" description="Get help with onboarding, public profile claims, school imports, media partner submissions, and review workflows." />
        <Card>
          <div className="flex items-center gap-3">
            <LifeBuoy className="text-[#1B3FA0]" size={24} />
            <p className="text-sm font-semibold leading-7 text-[#66718F]">Support workflows route through the MyD1 inbox and admin review queues as the product foundation comes online.</p>
          </div>
        </Card>
      </section>
    </PublicSiteShell>
  );
}
