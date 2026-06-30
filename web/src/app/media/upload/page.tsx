import { Upload } from "lucide-react";
import { uploadMediaPartnerSubmission } from "@/app/actions/media-partner-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/design-system";

const statusMessages: Record<string, string> = {
  "upload-too-large": "Upload is too large for the current dev action limit. Use a file under 900 KB."
};

function Field({ name, label, placeholder, required = false }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{label}</span>
      <input className="min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]" name={name} placeholder={placeholder} required={required} />
    </label>
  );
}

export default async function MediaPartnerUploadPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <AppShell>
      <PageHeader
        eyebrow="Media Partner"
        title="Upload Media Contribution"
        description="Attach media to a school, team, game, sport, or athlete. Uploads enter review and are not public until athlete/guardian approval."
        action={<Button href="/media/submissions" variant="secondary">View Submissions</Button>}
      />
      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}
      <Card>
        <SectionTitle title="Contribution Details" action={<Badge tone="yellow">Review Pending</Badge>} />
        <form action={uploadMediaPartnerSubmission} className="grid gap-4 lg:grid-cols-2">
          <Field name="organizationName" label="Uploader Organization / Name" placeholder="Peak Sports Media" required />
          <Field name="title" label="Media Title" placeholder="Fourth-quarter sideline catch" required />
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Media Type</span>
            <select className="min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold outline-none" name="mediaType">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="clip">Short Clip</option>
              <option value="highlight">Highlight Video</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Media File</span>
            <input className="rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-semibold" name="mediaFile" type="file" />
          </label>
          <Field name="schoolName" label="School" placeholder="North Ridge High" />
          <Field name="teamName" label="Team" placeholder="Varsity Football" />
          <Field name="gameName" label="Game" placeholder="North Ridge vs Central" />
          <Field name="sport" label="Sport" placeholder="Football" />
          <Field name="taggedAthletes" label="Tagged Athletes" placeholder="Athlete name, jersey number, position" />
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Usage / Licensing</span>
            <select className="min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold outline-none" name="licenseState">
              <option value="free">Free</option>
              <option value="preview_only">Preview Only</option>
              <option value="paid_license_required">Paid / License Required</option>
            </select>
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Licensing Notes</span>
            <textarea className="min-h-28 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-semibold outline-none placeholder:text-[#8A94AA]" name="licensingNotes" placeholder="Usage limits, credit requirements, rate card notes, newspaper restrictions, or creator terms." />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-black text-[#0A1A3F] lg:col-span-2">
            <input className="h-4 w-4 accent-[#1B3FA0]" name="requiresGuardianApproval" type="checkbox" />
            Guardian approval required for tagged minor athlete
          </label>
          <div className="lg:col-span-2">
            <Button variant="cta"><Upload size={17} /> Submit to Review Queue</Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
