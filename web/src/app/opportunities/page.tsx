import { Eye, Megaphone, Sparkles, Star, Target } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getBrandProfile, getOpportunities, getOpportunityScore, toTitle } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "refresh-feed-unavailable": "Refreshing the live feed is intentionally unavailable until the opportunity engine is connected.",
  "opportunity-action-unavailable": "This opportunity action is intentionally unavailable until the workflow backend is connected.",
  "dismiss-opportunity-unavailable": "Dismissing opportunities is intentionally unavailable until saved opportunity state is connected."
};

function UnavailableButton({
  action,
  children,
  variant = "secondary"
}: {
  action: string;
  children: React.ReactNode;
  variant?: "primary" | "cta" | "secondary" | "ghost";
}) {
  return (
    <form action={recordUnavailableAction}>
      <input type="hidden" name="returnTo" value="/opportunities" />
      <input type="hidden" name="action" value={action} />
      <Button variant={variant}>{children}</Button>
    </form>
  );
}

export default async function OpportunityFeedPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const opportunities = getOpportunities();
  const opportunityScore = getOpportunityScore();
  const brand = getBrandProfile();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiting momentum"
        title="Opportunity Feed"
        description="No social noise. Every item is ranked by recruiting relevance and explained in the Agent's voice."
        action={<UnavailableButton action="refresh-feed" variant="primary"><Sparkles size={17} /> Refresh Feed</UnavailableButton>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <SectionTitle title="Live Opportunities" action={<Badge tone="yellow">Agent ranked</Badge>} />
          <div className="grid gap-4">
            {opportunities.map((item, index) => (
              <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone={item.state === "new" ? "yellow" : "blue"}>{toTitle(item.type)}</Badge>
                  <span className="text-sm font-black text-[#1B3FA0]">{Math.round(item.relevance * 100)} relevance</span>
                </div>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#17223F]">{item.rationale}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <UnavailableButton action="opportunity-action" variant={index === 0 ? "cta" : "secondary"}>{item.actionType ? toTitle(item.actionType) : "Review"}</UnavailableButton>
                  <UnavailableButton action="dismiss-opportunity" variant="ghost">Dismiss</UnavailableButton>
                </div>
              </article>
            ))}
            {!opportunities.length ? (
              <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No opportunities found yet. Complete your profile, upload real film, and connect verified signals before opportunities appear.</p>
            ) : null}
          </div>
        </Card>
        <div className="grid gap-4">
          <StatCard label="Opportunity Score" value={`${opportunityScore.score}`} detail={opportunityScore.score ? "Based on real profile and media signals." : "No opportunity signals found yet."} icon={Target} />
          <StatCard label="Profile Views" value={`${brand.metrics.profileClicks}`} detail="Recruiter attention from saved public profile events." icon={Eye} tone="green" />
          <StatCard label="Agent Actions" value={`${opportunities.length}`} detail="Real recommendations currently available." icon={Megaphone} tone="yellow" />
          <StatCard label="Hot Signal" value="None" detail="No outreach target is active yet." icon={Star} />
        </div>
      </div>
    </AppShell>
  );
}
