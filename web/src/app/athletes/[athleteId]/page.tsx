import type { Metadata } from "next";
import { ExternalLink, Film, Mail, PlayCircle, Search, ShieldCheck, Sparkles, Trophy, UserCheck } from "lucide-react";
import { recordRecruiterInterest, recordVisibilityControl } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, SectionTitle, StatCard } from "@/components/design-system";
import { PublicProfileShareControls } from "@/components/public-profile-share";
import { getApprovedMediaPartnerPublicMedia } from "@/lib/data/media-partner";
import { defaultAthleteId, getPublicAthleteHomepage, getPublicProfileIntake, getSupportingDocuments, searchPublicDirectory, toTitle } from "@/lib/data/services";
import { brandConfig, getPublicProfileBaseUrl, publicProfileUrl } from "@/lib/domain-config";

export function generateStaticParams() {
  return [{ athleteId: defaultAthleteId }];
}

export async function generateMetadata({ params }: { params: Promise<{ athleteId: string }> }): Promise<Metadata> {
  const { athleteId } = await params;
  let data: ReturnType<typeof getPublicAthleteHomepage>;

  try {
    data = getPublicAthleteHomepage(athleteId);
  } catch {
    return {};
  }

  const { athlete, heroMedia } = data;
  const title = `${athlete.fullName} | ${athlete.sport} ${athlete.primaryPosition} | ${brandConfig.primaryBrand}`;
  const description = `${athlete.fullName}, ${athlete.primaryPosition}${athlete.jerseyNumber ? ` #${athlete.jerseyNumber}` : ""}, Class of ${athlete.classYear} at ${athlete.schoolName}.`;
  const previewImage = heroMedia.posterUrl ?? heroMedia.thumbnailUrl;
  const canonicalUrl = publicProfileUrl(`/athletes/${athlete.id}`);
  const absolutePreviewImage = previewImage ? new URL(previewImage, `${getPublicProfileBaseUrl()}/`).toString() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      siteName: brandConfig.primaryBrand,
      type: "profile",
      url: canonicalUrl,
      images: absolutePreviewImage ? [{ url: absolutePreviewImage, alt: `${athlete.fullName} highlight preview` }] : undefined
    },
    twitter: {
      card: absolutePreviewImage ? "summary_large_image" : "summary",
      title,
      description,
      images: absolutePreviewImage ? [absolutePreviewImage] : undefined
    }
  };
}

const publicProfileActionClasses =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_10px_24px_rgba(242,194,0,0.25)] transition hover:brightness-95";

const statusMessages: Record<string, string> = {
  "interest-sent": "Interest request sent through D1 inbox. Guardian approval is required when applicable.",
  "visibility-saved": "Public profile visibility updated.",
  "no-media": "Highlight media has not been uploaded yet."
};

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

