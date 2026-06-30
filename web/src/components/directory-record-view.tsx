import { ArrowLeft, ExternalLink, Link2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle } from "@/components/design-system";
import { getPublicDirectoryRecord, toTitle } from "@/lib/data/services";

export function DirectoryRecordView({ entityType, entityId }: { entityType: string; entityId: string }) {
  const record = getPublicDirectoryRecord(entityId);

  if (!record) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="MyD1 Public Directory"
          title={`${toTitle(entityType)} record setup needed`}
          description="This public directory detail page is not connected to a matching imported record yet. Search results stay on a working setup state instead of sending visitors to a missing page."
          action={<Button href="/search" variant="secondary"><ArrowLeft size={16} /> Back to Public Search</Button>}
        />
        <Card>
          <SectionTitle title="No Imported Record Found" caption="The record may have been removed, merged, or may still be waiting for a full public detail page." />
          <p className="text-sm font-semibold leading-6 text-[#66718F]">Run a public URL import or select another public directory result to review available records.</p>
        </Card>
      </AppShell>
    );
  }

  const reviewStatus = record.graphNode?.reviewStatus ?? "pending_review";
  const linked = record.graphNode?.linked ?? [];

  return (
    <AppShell>
      <PageHeader
        eyebrow="MyD1 Public Directory"
        title={record.title}
        description={record.detail || "Imported public record awaiting a full MyD1 detail page."}
        action={<Button href="/search" variant="secondary"><ArrowLeft size={16} /> Back to Public Search</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle
              title={`${record.typeLabel} Detail`}
              caption="This setup view preserves source attribution until the full destination page is available."
              action={<Badge tone={reviewStatus === "auto_linked" ? "green" : "yellow"}>{toTitle(reviewStatus)}</Badge>}
            />
            {record.fields.length ? (
              <ObjectList
                items={record.fields.map((field) => ({
                  title: toTitle(field.name),
                  detail: field.sourceUrl,
                  value: field.value,
                  icon: ShieldCheck,
                  tone: "green"
                }))}
              />
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No field-level details are available yet.</p>
            )}
          </Card>

          <Card>
            <SectionTitle title="Linked Directory Graph" caption="Automatic links are built from real source data and remain unverified until reviewed." />
            {linked.length ? (
              <ObjectList
                items={linked.map((item) => ({
                  title: item.name,
                  detail: toTitle(item.label),
                  badge: toTitle(item.type),
                  icon: Link2,
                  tone: "blue"
                }))}
              />
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No linked school, team, ranking, organization, source, or review records are available yet.</p>
            )}
          </Card>
        </div>

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
                <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">{record.graphNode?.importedAt ?? record.run?.fetchedAt ?? "Timestamp unavailable"}</p>
              </div>
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
                <div className="text-sm font-black text-[#0A1A3F]">Review Status</div>
                <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">{toTitle(reviewStatus)}</p>
              </div>
              {record.entity.sourceUrl ? (
                <a
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-4 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#F7F9FC]"
                  href={record.entity.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Source <ExternalLink size={16} />
                </a>
              ) : null}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Page Status" />
            <p className="text-sm font-semibold leading-6 text-[#66718F]">
              This graph page is connected to imported public data. Missing fields stay empty rather than being filled with invented directory details.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
