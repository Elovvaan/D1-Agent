import { ArrowRight, CheckCircle2, GraduationCap, Link2, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard, Timeline } from "@/components/design-system";
import {
  completeAthleteOnboarding,
  recordAthleteBrandLinks,
  recordAthleteProfileCompletion,
  recordAthleteSignup,
  recordCoachInvite,
  recordGuardianConsent,
  recordManualUnmatchedProfile,
  recordPublicPlayerClaim,
  recordSchoolTeamSport
} from "@/app/actions/athlete-onboarding-actions";
import { getAthleteOnboardingData } from "@/lib/data/onboarding";

const inputClass = "min-h-11 rounded-xl border border-[#C7CDD6] bg-white px-3 text-sm font-semibold text-[#0A1A3F] outline-none";

export default async function AthleteOnboardingPage() {
  const data = await getAthleteOnboardingData();
  const { athlete, brand, importedMatches, importedPlayers, hasImportedRecords, steps } = data;
  const primaryMatch = importedMatches[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Athlete onboarding"
        title="Set up your MyD1 profile"
        description="Create the athlete account, claim public roster data when available, complete profile essentials, connect brand links, invite coach verification, and handle guardian consent for minors."
        action={<Button href={`/athletes/${athlete.id}`} variant="secondary">Preview Public Profile</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="Onboarding Status" action={<Badge tone={hasImportedRecords ? "green" : "yellow"}>{hasImportedRecords ? "Public records available" : "Manual fallback available"}</Badge>} />
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Imported Players" value={`${importedPlayers.length}`} detail="Searchable public roster records." icon={Search} />
              <StatCard label="Suggested Matches" value={`${importedMatches.length}`} detail="Best available public profile matches." icon={UserCheck} tone="yellow" />
              <StatCard label="Profile" value={`${athlete.completionPct}%`} detail="Ready to complete and publish." icon={GraduationCap} tone="green" />
              <StatCard label="Minor Consent" value={athlete.isMinor ? "Required" : "Not required"} detail="Guardian approval gates contact." icon={ShieldCheck} tone="blue" />
            </div>
          </Card>

          <Card>
            <SectionTitle title="1. Sign-up path for athlete" />
            <form action={recordAthleteSignup} className="grid gap-3 md:grid-cols-3">
              <input className={inputClass} name="fullName" defaultValue={athlete.fullName} aria-label="Athlete full name" />
              <input className={inputClass} name="email" defaultValue="jayden@d1agent.test" aria-label="Athlete email" />
              <input className={inputClass} name="classYear" defaultValue={`${athlete.classYear}`} aria-label="Class year" />
              <select className={inputClass} name="educationLevel" defaultValue="Grade 11" aria-label="Education level">
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
                <option>College</option>
                <option>Elite/Professional</option>
              </select>
              <select className={inputClass} name="progressionOverride" defaultValue="" aria-label="Manual progression override">
                <option value="">Auto assign progression</option>
                <option value="A1">A1 Foundation</option>
                <option value="B1">B1 Recruit</option>
                <option value="C1">C1 College</option>
                <option value="D1">D1 Elite</option>
              </select>
              <Button variant="primary"><CheckCircle2 size={16} /> Save Sign-up</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="2. Select school / team / sport" caption="Imported school/team options appear first; manual entry remains available." />
            <form action={recordSchoolTeamSport} className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} name="schoolName" defaultValue={data.schoolOptions[0]} aria-label="School name" />
              <input className={inputClass} name="teamName" defaultValue={data.teamOptions[0]} aria-label="Team name" />
              <input className={inputClass} name="sport" defaultValue={athlete.sport} aria-label="Sport" />
              <input className={inputClass} name="position" defaultValue={athlete.primaryPosition} aria-label="Position" />
              <Button variant="primary" className="md:col-span-2"><GraduationCap size={16} /> Save School / Team / Sport</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle
              title="3. Search imported public roster records"
              caption={hasImportedRecords ? "Claim a real imported public player record or continue manually if none match." : "No imported record exists; manual creation is labeled unmatched."}
              action={<Badge tone={hasImportedRecords ? "green" : "yellow"}>{hasImportedRecords ? "Imported data ready" : "Unmatched public profile"}</Badge>}
            />
            {hasImportedRecords ? (
              <div className="grid gap-4">
                {(importedMatches.length ? importedMatches : importedPlayers.slice(0, 5)).map((player) => (
                  <article className="rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5" key={player.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="silver">#{player.jerseyNumber ?? "N/A"}</Badge>
                          {player.position ? <Badge>{player.position}</Badge> : null}
                          <Badge tone="yellow">Imported public record</Badge>
                        </div>
                        <h2 className="mt-3 text-xl font-black text-[#0A1A3F]">{player.name}</h2>
                        <p className="mt-2 text-sm font-semibold text-[#66718F]">{[player.classYear, player.height, player.weight, player.hometown].filter(Boolean).join(" - ") || "Public roster fields imported with source attribution."}</p>
                        <p className="mt-2 truncate text-xs font-medium text-[#66718F]">{player.sourceUrl}</p>
                      </div>
                      <form action={recordPublicPlayerClaim}>
                        <input name="importedPlayerId" type="hidden" value={player.id} />
                        <input name="playerName" type="hidden" value={player.name} />
                        <input name="sourceUrl" type="hidden" value={player.sourceUrl} />
                        <input name="matchStatus" type="hidden" value="matched public profile" />
                        <Button variant="cta"><UserCheck size={16} /> Claim Public Profile</Button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            <form action={recordManualUnmatchedProfile} className="mt-5 grid gap-3 rounded-[18px] border border-[#DDE3EC] bg-[#FAFBFD] p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Badge tone="yellow">Unmatched public profile</Badge>
              </div>
              <input className={inputClass} name="fullName" defaultValue={athlete.fullName} aria-label="Manual full name" />
              <input className={inputClass} name="schoolName" defaultValue={athlete.schoolName} aria-label="Manual school" />
              <input className={inputClass} name="sport" defaultValue={athlete.sport} aria-label="Manual sport" />
              <input className={inputClass} name="position" defaultValue={athlete.primaryPosition} aria-label="Manual position" />
              <Button variant="secondary" className="md:col-span-2">Create Manual Unmatched Profile</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="4. Complete athlete profile" />
            <form action={recordAthleteProfileCompletion} className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} name="bio" defaultValue={athlete.bio} aria-label="Athlete bio" />
              <input className={inputClass} name="hometown" defaultValue={athlete.hometown} aria-label="Hometown" />
              <input className={inputClass} name="heightWeight" defaultValue={"6'1, 184 lb"} aria-label="Height and weight" />
              <input className={inputClass} name="gpa" defaultValue="3.72" aria-label="GPA" />
              <Button variant="primary" className="md:col-span-2"><CheckCircle2 size={16} /> Save Profile Details</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="5. Connect Athlete Brand links" />
            <form action={recordAthleteBrandLinks} className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} name="instagram" defaultValue={brand.handles.instagram} aria-label="Instagram" />
              <input className={inputClass} name="tiktok" defaultValue={brand.handles.tiktok} aria-label="TikTok" />
              <input className={inputClass} name="youtube" defaultValue={brand.handles.youtube} aria-label="YouTube" />
              <input className={inputClass} name="hudl" defaultValue={brand.handles.hudl} aria-label="Hudl" />
              <input className={inputClass} name="website" defaultValue={brand.handles.website} aria-label="Website" />
              <Button variant="primary" className="md:col-span-2"><Link2 size={16} /> Save Brand Links</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="6. Invite coach for verification" caption="Coach verification is required before imported or self-reported fields can raise Trust Score." />
            <form action={recordCoachInvite} className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} name="coachName" defaultValue="Coach Marcus Davis" aria-label="Coach name" />
              <input className={inputClass} name="coachEmail" defaultValue="coach.davis@d1agent.test" aria-label="Coach email" />
              <Button variant="cta" className="md:col-span-2"><Users size={16} /> Invite Coach Verification</Button>
            </form>
          </Card>

          <Card>
            <SectionTitle title="7. Parent / guardian consent" caption="Required for minors before external outreach or contact routing can leave D1 approval." />
            <form action={recordGuardianConsent} className="grid gap-3 md:grid-cols-3">
              <input name="athleteIsMinor" type="hidden" value={String(athlete.isMinor)} />
              <input className={inputClass} name="guardianName" defaultValue="Parent / Guardian" aria-label="Guardian name" />
              <input className={inputClass} name="guardianEmail" defaultValue="guardian@d1agent.test" aria-label="Guardian email" />
              <Button variant={athlete.isMinor ? "cta" : "secondary"}><ShieldCheck size={16} /> {athlete.isMinor ? "Request Consent" : "Store Consent Status"}</Button>
            </form>
          </Card>
        </div>

        <div className="grid h-fit gap-6">
          <Card>
            <SectionTitle title="Onboarding Plan" />
            <Timeline
              items={steps.map((step, index) => ({
                title: step.title,
                detail: step.detail,
                state: index < 2 ? "done" : index === 2 ? "active" : "queued",
                meta: index < 2 ? "Ready" : index === 2 ? "Now" : "Next"
              }))}
            />
          </Card>
          <Card>
            <SectionTitle title="Selected Public Record" />
            <ObjectList
              items={[
                {
                  title: primaryMatch?.name ?? athlete.fullName,
                  detail: primaryMatch ? `${primaryMatch.position ?? athlete.primaryPosition} - imported public roster match` : "Manual athlete profile creation",
                  badge: primaryMatch ? "Matched" : "Unmatched",
                  icon: UserCheck,
                  tone: primaryMatch ? "green" : "yellow"
                },
                {
                  title: "Safety routing",
                  detail: athlete.isMinor ? "Guardian consent required for contact and outreach." : "Contact routes through D1 inbox.",
                  badge: athlete.isMinor ? "Minor" : "D1 Inbox",
                  icon: ShieldCheck,
                  tone: athlete.isMinor ? "yellow" : "green"
                }
              ]}
            />
          </Card>
          <Card>
            <SectionTitle title="Complete Setup" caption="After completion, review the public profile and continue into Command Center." />
            <form action={completeAthleteOnboarding} className="grid gap-3">
              <input name="athleteId" type="hidden" value={athlete.id} />
              <Button variant="cta"><ArrowRight size={16} /> Finish and Preview Public Profile</Button>
              <Button href="/" variant="secondary">Go to Command Center</Button>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
