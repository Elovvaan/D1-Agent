import { CheckCircle2, Mail, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { ActivityItem, Badge, Button, Card, PageHeader, SectionTitle, Timeline } from "@/components/design-system";
import { getCollegeMatches, getOpportunities, toTitle } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "approve-ready-drafts-unavailable": "Approving and sending outreach is intentionally unavailable until approval-gated messaging is connected.",
  "review-outreach-unavailable": "Draft review is intentionally unavailable until the outreach approval workflow is connected."
};

function UnavailableButton({ action, children, variant = "primary" }: { action: string; children: React.ReactNode; variant?: "primary" | "cta" }) {
  return (
    <form action={recordUnavailableAction}>
      <input type="hidden" name="returnTo" value="/outreach" />
      <input type="hidden" name="action" value={action} />
      <Button variant={variant}>{children}</Button>
    </form>
  );
}

export default async function OutreachPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const matches = getCollegeMatches();
  const drafts = getOpportunities().filter((item) => item.actionType === "draft_outreach" || item.actionType === "request_verification");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Approval-gated agent outreach"
        title="Outreach"
        description="The Agent prepares the work. Athlete and parent approval gates decide what leaves the platform."
        action={<UnavailableButton action="approve-ready-drafts" variant="cta"><Send size={17} /> Approve Ready Drafts</UnavailableButton>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <SectionTitle title="Prepared Drafts" action={<Badge tone={drafts.length ? "yellow" : "silver"}>{drafts.length} pending approval</Badge>} />
          {drafts.map((draft, index) => (
            <div className="mb-4 rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5 last:mb-0" key={draft.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="yellow">Pending approval</Badge>
                  <h2 className="mt-3 text-lg font-black">{matches[index]?.collegeName ? `${matches[index].collegeName} recruiting staff` : toTitle(draft.type)}</h2>
                  <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#66718F]">
                    {draft.rationale} Approve to send after review.
                  </p>
                </div>
                <UnavailableButton action="review-outreach">Review</UnavailableButton>
              </div>
            </div>
          ))}
          {!drafts.length ? (
            <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No outreach drafts yet. Drafts appear only after real recruiting targets or verification requests exist.</p>
          ) : null}
        </Card>
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="Compliance Guardrails" />
            <ActivityItem icon={ShieldCheck} title="Parent consent" detail="Consent status appears after onboarding saves guardian approval." tone="silver" />
            <ActivityItem icon={CheckCircle2} title="Approval record" detail="No external send without approval." tone="blue" />
            <ActivityItem icon={Mail} title="Opt-out respected" detail="Email sends use unsubscribe rules." tone="silver" />
          </Card>
          <Card>
            <SectionTitle title="Campaign Stage" />
            <Timeline
              items={[
                { title: "Targets ranked", detail: matches.length ? "Agent selected high-fit schools." : "No recruiting targets ranked yet.", state: matches.length ? "done" : "queued" },
                { title: "Messages drafted", detail: drafts.length ? "Personalized with verified profile data." : "No drafts prepared yet.", state: drafts.length ? "done" : "queued" },
                { title: "Athlete review", detail: `${drafts.length} messages awaiting approval.`, state: "active" },
                { title: "Send and track", detail: "Open, reply, interest, and pass signals feed matches.", state: "queued" }
              ]}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
