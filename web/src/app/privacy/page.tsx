import { Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function PrivacyPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Privacy" title="Privacy and athlete safety" description="MyD1 is designed around visibility controls, source labels, guardian approval for minors, and D1-routed contact requests." />
        <Card>
          <p className="text-sm font-semibold leading-7 text-[#66718F]">Public profiles should only display visibility-safe information. Private phone and email data are not exposed on public athlete pages.</p>
        </Card>
      </section>
    </PublicSiteShell>
  );
}