export default async function PublicAthletePage({
  params,
  searchParams
}: {
  params: Promise<{ athleteId: string }>;
  searchParams?: Promise<{ status?: string; q?: string; preview?: string }>;
}) {
  const { athleteId } = await params;
  const queryParams = searchParams ? await searchParams : {};
  let data: ReturnType<typeof getPublicAthleteHomepage>;

  try {
    data = getPublicAthleteHomepage(athleteId);
  } catch {
    return (
      <AppShell>
        <Card>
          <SectionTitle title="Public Profile Setup Needed" caption="This athlete does not have a public profile connected yet." />
          <p className="text-sm font-semibold leading-6 text-[#66718F]">Use the Profile page to complete the athlete profile before sharing a public link.</p>
          <div className="mt-5">
            <Button href="/profile" variant="primary">Go to Profile Setup</Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const { athlete, heroMedia, trustScore, opportunityScore, stats, highlights, matches, brandProfile } = data;
  const query = (queryParams.q ?? "").trim();
  const status = queryParams.status ?? "";
  const isRecruiterPreview = queryParams.preview === "recruiter";
  const searchGroups = searchPublicDirectory(query);
  const intake = getPublicProfileIntake();
  const documents = getSupportingDocuments();
  const topHighlights = highlights.slice(0, 4);
  const approvedPartnerMedia = getApprovedMediaPartnerPublicMedia(athlete.id);
  const publicStats = stats.filter((stat) => stat.source === "public_record");
  const publicProfilePath = `/athletes/${athlete.id}`;
  const publicProfileShareUrl = publicProfileUrl(publicProfilePath);
  const isPrivate = athlete.visibility === "private";
  const highlightHref = heroMedia.videoUrl ?? heroMedia.thumbnailUrl ?? `${publicProfilePath}?status=no-media`;
  const visibilityOptions = [
    { label: "Public", value: "public", detail: "Visible to visitors with the profile link." },
    { label: "Recruiters Only", value: "recruiters_only", detail: "Visible only inside recruiter access flows." },
    { label: "Private", value: "private", detail: "Hidden from public discovery and sharing." }
  ];
  const searchPanel = (
    <Card className="mb-6">
      <form action={publicProfilePath} className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="athlete-public-search">Search the MyD1 sports directory</label>
        <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
          <Search size={17} className="text-[#66718F]" />
          <input
            className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]"
            defaultValue={query}
            id="athlete-public-search"
            name="q"
            placeholder="Search athletes, schools, teams, games, coaches, and stats"
            type="search"
          />
        </div>
        <Button variant="primary">Search</Button>
      </form>
      {query ? (
        <div className="mt-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
          {searchGroups.length ? (
            <div className="grid gap-5">
              {searchGroups.map((group) => (
                <div className="grid gap-3" key={group.group}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#0A1A3F]">{group.group}</h2>
                    <Badge tone="silver">{group.results.length}</Badge>
                  </div>
                  {group.results.map((result) => (
                    <a
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-4 transition hover:border-[#1B3FA0] sm:flex-row sm:items-center"
                      href={result.href}
                      key={`${group.group}-${result.id}`}
                    >
                      <span>
                        <span className="block text-sm font-black text-[#0A1A3F]">{result.title}</span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-[#66718F]">{result.detail}</span>
                      </span>
                      <span className="flex shrink-0 flex-wrap gap-2">
                        <Badge tone="blue">{result.typeLabel}</Badge>
                        <Badge tone={result.sourceLabel === "Public Record" ? "green" : "yellow"}>{result.sourceLabel}</Badge>
                      </span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-black text-[#66718F]">No results found.</p>
          )}
        </div>
      ) : null}
    </Card>
  );
  const statusBanner = statusMessages[status] || isRecruiterPreview ? (
    <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
      {statusMessages[status] ?? "Previewing this public profile as a recruiter-safe view. Private contact information remains hidden."}
    </div>
  ) : null;
  const visibilityControlCard = (
    <Card>
      <SectionTitle title="Public Visibility" caption="Owner controls for how this homepage is exposed." />
      <div className="grid gap-2">
        {visibilityOptions.map((option) => (
          <form action={recordVisibilityControl} key={option.value}>
            <input name="athleteId" type="hidden" value={athlete.id} />
            <input name="visibility" type="hidden" value={option.value} />
            <input name="currentVisibility" type="hidden" value={athlete.visibility} />
            <button className="w-full rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-left transition hover:bg-[#F7F9FC]" type="submit">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black text-[#0A1A3F]">{option.label}</span>
                <Badge tone={athlete.visibility === option.value ? "green" : "silver"}>{athlete.visibility === option.value ? "Active" : "Set"}</Badge>
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">{option.detail}</p>
            </button>
          </form>
        ))}
      </div>
    </Card>
  );
  const sourceLabel = (source: string) =>
    ({
      self: "Self-reported",
      ai_extracted: "Multi-source verified",
      coach_verified: "Coach verified",
      external: "Public record",
      public_record: "Public Record",
      multi_source: "Multi-source verified"
    })[source] ?? source;

  if (isPrivate) {
    return (
      <AppShell>
        {searchPanel}
        {statusBanner}
        <Card>
          <SectionTitle title="Private Public Profile" caption="This athlete has set their public profile visibility to Private." />
          <p className="text-sm font-semibold leading-6 text-[#66718F]">No athlete contact details or recruiting information are exposed while this profile is private.</p>
          <div className="mt-5">
            <Button href="/profile" variant="secondary">Return to Profile</Button>
          </div>
        </Card>
        <div className="mt-6">{visibilityControlCard}</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {searchPanel}
      {statusBanner}
      <section className="relative overflow-hidden rounded-[18px] border border-[#DDE3EC] bg-[#0A1A3F] shadow-[0_18px_55px_rgba(10,26,63,0.18)]">
        <div className="absolute inset-0">
          {heroMedia.videoUrl ? (
            <video
              aria-label={`${athlete.fullName} highlight reel background`}
              autoPlay
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              poster={heroMedia.posterUrl}
            >
              <source src={heroMedia.videoUrl} />
              {heroMedia.fallbackText}
            </video>
          ) : heroMedia.thumbnailUrl ? (
            <div
              aria-label={`${athlete.fullName} latest highlight thumbnail`}
              className="h-full w-full bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${heroMedia.thumbnailUrl})` }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#0A1A3F]">
              <div className="absolute inset-0 bg-[#0A1A3F]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-[#1B3FA0]/30" />
              <div className="absolute right-8 top-8 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white">{brandConfig.primaryBrand}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-[#0A1A3F]/70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,26,63,0.92),rgba(10,26,63,0.72),rgba(10,26,63,0.25))]" />
        </div>
        {heroMedia.playerCutoutUrl ? (
          <img
            src={heroMedia.playerCutoutUrl}
            alt={`${athlete.fullName} player cutout`}
            className="absolute bottom-0 right-[360px] z-10 hidden h-[88%] max-h-[460px] object-contain object-bottom drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)] 2xl:block"
          />
        ) : null}

        <div className="relative z-10 grid min-h-[440px] content-end gap-6 p-5 sm:min-h-[500px] sm:p-6 lg:grid-cols-[1fr_360px] lg:gap-8 lg:p-8">
          <div className="max-w-4xl pb-2">
            <div className="flex flex-wrap gap-2">
              <Badge tone="yellow">Public Athlete Homepage</Badge>
              <Badge tone="green">Recruiter-ready</Badge>
              <Badge tone="blue">{athlete.progressionLabel}</Badge>
              <Badge tone="blue">{heroMedia.videoUrl ? "Highlight reel active" : heroMedia.thumbnailUrl ? "Thumbnail fallback" : "Media pending"}</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">{athlete.fullName}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-black text-[#DDE8FF]">
              <span>{athlete.sport}</span>
              <span>{athlete.primaryPosition}{athlete.secondaryPosition ? ` / ${athlete.secondaryPosition}` : ""}</span>
              {athlete.jerseyNumber ? <span>#{athlete.jerseyNumber}</span> : null}
              <span>{athlete.schoolName}</span>
              <span>Class of {athlete.classYear}</span>
            </div>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#DDE8FF]">{athlete.bio}</p>
            {!heroMedia.videoUrl && !heroMedia.thumbnailUrl ? (
              <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-black text-white">
                {heroMedia.fallbackText}
              </div>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                className={`${publicProfileActionClasses} w-full sm:w-auto`}
                href={highlightHref}
                rel={heroMedia.videoUrl || heroMedia.thumbnailUrl ? "noreferrer" : undefined}
                target={heroMedia.videoUrl || heroMedia.thumbnailUrl ? "_blank" : undefined}
              >
                <PlayCircle size={17} /> Watch Highlight Reel
              </a>
              <form action={recordRecruiterInterest}>
                <input name="athleteId" type="hidden" value={athlete.id} />
                <input name="athleteName" type="hidden" value={athlete.fullName} />
                <input name="isMinor" type="hidden" value={String(athlete.isMinor)} />
                <Button variant="secondary" className="w-full sm:w-auto"><Mail size={17} /> Contact / Express Interest</Button>
              </form>
            </div>
            <div className="mt-4">
              <PublicProfileShareControls profileUrl={publicProfileShareUrl} title={`${athlete.fullName} public athlete profile on ${brandConfig.primaryBrand}`} />
            </div>
          </div>

          <Card className="h-fit bg-white/95 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <SectionTitle title="Recruiter Snapshot" caption={heroMedia.videoUrl ? heroMedia.title : heroMedia.fallbackText} />
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#F7F9FC] p-4">
                <span className="text-sm font-black text-[#66718F]">Trust Score</span>
                <Badge tone="green">{trustScore.score} - {toTitle(trustScore.tier)}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F7F9FC] p-4">
                <span className="text-sm font-black text-[#66718F]">Opportunity Score</span>
                <Badge tone="yellow">{opportunityScore.score}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F7F9FC] p-4">
                <span className="text-sm font-black text-[#66718F]">Visibility</span>
                <Badge>{toTitle(athlete.visibility)}</Badge>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <div className="text-sm font-black text-[#0A1A3F]">Contact safety</div>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#66718F]">
                Direct phone/email is not public. Interest routes through D1 inbox{athlete.isMinor ? " and guardian approval" : ""}.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card>
            <SectionTitle title="Verified Profile" caption="The public homepage keeps recruiter-critical context close to the hero media." />
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Trust Score" value={`${trustScore.score}`} detail="Weighted verification from coach, AI, public records, and film." icon={ShieldCheck} tone="green" />
              <StatCard label="Opportunity" value={`${opportunityScore.score}`} detail="Views, matches, coach opens, and film freshness." icon={Sparkles} tone="yellow" />
              <StatCard label="Top Match" value={`${matches[0]?.matchPct ?? 0}%`} detail={matches[0]?.collegeName ?? "Matches pending"} icon={Trophy} />
            </div>
            <div className="mt-5">
              <ObjectList
                items={[
                  { title: "Height", detail: sourceLabel(stats.find((stat) => stat.metric === "Height / Weight")?.source ?? "self"), value: stats.find((stat) => stat.metric === "Height / Weight")?.displayValue.split(" / ")[0] || "Not provided", icon: UserCheck, tone: "silver" },
                  { title: "Weight", detail: sourceLabel(stats.find((stat) => stat.metric === "Height / Weight")?.source ?? "self"), value: stats.find((stat) => stat.metric === "Height / Weight")?.displayValue.split(" / ")[1] || "Not provided", icon: UserCheck, tone: "silver" },
                  { title: "GPA", detail: sourceLabel(stats.find((stat) => stat.metric === "GPA")?.source ?? "self"), value: stats.find((stat) => stat.metric === "GPA")?.displayValue || "Not provided", icon: ShieldCheck, tone: "yellow" }
                ]}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle title="Top Highlights" action={<Button href="/highlights" variant="ghost">View All</Button>} />
            <ObjectList
              items={topHighlights.map((highlight) => ({
                title: highlight.title,
                detail: `${highlight.playType} - score ${highlight.score} - ${highlight.verified ? "verified" : "pending verification"}`,
                badge: highlight.published ? "Published" : "Draft",
                icon: Film,
                tone: highlight.score >= 90 ? "yellow" : "blue"
              }))}
            />
          </Card>

          <Card>
            <SectionTitle title="Approved Media Partner Contributions" caption="Only athlete/guardian-approved partner media can appear here." />
            {approvedPartnerMedia.length ? (
              <ObjectList
                items={approvedPartnerMedia.map((item) => ({
                  title: item.title,
                  detail: `${item.sourceLabel} - ${item.uploaderOrganizationName} - ${item.licenseState.replaceAll("_", " ")}`,
                  value: item.mediaType,
                  icon: Film,
                  tone: item.sourceLabel === "Guardian Approved" ? "green" : "blue"
                }))}
              />
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#66718F]">No athlete-approved media partner contributions yet.</p>
            )}
          </Card>

          <Card>
            <SectionTitle title="Stats, Awards, and Documents" caption="Self-reported entries require uploaded evidence, public record, or coach verification before verification status changes." />
            <ObjectList
              items={[
                { title: "Season Stats", detail: "Self-reported", value: intake.athletics?.seasonStats || "Not provided", icon: Trophy, tone: "silver" },
                { title: "Game Stats", detail: "Self-reported", value: intake.athletics?.gameStats || "Not provided", icon: Film, tone: "silver" },
                { title: "Position-specific Stats", detail: "Self-reported", value: intake.athletics?.positionSpecificStats || "Not provided", icon: Sparkles, tone: "silver" },
                { title: "Awards / Honors", detail: "Self-reported", value: intake.athletics?.awardsHonors || "Not provided", icon: Trophy, tone: "yellow" },
                { title: "Supporting Documents", detail: documents.length ? "Document uploaded / pending review" : "Not connected", value: documents.length ? String(documents.length) : "0", icon: ShieldCheck, tone: documents.length ? "yellow" : "silver" }
              ]}
            />
            <div className="mt-5 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-[#0A1A3F]">Public Record Stats</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Automatically ingested public athletics stats display only after high-confidence matching.</p>
                </div>
                <Badge tone={publicStats.length ? "green" : "silver"}>{publicStats.length ? "Public Record" : "No public stats found yet"}</Badge>
              </div>
              {publicStats.length ? (
                <div className="mt-4">
                  <ObjectList
                    items={publicStats.map((stat) => ({
                      title: stat.metric,
                      detail: sourceLabel(stat.source),
                      value: stat.displayValue,
                      icon: ShieldCheck,
                      tone: "green"
                    }))}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold text-[#66718F]">No public stats found yet.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid h-fit gap-6">
          {visibilityControlCard}
          <Card>
            <SectionTitle title="Measurables" />
            <ObjectList
              items={stats.slice(0, 8).map((stat) => ({
                title: stat.metric,
                detail: sourceLabel(stat.source),
                value: stat.displayValue,
                icon: stat.verified ? UserCheck : ExternalLink,
                tone: stat.verified ? "green" : "yellow"
              }))}
            />
          </Card>
          <Card>
            <SectionTitle title="Athlete Brand" caption="Recruiter-facing social and film signals." />
            <div className="grid gap-3">
              {Object.entries(brandProfile.handles).map(([platform, handle]) => {
                const url = brandLinkUrl(platform, handle);
                return (
                  <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={platform}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-[#0A1A3F]">{toTitle(platform)}</div>
                        <div className="mt-1 break-all text-xs font-semibold text-[#66718F]">{handle || "Not connected"}</div>
                      </div>
                      <Badge tone={url ? "blue" : "silver"}>{url ? "Connected" : "Not connected"}</Badge>
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
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
