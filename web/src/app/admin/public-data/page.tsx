import { CheckCircle2, Database, GitMerge, Pencil, ShieldX } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { recordPublicReviewAction } from "@/app/actions/public-import-actions";
import { formatImportDate, getField, getPublicDataReviewQueue, getReviewActions } from "@/lib/data/public-imports";
import { toTitle } from "@/lib/data/services";

const actionIcons = {
  approve: CheckCircle2,
  correct: Pencil,
  reject: ShieldX,
  merge: GitMerge
} as const;

export default async function AdminPublicDataReviewPage() {
  const { run, items } = await getPublicDataReviewQueue();
  const reviewItems = items.slice(0, 24);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Public data importer"
        title="Public Data Review"
        description="Review source-attributed public athletics records before they affect profiles, claims, coach verification, or trust scoring."
        action={<Button href="/admin/import-history" variant="secondary">Import History</Button>}
      />
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Records Imported" value={`${run?.entities.length ?? 0}`} detail="From the latest public URL import." icon={Database} />
          <StatCard label="Review Queue" value={`${items.length}`} detail="Pending admin review before merge." icon={Pencil} tone="yellow" />
          <StatCard label="Players" value={`${run?.entities.filter((entity) => entity.type === "player").length ?? 0}`} detail="Eligible for athlete claim and coach verification." icon={CheckCircle2} tone="green" />
          <StatCard label="Public Stats" value={`${run?.entities.filter((entity) => entity.type === "stat").length ?? 0}`} detail="Auto-ingested stats with source attribution." icon={Database} tone="blue" />
          <StatCard label="Imported At" value={run ? formatImportDate(run.fetchedAt).split(",")[0] : "None"} detail={run?.sourceTitle ?? "No import artifact found."} icon={Database} tone="blue" />
        </div>

        <Card>
          <SectionTitle
            title="Admin Review Queue"
            caption={run ? `${run.sourceTitle} - ${run.sourceUrl}` : "Run the public importer to create reviewable records."}
            action={<Badge tone="yellow">{items.length} requiring review</Badge>}
          />
          <div className="grid gap-4">
            {reviewItems.map((item) => {
              const entity = item.entity;
              const actions = getReviewActions(entity?.type ?? "record");
              return (
                <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={item.id}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.priority === "high" ? "yellow" : "blue"}>{item.priority} priority</Badge>
                        <Badge tone="silver">{entity ? toTitle(entity.type) : "Missing entity"}</Badge>
                        <span className="text-xs font-black text-[#66718F]">{Math.round(Number(item.evidence.confidence ?? 0) * 100)} match confidence</span>
                      </div>
                      <h2 className="mt-3 text-xl font-black text-[#0A1A3F]">
                        {entity ? getField(entity, "name") ?? getField(entity, "athleteName") ?? getField(entity, "statMetric") ?? getField(entity, "schoolName") ?? getField(entity, "teamName") ?? entity.sourceRef : item.importedEntityId}
                      </h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">{item.reason}</p>
                      {entity ? (
                        <div className="mt-4 grid gap-2 md:grid-cols-3">
                          {entity.fields.slice(0, 6).map((field) => (
                            <div className="rounded-2xl border border-[#E4E9F1] bg-white p-3" key={`${entity.id}-${field.name}`}>
                              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{toTitle(field.name)}</div>
                              <div className="mt-1 truncate text-sm font-black text-[#0A1A3F]">{field.value}</div>
                              <div className="mt-1 truncate text-xs font-medium text-[#66718F]">{field.attribution.selector ?? field.attribution.parser}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:w-56 xl:grid-cols-1">
                      {actions.map((action) => {
                        const Icon = actionIcons[action.kind];
                        return (
                          <form action={recordPublicReviewAction} key={action.id}>
                            <input name="action" type="hidden" value={action.kind} />
                            <input name="entityId" type="hidden" value={entity?.id ?? item.importedEntityId} />
                            <input name="entityType" type="hidden" value={entity?.type ?? "record"} />
                            <input name="sourceUrl" type="hidden" value={entity?.sourceUrl ?? run?.sourceUrl ?? ""} />
                            <Button className="w-full" variant={action.kind === "reject" ? "secondary" : action.kind === "merge" ? "primary" : "ghost"}>
                              <Icon size={15} />
                              {action.label}
                            </Button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
