import { BookOpen, ExternalLink, GraduationCap, MapPin, Ruler, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  saveBrandLinks,
  saveHeroBackgroundVideo,
  saveHeroPlayerPhoto,
  saveProfileDetails,
  saveProfileVisibility,
  savePublicProfileIntake
} from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, ProgressBar, SectionTitle, StatCard } from "@/components/design-system";
import { ProfilePictureForm } from "@/components/profile-picture-form";
import { PublicProfileShareControls } from "@/components/public-profile-share";
import { getAthleteHeroMedia, getAthleteProfile, getBrandProfile, getPublicProfileIntake, getStats, toTitle } from "@/lib/data/services";
import { brandConfig, publicProfileUrl as buildPublicProfileUrl } from "@/lib/domain-config";

function readUserState<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName);
    if (!existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

const statusCopy: Record<string, string> = {
  "profile-saved": "Profile updates saved and reflected across the app.",
  "profile-error": "Profile updates could not be saved. Please try again.",
  "profile-picture-updated": "Profile picture uploaded and updated across the app.",
  "transcript-uploaded": "Transcript uploaded and attached to your verification profile.",
  "transcript-error": "Transcript could not be uploaded. Choose a file and try again.",
  "brand-links-saved": "Athlete Brand links saved and updated across the app.",
  "brand-links-error": "Athlete Brand links could not be saved. Please try again.",
  "visibility-saved": "Public profile visibility saved.",
  "visibility-error": "Public profile visibility could not be saved. Please try again.",
  "hero-player-photo-saved": "Hero player photo saved and applied to your Command Center.",
  "hero-player-photo-error": "Hero player photo could not be saved. Choose an image under 5 MB.",
  "hero-background-video-saved": "Hero background video saved and applied to your Command Center.",
  "hero-background-video-error": "Hero background video could not be saved. Choose a video under 50 MB.",
  "public-profile-intake-saved": "Public Profile intake saved and updated across the app.",
  "public-profile-intake-error": "Public Profile intake could not be saved. Please try again."
};

const brandFields = [
  { key: "instagram", label: "Instagram handle or URL", placeholder: "@athlete or https://instagram.com/athlete" },
  { key: "tiktok", label: "TikTok handle or URL", placeholder: "@athlete or https://tiktok.com/@athlete" },
  { key: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/@athlete" },
  { key: "hudl", label: "Hudl URL", placeholder: "https://hudl.com/profile/..." },
  { key: "x", label: "X URL", placeholder: "https://x.com/athlete" },
  { key: "website", label: "Personal recruiting website URL", placeholder: "https://athlete.com" }
] as const;

function brandLinkUrl(platform: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  const platformBase: Record<string, string> = {
    instagram: "https://instagram.com/",
    tiktok: "https://www.tiktok.com/@",
    x: "https://x.com/"
  };

  return platformBase[platform] ? `${platformBase[platform]}${handle}` : `https://${trimmed}`;
}

export default async function ProfilePage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const savedProfile = readUserState<{
    fullName?: string;
    sport?: string;
    primaryPosition?: string;
    secondaryPosition?: string;
    jerseyNumber?: string;
    schoolName?: string;
    classYear?: number;
    hometown?: string;
    bio?: string;
    avatarUrl?: string;
  }>("profile.json", {});
  const athlete = { ...getAthleteProfile(), ...savedProfile };
  const publicProfileUrl = `/athletes/${athlete.id}`;
  const publicProfileShareUrl = buildPublicProfileUrl(publicProfileUrl);
  const intake = getPublicProfileIntake();
  const heroMedia = getAthleteHeroMedia();
  const stats = getStats();
  const brand = getBrandProfile();
  const visibilityOptions = [
    { label: "Public", value: "public", detail: "Visible to visitors with the public profile link." },
    { label: "Recruiters Only", value: "recruiters_only", detail: "Visible only inside recruiter access flows." },
    { label: "Private", value: "private", detail: "Hidden from public discovery and sharing." }
  ];
  const height = stats.find((stat) => stat.metric === "Height / Weight");
  const forty = stats.find((stat) => stat.metric === "Forty Yard");
  const gpa = stats.find((stat) => stat.metric === "GPA");
  const initials = athlete.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiting profile"
        title={athlete.fullName}
        description="A polished, recruiter-ready profile with academics, measurables, visibility controls, coach verification, and profile-grade media."
        action={<Button href={publicProfileUrl} variant="primary">View Public Profile</Button>}
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
          <Card>
            <SectionTitle title="Profile Picture" caption="Uploads update the sidebar, top bar, and profile surfaces immediately." />
            <ProfilePictureForm athleteName={athlete.fullName} currentAvatarUrl={savedProfile.avatarUrl} initials={initials} />
            <div className="mt-6 grid gap-4 border-t border-[#E4E9F1] pt-5 xl:grid-cols-2">
              <form action={saveHeroPlayerPhoto} className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
                <div>
                  <div className="text-sm font-black text-[#0A1A3F]">Hero Player Photo</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Transparent PNG or cutout image preferred.</p>
                </div>
                {heroMedia.playerCutoutUrl ? (
                  <img src={heroMedia.playerCutoutUrl} alt={`${athlete.fullName} Command Center cutout`} className="h-32 w-fit rounded-xl object-contain" />
                ) : (
                  <div className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2 text-xs font-semibold text-[#66718F]">No player photo uploaded.</div>
                )}
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="heroPlayerPhoto" type="file" accept="image/*" required />
                <Button variant="secondary" className="w-fit">Upload Player Photo</Button>
              </form>
              <form action={saveHeroBackgroundVideo} className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
                <div>
                  <div className="text-sm font-black text-[#0A1A3F]">Hero Background Video</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Defaults to latest published highlight when empty.</p>
                </div>
                {heroMedia.videoUrl ? (
                  <a className="text-sm font-black text-[#1B3FA0]" href={heroMedia.videoUrl} rel="noreferrer" target="_blank">Current hero video: {heroMedia.title}</a>
                ) : (
                  <div className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2 text-xs font-semibold text-[#66718F]">No hero video selected.</div>
                )}
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="heroBackgroundTitle" placeholder="Featured highlight title" />
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="heroBackgroundVideo" type="file" accept="video/*" required />
                <Button variant="secondary" className="w-fit">Upload Hero Video</Button>
              </form>
            </div>
          </Card>
          <Card>
            <SectionTitle title="Profile Overview" caption="Recruiters see verified fields first. Private contact fields remain gated." />
            <div className="mb-5 flex flex-wrap gap-3">
              <Button href={publicProfileUrl} variant="primary">View Public Profile</Button>
              <Button href={`${publicProfileUrl}?preview=recruiter`} variant="secondary">Preview as Recruiter</Button>
              <PublicProfileShareControls profileUrl={publicProfileShareUrl} title={`${athlete.fullName} public athlete profile on ${brandConfig.primaryBrand}`} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Completion" value={`${athlete.completionPct}%`} detail="Transcript and second coach connection remain." icon={UserRound} />
              <StatCard label="Class Year" value={`${athlete.classYear}`} detail={`${athlete.sport} recruiting profile.`} icon={GraduationCap} tone="yellow" />
              <StatCard label="Visibility" value={toTitle(athlete.visibility)} detail="Public contact exposure remains gated." icon={ShieldCheck} tone="green" />
            </div>
            <div className="mt-6">
              <ProgressBar value={athlete.completionPct} />
            </div>
            <form action={saveProfileVisibility} className="mt-6 grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <input name="athleteId" type="hidden" value={athlete.id} />
              <input name="currentVisibility" type="hidden" value={athlete.visibility} />
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Public profile visibility
                <select className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="visibility" defaultValue={athlete.visibility}>
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <p className="text-xs font-semibold leading-5 text-[#66718F]">
                {visibilityOptions.find((option) => option.value === athlete.visibility)?.detail ?? "Controls how recruiters and visitors can view this profile."}
              </p>
              <Button variant="secondary" className="w-fit">Save Visibility</Button>
            </form>
          </Card>
          <Card>
            <SectionTitle title="Bio and Positioning" />
            <form action={saveProfileDetails} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Athlete name
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="fullName" defaultValue={String(athlete.fullName)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  School / team
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="schoolName" defaultValue={String(athlete.schoolName)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Sport
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="sport" defaultValue={String(athlete.sport)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Class year
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="classYear" type="number" defaultValue={Number(athlete.classYear)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Primary position
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="primaryPosition" defaultValue={String(athlete.primaryPosition)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Secondary position
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="secondaryPosition" defaultValue={String(athlete.secondaryPosition ?? "")} />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Jersey number
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="jerseyNumber" defaultValue={String(athlete.jerseyNumber)} required />
                </label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                  Hometown
                  <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="hometown" defaultValue={String(athlete.hometown)} required />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Bio
                <textarea className="min-h-32 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="bio" defaultValue={String(athlete.bio)} required />
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge>{athlete.primaryPosition}</Badge>
                {athlete.secondaryPosition ? <Badge tone="yellow">{athlete.secondaryPosition}</Badge> : null}
                {athlete.varsityStarter ? <Badge tone="green">Varsity starter</Badge> : null}
                <Badge tone="silver">{athlete.hometown}</Badge>
              </div>
              <Button variant="primary" className="w-fit">Save Profile Updates</Button>
            </form>
          </Card>
          <Card>
            <SectionTitle title="Measurables and Academics" />
            <form action={savePublicProfileIntake} className="mb-5 grid gap-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Height<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="height" defaultValue={intake.measurables?.height ?? ""} placeholder="6'1" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Weight<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="weight" defaultValue={intake.measurables?.weight ?? ""} placeholder="184 lb" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Wingspan<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="wingspan" defaultValue={intake.measurables?.wingspan ?? ""} placeholder="74 in" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Forty-yard dash<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="fortyYardDash" defaultValue={intake.measurables?.fortyYardDash ?? ""} placeholder="4.48" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Vertical jump<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="verticalJump" defaultValue={intake.measurables?.verticalJump ?? ""} placeholder="34 in" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Bench press<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="benchPress" defaultValue={intake.measurables?.benchPress ?? ""} placeholder="225 x 8" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F] md:col-span-2 xl:col-span-3">Sport-specific metrics<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="sportSpecificMetrics" defaultValue={intake.measurables?.sportSpecificMetrics ?? ""} placeholder="QB rating, completion %, sprint splits..." /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">GPA<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="gpa" defaultValue={intake.academics?.gpa ?? ""} placeholder="3.72" /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">SAT score<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="satScore" defaultValue={intake.academics?.satScore ?? ""} /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">ACT score<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="actScore" defaultValue={intake.academics?.actScore ?? ""} /></label>
                <label className="grid gap-2 text-sm font-black text-[#0A1A3F] md:col-span-2 xl:col-span-3">Academic eligibility notes<textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="academicEligibilityNotes" defaultValue={intake.academics?.academicEligibilityNotes ?? ""} /></label>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone="silver">Manual entries start as Self-reported</Badge>
                <Button variant="primary">Save Public Profile Intake</Button>
              </div>
            </form>
            <ObjectList
              items={[
                { title: "Height / Weight", detail: height?.displayValue ?? "Pending", value: height?.verified ? "Verified" : "Pending", icon: Ruler, tone: "green" },
                { title: "Forty Yard", detail: "Self-reported measurable", value: forty?.displayValue ?? "Pending", icon: Ruler, tone: "yellow" },
                { title: "GPA", detail: "Core academic profile, transcript pending", value: gpa?.displayValue ?? "Pending", icon: BookOpen, tone: "blue" },
                { title: "Hometown", detail: athlete.hometown, value: athlete.hometown.split(", ")[1] ?? "CO", icon: MapPin, tone: "silver" }
              ]}
            />
          </Card>
          <Card>
            <SectionTitle title="Athlete Brand" caption="Social, film, and profile signals the Agent uses to strengthen recruiting momentum." />
            <form action={saveBrandLinks} className="mb-5 grid gap-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {brandFields.map((field) => (
                  <label className="grid gap-2 text-sm font-black text-[#0A1A3F]" key={field.key}>
                    {field.label}
                    <input
                      className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold"
                      name={field.key}
                      defaultValue={brand.handles[field.key]}
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
              <Button variant="primary" className="w-fit">Save Brand Links</Button>
            </form>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Followers" value={brand.metrics.followers.toLocaleString()} detail="Across connected brand channels." icon={UserRound} />
              <StatCard label="Weekly Reach" value={brand.metrics.weeklyReach.toLocaleString()} detail="Recent distribution across latest posts." icon={ExternalLink} tone="green" />
              <StatCard label="Engagement" value={`${brand.metrics.engagementRate}%`} detail="Weighted latest-post engagement." icon={Sparkles} tone="yellow" />
              <StatCard label="Profile Clicks" value={`${brand.metrics.profileClicks}`} detail="Tracked recruiting-intent clicks." icon={ShieldCheck} tone="blue" />
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="grid gap-3">
                {Object.entries(brand.handles).map(([platform, handle]) => {
                  const url = brandLinkUrl(platform, handle);
                  return (
                    <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={platform}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-[#0A1A3F]">{toTitle(platform)}</div>
                          <div className="mt-1 break-all text-xs font-semibold text-[#66718F]">{handle || "Not connected"}</div>
                        </div>
                        <Badge tone={url ? (platform === "hudl" ? "yellow" : "blue") : "silver"}>{url ? "Connected" : "Not connected"}</Badge>
                      </div>
                      {url ? (
                        <a className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#1B3FA0]" href={url} rel="noreferrer" target="_blank">
                          Open <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {brand.latestPosts.length ? (
                <ObjectList
                  items={brand.latestPosts.map((post) => ({
                    title: post.title,
                    detail: `${toTitle(post.platform)} - ${post.impressions.toLocaleString()} impressions - ${post.engagementRate}% engagement`,
                    badge: `${post.engagements}`,
                    icon: Sparkles,
                    tone: post.engagementRate >= 8 ? "green" : "yellow"
                  }))}
                />
              ) : (
                <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold leading-6 text-[#66718F]">
                  Latest posts appear after connected platforms provide activity data.
                </div>
              )}
            </div>
            <div className="mt-5 grid gap-3">
              {brand.agentRecommendations.map((recommendation) => (
                <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold leading-6 text-[#17223F]" key={recommendation}>
                  {recommendation}
                </div>
              ))}
            </div>
          </Card>
      </div>
    </AppShell>
  );
}
