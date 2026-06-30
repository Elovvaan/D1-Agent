import { Database, ListChecks, Search, Users } from "lucide-react";
import { runRosterBackfillAction } from "@/app/actions/roster-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getRosterBackfillDashboard } from "@/lib/data/roster-backfill";

const statusMessages: Record<string, string> = {
  "invalid-url": "Enter a valid public roster URL.",
  "backfill-failed": "Roster backfill could not complete for that URL.",
  "backfill-complete": "Roster backfill completed and updated the roster store."
};

export default async function AdminRostersPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const dashboard = getRosterBackfillDashboard();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Roster Backfill"
        title="Roster Backfill + Player Progression"
        description="Run public roster URLs through the backfill engine. Snapshots and player-team-season edges are append-only; weak matches stay in review."
        action={<Button href="/admin/import-school" variant="secondary">Import Sources</Button>}
      />

      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="Run Roster URL" caption="Use public roster pages only. No login walls, no fake players, no automatic weak merges." />
            <form action={runRosterBackfillAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="rosterUrl">Public roster URL</label>
              <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
                <Search size={17} className="text-[#66718F]" />
                <input
                  className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
                  id="rosterUrl"
                  name="rosterUrl"
                  placeholder="https://www.maxpreps.com/va/chantilly/st-paul-vi-panthers/basketball/25-26/roster/"
                  required
                  type="url"
                />
              </div>
              <Button variant="primary"><Database size={17} /> Run Backfill</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="Latest Players" caption="Real roster players parsed from public roster snapshots." action={<Badge tone="silver">{dashboard.players.length}</Badge>} />
            {dashboard.players.length ? (
              <ObjectList
                items={dashboard.players.slice(0, 12).map((player) => ({
                  title: player.name_canonical,
                  detail: `Graduation ${player.graduation_year ?? "unknown"} - ${player.roster_status}`,
                  badge: player.review_status,
                  icon: Users,
                  tone: player.review_status === "auto" ? "green" : "yellow"
                }))}
              />
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No roster players have been backfilled yet.</p>
            )}
          </Card>
        </div>

        <div className="grid h-fit gap-4">
          <StatCard label="Players" value={String(dashboard.players.length)} detail="Resolved or review-pending roster players." icon={Users} />
          <StatCard label="Snapshots" value={String(dashboard.snapshots.length)} detail="Append-only roster observations." icon={Database} tone="green" />
          <StatCard label="Team Seasons" value={String(dashboard.teamSeasons.length)} detail="Team-season spine records." icon={ListChecks} tone="blue" />
          <StatCard label="Review Items" value={String(dashboard.reviews.length)} detail="Ambiguous player or roster progression items." icon={ListChecks} tone="yellow" />
        </div>
      </div>
    </AppShell>
  );
}
