import { CheckCircle2, ClipboardCheck, Pencil, ShieldX, UserCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { recordCoachVerificationAction } from "@/app/actions/public-import-actions";
import { getCoachImportedVerificationQueue } from "@/lib/data/public-imports";

export default async function CoachImportedVerificationPage() {
  const queue = await getCoachImportedVerificationQueue();
  const visible = queue.slice(0, 24);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Coach verification"
        title="Imported Roster Verification"
        description="Verify imported public roster/player records before they become trusted D1 profile data."
        action={<Button href="/coach" variant="secondary">Coach Dashboard</Button>}
      />
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Queue" value={`${queue.length}`} detail="Imported player records awaiting coach verification." icon={ClipboardCheck} />
          <StatCard label="Approved" value="0" detail="No imported fields are coach-verified yet." icon={CheckCircle2} tone="green" />
          <StatCard label="Corrections" value="0" detail="Corrections can be captured before merge." icon={Pencil} tone="yellow" />
          <StatCard label="Rejected" value="0" detail="Rejected records stay out of Trust Score." icon={ShieldX} tone="red" />
        </div>
        <Card>
          <SectionTitle title="Roster Player Records" action={<Badge tone="yellow">{queue.length} pending</Badge>} />
          <div className="grid gap-4">
            {visible.map((request) => {
              const player = request.player;
              return (
                <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={request.id}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="yellow">{request.status}</Badge>
                        {player?.position ? <Badge>{player.position}</Badge> : null}
                        {player?.jerseyNumber ? <Badge tone="silver">#{player.jerseyNumber}</Badge> : null}
                      </div>
                      <h2 className="mt-3 text-xl font-black text-[#0A1A3F]">{player?.name ?? request.importedPlayerId}</h2>
                      <p className="mt-2 text-sm font-semibold text-[#66718F]">
                        {[player?.classYear, player?.height, player?.weight, player?.hometown].filter(Boolean).join(" - ") || "Imported roster/player data"}
                      </p>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {player?.fields.slice(0, 6).map((field) => (
                          <div className="rounded-2xl border border-[#E4E9F1] bg-white p-3" key={`${player.id}-${field.name}`}>
                            <div className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{field.name}</div>
                            <div className="mt-1 truncate text-sm font-black text-[#0A1A3F]">{field.value}</div>
                            <div className="mt-1 truncate text-xs font-medium text-[#66718F]">{field.attribution.parser}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:w-64 xl:grid-cols-1">
                      {[
                        { action: "approve", label: "Approve", icon: CheckCircle2, variant: "primary" as const },
                        { action: "correct", label: "Correct", icon: Pencil, variant: "secondary" as const },
                        { action: "reject", label: "Reject", icon: ShieldX, variant: "ghost" as const }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <form action={recordCoachVerificationAction} key={`${request.id}-${item.action}`}>
                            <input name="action" type="hidden" value={item.action} />
                            <input name="importedPlayerId" type="hidden" value={request.importedPlayerId} />
                            <input name="playerName" type="hidden" value={player?.name ?? request.importedPlayerId} />
                            <input name="sourceUrl" type="hidden" value={player?.sourceUrl ?? ""} />
                            <Button className="w-full" variant={item.variant}><Icon size={15} /> {item.label}</Button>
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
        <Card>
          <SectionTitle title="Verification Policy" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <UserCheck className="text-[#1B3FA0]" size={22} />
              <div className="mt-3 text-sm font-black text-[#0A1A3F]">Coach verified only</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">Imported public fields can display as attributed data, but only coach-reviewed fields improve trust.</p>
            </div>
            <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <Pencil className="text-[#F2C200]" size={22} />
              <div className="mt-3 text-sm font-black text-[#0A1A3F]">Corrections preserved</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">Corrections keep the original source attribution and add reviewed coach context.</p>
            </div>
            <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <ShieldX className="text-[#B42318]" size={22} />
              <div className="mt-3 text-sm font-black text-[#0A1A3F]">Rejected records isolated</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">Rejected imports remain audit-visible but cannot merge, claim, or affect trust scoring.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
