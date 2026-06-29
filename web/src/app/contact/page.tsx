import { Mail } from "lucide-react";
import { Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function ContactPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Contact" title="Contact MyD1" description="Contact requests for athletes stay routed through MyD1 safety gates instead of exposing private athlete contact information." />
        <Card>
          <div className="flex items-center gap-3">
            <Mail className="text-[#1B3FA0]" size={24} />
            <p className="text-sm font-semibold leading-7 text-[#66718F]">For now, use the public profile contact request flow or the role-specific onboarding paths to reach the correct workspace.</p>
          </div>
        </Card>
      </section>
    </PublicSiteShell>
  );
}
