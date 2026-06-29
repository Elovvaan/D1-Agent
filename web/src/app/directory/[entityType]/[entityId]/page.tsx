import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle } from "@/components/design-system";
import { getPublicDirectoryRecord, toTitle } from "@/lib/data/services";

export default async function PublicDirectoryRecordPage({
  params
}: {
  params: Promise<{ entityType: string; entityId: string }>;
}) {
  const { entityType, entityId } = await params;
  const record = getPublicDirectoryRecord(entityId);

  if (!record) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="MyD1 Public Directory"
          title={`${toTitle(entityType)} record setup needed`}
          description="This public directory detail page is not connected to a matching imported record yet. Search results stay on a working setup state instead of sending visitors to a missing page."
          action={<Button href="/athletes/athlete-jayden-lewis" variant="secondary"><ArrowLeft size={16} /> Back to Public Search</Button>}
        />
        <Card>
          <SectionTitle title="No Imported Record Found" caption="The record may have been removed, merged, or may still be waiting for a full public detail page." />
          <p className="text-sm font-semibold leading-6 text-[#66718F]">Run a public URL import or select another public directory result to review available records.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="MyD1 Public Directory"
        title={record.title}
        description={record.detail || "Imported public record awaiting a full MyD1 detail page."}
        action={<Button href="/athletes/athlete-jayden-lewis" variant="secondary"><ArrowLeft size={16} /> Back to Public Search</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle
            title={`${record.typeLabel} Detail`}
            caption="This setup view preserves source attribution until the full destination page is available."
            action={<Badge tone="green">Public Record</Badge>}
          />
          <ObjectList
            items={record.fields.map((field) => ({
              title: toTitle(field.name),
              detail: field.sourceUrl,
              value: field.value,
              icon: ShieldCheck,
              tone: "green"
            }))}
          />
        </Card>

        <div className="grid h-fit gap-6">
          <Card>
            <SectionTitle title="Source Attribution" caption="Imported records keep field-level source context for review and matching." />
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
                <div className="text-sm font-black text-[#0A1A3F]">Record Type</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="blue">{record.typeLabel}</Badge>
                  <Badge tone="silver">{record.group}</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
                <div className="text-sm font-black text-[#0A1A3F]">Imported</div>
                <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">{record.run?.fetchedAt ?? "Timestamp unavailable"}</p>
              </div>
              <a
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-4 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#F7F9FC]"
                href={record.entity.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open Source <ExternalLink size={16} />
              </a>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Page Status" />
            <p className="text-sm font-semibold leading-6 text-[#66718F]">
              A dedicated {record.typeLabel.toLowerCase()} page can be connected later. Until then, this public directory record is reviewable and share-safe.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
