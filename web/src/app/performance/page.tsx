import { Activity, ClipboardList, Medal, Ruler, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { saveAthleteProgression, saveAthleticPerformanceIntake } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getAthleteProfile, getGames, getPublicProfileIntake, getPublicStats, getPublicStatsReviewQueue, getStats } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "performance-saved": "Athletic performance saved.",
  "performance-error": "Athletic performance could not be saved. Please try again.",
  "progression-saved": "Athlete progression saved.",
  "progression-error": "Athlete progression could not be saved. Please try again."
};

function confidenceLabel(stat: { confidence?: number }) {
  return typeof stat.confidence === "number" ? `Public Record - ${Math.round(stat.confidence * 100)}% match` : "Public Record";
}

export default async function PerformancePage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const athlete = getAthleteProfile();
  const intake = getPublicProfileIntake();
  const stats = getStats();
  const publicStats = getPublicStats();
  const publicStatsReview = getPublicStatsReviewQueue();
  const games = getGames();
  const manualStats = stats.filter((stat) => stat.source === "self" && ["Season Stats", "Game Stats", "Position-specific Stats", "Awards / Honors"].includes(stat.metric));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Athletic performance"
        title="Performance"
        description="Athletic stats, public-record imports, game logs, progression, records, and awards live here."
        action={<Badge tone={publicStats.length ? "green" : "silver"}>{publicStats.length ? "Public stats matched" : "No public stats found yet"}</Badge>}
      />
      {params.status && statusCopy[params.status] ? (
        <div
          className={
            params.status.endsWith("-error")
              ? "mb-6 rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]"
              : "mb-6 rounded-2xl border border-[#BDECCB] bg-[#EAF8F0] px-4 py-3 text-sm font-black text-[#17833F]"
          }
          role={params.status.endsWith("-error") ? "alert" : "status"}
        >
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Progression" value={athlete.progressionLevel} detail={athlete.progressionLabel} icon={Medal} tone="yellow" />
          <StatCard label="Progress" value={`${athlete.progressionPercent}%`} detail={athlete.progressionStage} icon={Sparkles} tone="green" />
          <StatCard label="Public Stats" value={`${publicStats.length}`} detail="High-confidence public-record matches." icon={ShieldCheck} />
          <StatCard label="Game Logs" value={`${games.length}`} detail="Games connected to this athlete." icon={Activity} tone="blue" />
        </div>

        <Card>
          <SectionTitle title="Athlete Progression" caption="Performance owns the athlete's A1/B1/C1/D1 progress path." />
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Current Level" value={athlete.progressionLevel} detail={athlete.progressionLabel} icon={ShieldCheck} tone="yellow" />
            <StatCard label="Next Level" value={athlete.nextProgressionLevel ?? "D1"} detail={athlete.nextProgressionLevel ? "Progress path active." : "Elite level reached."} icon={Trophy} tone="blue" />
            <StatCard label="Progress" value={`${athlete.progressionPercent}%`} detail={athlete.progressionStage} icon={Sparkles} tone="green" />
          </div>
          <p className="mt-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold leading-6 text-[#17223F]">{athlete.progressionDescription}</p>
          <form action={saveAthleteProgression} className="mt-5 grid gap-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
            <input name="returnTo" type="hidden" value="/performance" />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Current level
                <select className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="progressionLevel" defaultValue={athlete.progressionLevel}>
                  <option value="A1">A1 Foundation</option>
                  <option value="B1">B1 Recruit</option>
                  <option value="C1">C1 College</option>
                  <option value="D1">D1 Elite</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Stage
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="progressionStage" defaultValue={athlete.progressionStage} />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Progress percent
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="progressionPercent" type="number" min="0" max="100" defaultValue={athlete.progressionPercent} />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
              Completed milestones
              <textarea
                className="min-h-28 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6"
                name="completedMilestones"
                defaultValue={athlete.progressionMilestones.filter((milestone) => milestone.complete).map((milestone) => milestone.label).join("\n")}
                placeholder="One completed milestone per line"
              />
            </label>
            <ObjectList
              items={athlete.progressionMilestones.map((milestone) => ({
                title: milestone.label,
                detail: milestone.source,
                badge: milestone.complete ? "Complete" : "Incomplete",
                icon: milestone.complete ? ShieldCheck : Ruler,
                tone: milestone.complete ? "green" : "silver"
              }))}
            />
            <Button variant="primary" className="w-fit">Save Progression</Button>
          </form>
        </Card>

        <Card>
          <SectionTitle title="Manual Athletic Stats" caption="Manual performance entries stay self-reported until verified." />
          <form action={saveAthleticPerformanceIntake} className="grid gap-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Season stats<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="seasonStats" defaultValue={intake.athletics?.seasonStats ?? ""} /></label>
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Game stats<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="gameStats" defaultValue={intake.athletics?.gameStats ?? ""} /></label>
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Position-specific stats<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="positionSpecificStats" defaultValue={intake.athletics?.positionSpecificStats ?? ""} /></label>
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Records and awards<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="awardsHonors" defaultValue={intake.athletics?.awardsHonors ?? ""} /></label>
            <Button variant="primary" className="w-fit">Save Performance Stats</Button>
          </form>
          <div className="mt-5">
            {manualStats.length ? (
              <ObjectList items={manualStats.map((stat) => ({ title: stat.metric, detail: "Self-reported", value: stat.displayValue, icon: ClipboardList, tone: "silver" }))} />
            ) : (
              <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No manual athletic stats entered yet.</p>
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <SectionTitle title="Imported Public Stats" caption="Only high-confidence public-record matches display as profile stats." />
            {publicStats.length ? (
              <ObjectList items={publicStats.map((stat) => ({ title: stat.metric, detail: confidenceLabel(stat), value: stat.displayValue, icon: ShieldCheck, tone: "green" }))} />
            ) : (
              <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No public stats found yet.</p>
            )}
            {publicStatsReview.length ? <p className="mt-3 text-xs font-black text-[#745E00]">{publicStatsReview.length} imported stat match{publicStatsReview.length === 1 ? "" : "es"} require review.</p> : null}
          </Card>
          <Card>
            <SectionTitle title="Game Logs" />
            <ObjectList items={games.map((game) => ({ title: game.opponent, detail: `${game.gameDate} - ${game.location}`, value: `${game.highlightCount}`, icon: Activity, tone: game.status === "ready" ? "green" : "yellow" }))} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
