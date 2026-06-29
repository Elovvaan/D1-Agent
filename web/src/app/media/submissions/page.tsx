import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { recordMediaPartnerReviewAction } from "@/app/actions/media-partner-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getMediaPartnerSubmissions } from "@/lib/data/media-partner";

const statusMessages: Record<string, string> = {
  submitted: "Media submitted to review queue. It is not public.",
  updated: "Media approval decision recorded.",
  "not-found": "Submission was not found."
};

function tone(status: string) {
  if (status.includes("approved") || status === "published") return "green" as const;
  if (status.includes("pending") || status.includes("required")) return "yellow" as const;
  if (status.includes("declined") || status.includes("removal")) return "red" as const;
  return "silver" as const;
}

export default async function MediaPartnerSubmissionsPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const submissions = getMediaPartnerSubmissions();
  const reviewPending = submissions.filter((item) => item.approvalStatus === "review_pending");
  const approvalRequired = submissions.filter((item) => item.approvalStatus === "athlete_approval_required");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Media Partner"
        title="Contribution Submissions"
        description="Review, athlete approval, guardian approval, and publication decisions are logged here. Media partners cannot publish directly."
        action={<Button href="/media/upload" variant="primary">Upload More Media</Button>}
      />
      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Submissions" value={`${submissions.length}`} detail="All media partner contributions." icon={ShieldCheck} />
        <StatCard label="Review Pending" value={`${reviewPending.length}`} detail="Admin/operator review required." icon={ShieldCheck} tone="yellow" />
        <StatCard label="Athlete Approval" value={`${approvalRequired.length}`} detail="Athlete or guardian decision required." icon={CheckCircle2} tone="yellow" />
        <StatCard label="Published" value={`${submissions.filter((item) => item.visibility === "published").length}`} detail="Approved for public profile use." icon={CheckCircle2} tone="green" />
      </div>
      <Card>
        <SectionTitle title="Approval Pipeline" caption="Admin review prepares content for athlete approval. Athlete or guardian controls public presentation." />
        {submissions.length ? (
          <div className="grid gap-4">
            {submissions.map((item) => (
              <article className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-[#0A1A3F]">{item.title}</h2>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">{item.uploaderOrganizationName} - {item.sourceLabel} - {item.uploadedAt}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">Tags: {item.taggedAthletes.join(", ") || "None"} - License: {item.licenseState.replaceAll("_", " ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={tone(item.approvalStatus)}>{item.approvalStatus.replaceAll("_", " ")}</Badge>
                    <Badge tone={tone(item.visibility)}>{item.visibility.replaceAll("_", " ")}</Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#E4E9F1] bg-white p-4">
                    <div className="text-sm font-black text-[#0A1A3F]">Admin Review</div>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Admin can approve the item to move into athlete/guardian approval. This does not publish it.</p>
                    <form action={recordMediaPartnerReviewAction} className="mt-3 flex flex-wrap gap-2">
                      <input name="submissionId" type="hidden" value={item.id} />
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#1B3FA0] px-3 py-2 text-xs font-black text-white" name="action" type="submit" value="admin_ready_for_athlete"><CheckCircle2 size={15} /> Ready for Athlete</button>
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-xs font-black text-[#B42318]" name="action" type="submit" value="admin_reject"><XCircle size={15} /> Reject</button>
                    </form>
                  </div>

                  <div className="rounded-2xl border border-[#E4E9F1] bg-white p-4">
                    <div className="text-sm font-black text-[#0A1A3F]">Athlete / Guardian Control</div>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Approval is required before media can appear on the public athlete profile.</p>
                    <form action={recordMediaPartnerReviewAction} className="mt-3 flex flex-wrap gap-2">
                      <input name="submissionId" type="hidden" value={item.id} />
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#F2C200] px-3 py-2 text-xs font-black text-[#0A1A3F]" name="action" type="submit" value="athlete_approve"><CheckCircle2 size={15} /> Approve</button>
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-xs font-black text-[#0A1A3F]" name="action" type="submit" value="save_private">Save Private</button>
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-xs font-black text-[#B42318]" name="action" type="submit" value="decline">Decline</button>
                      <button className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-xs font-black text-[#B42318]" name="action" type="submit" value="request_removal">Request Removal</button>
                    </form>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4">
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Audit History</div>
                  <div className="mt-2 grid gap-2">
                    {item.auditHistory.map((audit) => (
                      <div className="text-xs font-semibold text-[#66718F]" key={`${audit.action}-${audit.occurredAt}`}>{audit.occurredAt} - {audit.actor}: {audit.action}{audit.note ? ` - ${audit.note}` : ""}</div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold leading-6 text-[#66718F]">No media partner submissions yet.</p>
        )}
      </Card>
    </AppShell>
  );
}
