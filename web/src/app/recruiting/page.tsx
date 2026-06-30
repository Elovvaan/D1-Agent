import { Filter, GraduationCap, Save, Target } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getCollegeMatches } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "smart-filters-unavailable": "Smart filters are intentionally unavailable until saved recruiting preferences are connected.",
  "save-target-unavailable": "Saving targets is intentionally unavailable until the recruiting board database is connected."
};

function UnavailableButton({ action, children, variant = "secondary" }: { action: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <form action={recordUnavailableAction}>
      <input type="hidden" name="returnTo" value="/recruiting" />
      <input type="hidden" name="action" value={action} />
      <Button variant={variant}>{children}</Button>
    </form>
  );
}

export default async function RecruitingPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const matches = getCollegeMatches();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Match engine"
        title="Recruiting"
        description="Explainable college matches ranked by position need, academics, region, division fit, and engagement signals."
        action={<UnavailableButton action="smart-filters" variant="primary"><Filter size={17} /> Smart Filters</UnavailableButton>}
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Target List" action={<Badge tone="yellow">Agent ranked</Badge>} />
          <div className="grid gap-3">
            {matches.map((match) => (
              <div className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-4" key={match.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black">{match.collegeName}</h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#66718F]">{match.reasons.join(" - ")}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#17833F]">{match.matchPct}%</div>
                    <Badge tone={match.interestLevel === "high" ? "yellow" : "blue"}>{match.interestLevel}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <UnavailableButton action="save-target"><Save size={15} /> Save Target</UnavailableButton>
                  <Button href="/outreach" variant="cta">Draft Outreach</Button>
                </div>
              </div>
            ))}
            {!matches.length ? (
              <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No recruiting targets yet. Complete your profile, upload film, and import verified stats before the match engine ranks schools.</p>
            ) : null}
          </div>
        </Card>
        <div className="grid gap-4">
          <StatCard label="Active Matches" value={`${matches.length}`} detail="Programs currently ranked by the Agent." icon={Target} />
          <StatCard label="Academic Fit" value={matches.length ? `${matches.filter((match) => match.reasons.some((reason) => reason.toLowerCase().includes("gpa") || reason.toLowerCase().includes("academic"))).length}/${matches.length}` : "0/0"} detail="Matches clearing saved academic profile." icon={GraduationCap} tone="green" />
          <Card>
            <SectionTitle title="Smart Filter Set" />
            <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No saved recruiting filters yet.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
