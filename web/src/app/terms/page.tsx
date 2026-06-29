import { Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function TermsPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Terms" title="Terms of use" description="MyD1 separates public records, athlete uploads, coach verification, media partner uploads, and admin approvals with review-safe source labels." />
        <Card>
          <p className="text-sm font-semibold leading-7 text-[#66718F]">Media, stats, and profile data should not be treated as verified unless they carry the correct verification or approval source label.</p>
        </Card>
      </section>
    </PublicSiteShell>
  );
}
