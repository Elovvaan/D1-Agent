import { Camera, CheckCircle2, ClipboardList, Film, NotebookPen, Search, ShieldCheck, Trophy } from "lucide-react";
import {
  recordOperatorReviewDecision,
  submitOperatorFieldNote,
  submitOperatorGameUpdate,
  submitOperatorMedia,
  submitOperatorStatReport
} from "@/app/actions/admin-operator-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getOperatorBackendState } from "@/lib/data/operator-backend";
import { searchPublicDirectory } from "@/lib/data/services";

const statusMessages: Record<string, string> = {
  "media-queued": "Media uploaded and queued for admin review.",
  "note-queued": "Field note queued for review.",
  "stat-queued": "Unofficial stat report queued as Field Reported / Pending Review.",
  "game-queued": "Game update queued for review.",
  "review-recorded": "Review decision logged.",
  "upload-too-large": "Upload is too large for the current dev action limit. Use a file under 900 KB."
};

function Field({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{label}</span>
      <input
        className="min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function SelectField({ name, label, options }: { name: string; label: string; options: Array<{ label: string; value: string }> }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{label}</span>
      <select className="min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold text-[#0A1A3F] outline-none" name={name}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export default async function OperatorBackendPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const state = getOperatorBackendState();
  const searchGroups = searchPublicDirectory((params.q ?? "").trim());

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operator Backend"
        title="Field Operations Console"
        description="Founder/operator/media workflow for public-safe media, field notes, unofficial stats, game updates, and review-ready publication records."
        action={<Button href="/admin/import-school" variant="secondary"><Search size={17} /> School Import Wizard</Button>}
      />

      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="Search School, Team, Athlete, or Game" caption="Searches real imported/public/user-created records only." />
            <form className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="operator-search">Operator search</label>
              <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
                <Search size={17} className="text-[#66718F]" />
                <input
                  className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
                  defaultValue={params.q}
                  id="operator-search"
                  name="q"
                  placeholder="Search schools, teams, athletes, games, events, coaches, stats"
                  type="search"
                />
              </div>
              <Button variant="primary">Search</Button>
            </form>
            {params.q ? (
              <div className="mt-4 grid gap-4">
                {searchGroups.length ? searchGroups.map((group) => (
                  <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={group.group}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#0A1A3F]">{group.group}</h2>
                      <Badge tone="silver">{group.results.length}</Badge>
                    </div>
                    <div className="grid gap-3">
                      {group.results.map((result) => (
                        <a className="rounded-2xl border border-[#E4E9F1] bg-white p-4 transition hover:border-[#1B3FA0]" href={result.href} key={result.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-[#0A1A3F]">{result.title}</div>
                              <div className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">{result.detail}</div>
                            </div>
                            <Badge tone="blue">{result.typeLabel}</Badge>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )) : <p className="text-sm font-black text-[#66718F]">No results found.</p>}
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle title="Create or Update Game" caption="Field updates enter review as Field Reported / Pending Review." />
              <form action={submitOperatorGameUpdate} className="grid gap-3">
                <Field name="gameName" label="Game Name" placeholder="Falcons vs Tigers" required />
                <Field name="opponent" label="Opponent" placeholder="Central High School" />
                <Field name="gameDate" label="Game Date" type="datetime-local" />
                <Field name="location" label="Location" placeholder="Home Stadium" />
                <SelectField name="gameStatus" label="Status" options={[{ label: "Scheduled", value: "scheduled" }, { label: "Live", value: "live" }, { label: "Final", value: "final" }]} />
                <Field name="note" label="Game Notes" placeholder="Coverage context, weather, standout moments" />
                <Button variant="cta"><Trophy size={17} /> Queue Game Update</Button>
              </form>
            </Card>

            <Card>
              <SectionTitle title="Upload Field Media" caption="Photos, clips, and highlights are labeled MyD1 Field Media until reviewed." />
              <form action={submitOperatorMedia} className="grid gap-3">
                <Field name="title" label="Title" placeholder="Third-quarter touchdown clip" required />
                <SelectField name="mediaType" label="Media Type" options={[{ label: "Field Photo", value: "field_photo" }, { label: "Short-form Clip", value: "short_clip" }, { label: "Highlight Video", value: "highlight_video" }]} />
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Media File</span>
                  <input className="rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-semibold text-[#0A1A3F]" name="mediaFile" type="file" />
                </label>
                <SelectField name="attachedToType" label="Attach To" options={[{ label: "Athlete", value: "athlete" }, { label: "Team", value: "team" }, { label: "Game", value: "game" }, { label: "School", value: "school" }]} />
                <Field name="attachedToName" label="Entity Name" placeholder="Athlete name or team name" required />
                <Field name="tags" label="Tagged Players" placeholder="Athlete name, jersey number, position" />
                <SelectField name="visibility" label="Visibility" options={[{ label: "Private", value: "private" }, { label: "Recruiters Only", value: "recruiters_only" }, { label: "Public", value: "public" }]} />
                <Button variant="primary"><Camera size={17} /> Queue Media</Button>
              </form>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle title="Add Game Notes" caption="Notes can later create timeline events after approval." />
              <form action={submitOperatorFieldNote} className="grid gap-3">
                <Field name="subject" label="Subject" placeholder="Sideline note" required />
                <Field name="relatedEntity" label="Related Athlete / Team / Game" placeholder="Athlete, team, or game name" required />
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Note</span>
                  <textarea className="min-h-28 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]" name="note" placeholder="Field coverage context, play detail, or publication note" required />
                </label>
                <Button variant="secondary"><NotebookPen size={17} /> Queue Note</Button>
              </form>
            </Card>

            <Card>
              <SectionTitle title="Add Unofficial Stats" caption="Operator stats are never Coach Verified until a coach verifies them later." />
              <form action={submitOperatorStatReport} className="grid gap-3">
                <Field name="playerName" label="Player" placeholder="Athlete name" required />
                <Field name="gameName" label="Game" placeholder="Falcons vs Tigers" required />
                <Field name="metric" label="Metric" placeholder="Passing yards" required />
                <Field name="statValue" label="Value" placeholder="248" required />
                <Field name="note" label="Context" placeholder="Observed from field coverage, pending review" />
                <Button variant="cta"><ClipboardList size={17} /> Queue Stat Report</Button>
              </form>
            </Card>
          </div>
        </div>

        <div className="grid h-fit gap-6">
          <div className="grid gap-4">
            <StatCard label="Review Queue" value={`${state.pendingReviewCount}`} detail="Operator submissions pending admin review." icon={ShieldCheck} tone="yellow" />
            <StatCard label="Media" value={`${state.media.length}`} detail="Uploaded as MyD1 Field Media." icon={Film} />
            <StatCard label="Stats" value={`${state.stats.length}`} detail="Field Reported / Pending Review." icon={ClipboardList} tone="yellow" />
          </div>
          <Card>
            <SectionTitle title="Review Queue" caption="Approve, reject, or request edits. Approved items can publish to public profiles, games, teams, or timeline." />
            {state.reviewQueue.length ? (
              <div className="grid gap-3">
                {state.reviewQueue.slice(0, 12).map((item) => (
                  <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-[#0A1A3F]">{item.title}</div>
                        <div className="mt-1 text-xs font-semibold text-[#66718F]">{item.sourceLabel} - {item.itemType}</div>
                      </div>
                      <Badge tone="yellow">Pending Review</Badge>
                    </div>
                    <form action={recordOperatorReviewDecision} className="mt-3 flex flex-wrap gap-2">
                      <input name="itemId" type="hidden" value={item.itemId} />
                      <input name="itemType" type="hidden" value={item.itemType} />
                      <input name="publishedTo" type="hidden" value="athlete_public_profile" />
                      <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#1B3FA0] px-3 py-2 text-xs font-black text-white" name="action" type="submit" value="approve"><CheckCircle2 size={15} /> Approve</button>
                      <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-xs font-black text-[#0A1A3F]" name="action" type="submit" value="request_edit">Request Edit</button>
                      <button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-xs font-black text-[#B42318]" name="action" type="submit" value="reject">Reject</button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No operator submissions are pending review.</p>
            )}
          </Card>
          <Card>
            <SectionTitle title="Source Labels" />
            <ObjectList
              items={[
                { title: "Public Record", detail: "Imported from public athletics sources.", icon: ShieldCheck, tone: "green" },
                { title: "Athlete Uploaded", detail: "Submitted by athlete account.", icon: Camera, tone: "blue" },
                { title: "Coach Verified", detail: "Reviewed and verified by coach.", icon: CheckCircle2, tone: "green" },
                { title: "MyD1 Field Media", detail: "Captured or uploaded by MyD1 operator/media team.", icon: Film, tone: "blue" },
                { title: "Field Reported / Pending Review", detail: "Observed unofficially and waiting for admin/coach review.", icon: ClipboardList, tone: "yellow" },
                { title: "Admin Approved", detail: "Approved for publication after review.", icon: ShieldCheck, tone: "green" }
              ]}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
