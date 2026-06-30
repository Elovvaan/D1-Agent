import { Eye, Filter, GraduationCap, Search, Sparkles, Star, Target } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getRecruiterDashboard } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "apply-board-filters-unavailable": "Recruiter board filters are intentionally unavailable until saved recruiter board state is connected."
};

export default async function RecruiterCommandCenterPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const dashboard = getRecruiterDashboard();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiter agent"
        title="Recruiter Command Center"
        description="An AI recruiting assistant that maintains the board, applies smart filters, and surfaces verified rising prospects."
        action={<Button href="/search" variant="primary"><Search size={17} /> Discover Athletes</Button>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Watchlist" value={`${dashboard.prospects.length}`} detail="Verified athletes saved by this recruiter." icon={Star} />
            <StatCard label="Rising Prospects" value="0" detail="No verified prospect movement yet." icon={Sparkles} tone="yellow" />
            <StatCard label="Updated Reels" value="0" detail="No athlete-approved reel updates yet." icon={Eye} tone="green" />
          </div>
          <Card>
            <SectionTitle title="Recruiter Daily Brief" action={<Badge tone="blue">Verified only</Badge>} />
            <ObjectList
              items={
                dashboard.prospects.map((prospect: { title: string; detail: string; value?: string }, index) => ({
                  ...prospect,
                  icon: index === 0 ? Target : index === 1 ? Star : GraduationCap,
                  tone: index === 0 ? ("green" as const) : index === 1 ? ("yellow" as const) : ("blue" as const)
                }))
              }
            />
            {!dashboard.prospects.length ? (
              <p className="mt-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No recruiter prospects yet. Use public search to discover real imported or public athlete records.</p>
            ) : null}
          </Card>
        </div>
        <Card>
          <SectionTitle title="Smart Filters" />
          <div className="flex flex-wrap gap-2">
            {dashboard.filters.map((filter) => (
              <Badge tone="silver" key={filter}>{filter}</Badge>
            ))}
          </div>
          <div className="mt-6">
            <form action={recordUnavailableAction}>
              <input type="hidden" name="returnTo" value="/recruiter" />
              <input type="hidden" name="action" value="apply-board-filters" />
              <Button variant="cta" className="w-full"><Filter size={17} /> Apply Board Filters</Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
