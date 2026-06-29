import { Search, ShieldCheck, UserCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { recordAthleteClaimRequest } from "@/app/actions/public-import-actions";
import { getImportedPlayers } from "@/lib/data/public-imports";

function matchesClaimSearch(player: { name: string; position?: string; jerseyNumber?: string }) {
  const haystack = `${player.name} ${player.position ?? ""} ${player.jerseyNumber ?? ""}`.toLowerCase();
  return haystack.includes("jayden") || haystack.includes("qb") || haystack.includes("7");
}

export default async function AthletePublicClaimPage() {
  const players = await getImportedPlayers();
  const suggested = players.filter(matchesClaimSearch).slice(0, 12);
  const visiblePlayers = suggested.length > 0 ? suggested : players.slice(0, 12);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Athlete claim flow"
        title="Claim Public Roster Profile"
        description="Search imported public athletics records, confirm the right player, and request a claim review before the record connects to your D1 profile."
        action={<Button href="/profile" variant="secondary">Back to Profile</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Imported Player Search" caption="Using the Air Force public roster import as the first real test dataset." action={<Badge tone="blue">{players.length} players</Badge>} />
          <div className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl border border-[#DDE3EC] bg-[#F8FAFD] px-4">
            <Search size={18} className="text-[#66718F]" />
            <span className="text-sm font-semibold text-[#66718F]">Search imported players by name, position, number, class, or source URL</span>
          </div>
          <div className="grid gap-4">
            {visiblePlayers.map((player) => (
              <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={player.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {player.jerseyNumber ? <Badge tone="silver">#{player.jerseyNumber}</Badge> : null}
                      {player.position ? <Badge>{player.position}</Badge> : null}
                      {player.classYear ? <Badge tone="yellow">{player.classYear}</Badge> : null}
                    </div>
                    <h2 className="mt-3 text-xl font-black text-[#0A1A3F]">{player.name}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#66718F]">
                      {[player.height, player.weight, player.hometown].filter(Boolean).join(" - ") || "Imported public roster record"}
                    </p>
                    <p className="mt-2 truncate text-xs font-medium text-[#66718F]">{player.sourceUrl}</p>
                  </div>
                  <form action={recordAthleteClaimRequest}>
                    <input name="importedPlayerId" type="hidden" value={player.id} />
                    <input name="playerName" type="hidden" value={player.name} />
                    <input name="sourceUrl" type="hidden" value={player.sourceUrl} />
                    <Button variant="cta"><UserCheck size={16} /> Request Claim</Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </Card>
        <div className="grid h-fit gap-4">
          <StatCard label="Imported Players" value={`${players.length}`} detail="Available for athlete claim review." icon={UserCheck} />
          <StatCard label="Suggested Matches" value={`${visiblePlayers.length}`} detail="Ranked from available public player fields." icon={Search} tone="yellow" />
          <Card>
            <SectionTitle title="Claim Requirements" />
            <div className="grid gap-3 text-sm font-semibold leading-6 text-[#66718F]">
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">The athlete must authenticate before a public player record can attach to a D1 profile.</div>
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">Admin review confirms identity, duplicate risk, and source attribution.</div>
              <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">Coach verification is still required before imported fields raise Trust Score.</div>
            </div>
          </Card>
          <StatCard label="Trust Safe" value="Gated" detail="Claims do not auto-merge into verified profile data." icon={ShieldCheck} tone="green" />
        </div>
      </div>
    </AppShell>
  );
}
