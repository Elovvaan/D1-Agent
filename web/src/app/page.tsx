import {
  ArrowRight,
  Check,
  CloudUpload,
  GraduationCap,
  MessageSquare,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card } from "@/components/design-system";
import { getAthleteHeroMedia, getCommandCenterData, toTitle } from "@/lib/data/services";

const glanceCards = [
  { title: "Upload Film", detail: "Add game or practice film", icon: CloudUpload, tone: "blue", href: "/film" },
  { title: "Highlights", detail: "9 new clips ready to review", icon: Star, tone: "yellow", href: "/highlights" },
  { title: "Recruiting", detail: "12 new college matches", icon: GraduationCap, tone: "blue", href: "/recruiting" },
  { title: "Messages", detail: "5 new messages from coaches", icon: MessageSquare, tone: "yellow", href: "/messages" },
  { title: "Trust Score", detail: "Score: 82 - keep building", icon: ShieldCheck, tone: "blue", href: "/trust" },
  { title: "Public Profile", detail: "Open your external athlete profile", icon: UserCheck, tone: "yellow", href: "/athletes/athlete-jayden-lewis" },
  { title: "Finish Onboarding", detail: "Set up profile, brand, consent, and coach verification", icon: Check, tone: "blue", href: "/onboarding/athlete" }
] as const;

export default function CommandCenterPage() {
  const data = getCommandCenterData();
  const heroMedia = getAthleteHeroMedia(data.athlete.id);
  const briefItems = [data.dailyBrief.yesterday[0], data.dailyBrief.today[0], data.dailyBrief.upcoming[0]];
  const hasHeroBackground = Boolean(heroMedia.videoUrl || heroMedia.thumbnailUrl);

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <section className="relative overflow-hidden rounded-lg border border-[#DDE3EC] bg-[#0A1A3F] px-6 py-8 shadow-[0_18px_50px_rgba(10,26,63,0.08)] lg:px-8">
            <div className="absolute inset-0">
              {heroMedia.videoUrl ? (
                <video
                  aria-label={`${data.athlete.fullName} featured highlight background`}
                  autoPlay
                  className="h-full w-full object-cover"
                  loop
                  muted
                  playsInline
                  poster={heroMedia.posterUrl}
                >
                  <source src={heroMedia.videoUrl} />
                </video>
              ) : heroMedia.thumbnailUrl ? (
                <div
                  aria-label={`${data.athlete.fullName} highlight background`}
                  className="h-full w-full bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${heroMedia.thumbnailUrl})` }}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#0A1A3F,#123B91_58%,#071634)]" />
              )}
              <div className="absolute inset-0 bg-[#0A1A3F]/72" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,26,63,0.95),rgba(10,26,63,0.74),rgba(10,26,63,0.34))]" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
                Good Morning, {data.athlete.fullName.split(" ")[0]}.
                <span className="mt-2 block text-[#F2C200]">I&apos;m your Agent.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#DDE8FF]">
                I watched your latest game, refreshed your recruiting board, and prepared the actions that move your opportunity forward today.
              </p>
              <p className="mt-3 max-w-xl text-sm font-black leading-6 text-white">
                {data.missionStatus[0]?.label}: {data.missionStatus[0]?.value} - {data.missionStatus[1]?.label}: {data.missionStatus[1]?.value}
              </p>
              {!hasHeroBackground && !heroMedia.playerCutoutUrl ? (
                <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white">
                  Upload your first highlight and player photo to personalize your Command Center.
                </div>
              ) : !heroMedia.playerCutoutUrl ? (
                <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white">
                  Upload a player photo to personalize your Command Center.
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="yellow">Agent active</Badge>
                <Badge tone="green">Coach connected</Badge>
                <Badge>Film fresh</Badge>
              </div>
            </div>
            <div className="absolute bottom-0 right-2 z-10 hidden h-[105%] w-[38%] lg:block">
              {heroMedia.playerCutoutUrl ? (
                <img
                  src={heroMedia.playerCutoutUrl}
                  alt={`${data.athlete.fullName} player cutout`}
                  className="absolute bottom-0 right-3 h-full max-h-[390px] w-full object-contain object-bottom drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <div className="absolute bottom-0 right-12 h-64 w-44">
                  <div className="absolute bottom-0 left-1/2 h-48 w-28 -translate-x-1/2 rounded-t-[80px] bg-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.32)]" />
                  <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-white/20" />
                  <div className="absolute bottom-16 left-0 h-20 w-12 rotate-[-18deg] rounded-full bg-white/12" />
                  <div className="absolute bottom-16 right-0 h-20 w-12 rotate-[18deg] rounded-full bg-white/12" />
                </div>
              )}
            </div>
          </section>

          <Card className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#111827]">Mission Status</h2>
              <span className="text-xs font-black text-[#1B3FA0]">Live recruiting loop</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.missionStatus.map((metric) => (
                <StatusMetric key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
              ))}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#111827]">Athlete Progression</h2>
                  <Badge tone="yellow">{data.athlete.progressionLabel}</Badge>
                </div>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#17223F]">
                  You are currently {data.athlete.progressionLevel}. {data.athlete.progressionDescription}
                </p>
              </div>
              <div className="min-w-[220px]">
                <div className="flex items-center justify-between text-xs font-black text-[#1B3FA0]">
                  <span>Progress toward {data.athlete.nextProgressionLevel ?? "elite mastery"}</span>
                  <span>{data.athlete.progressionPercent}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#DDE8FF]">
                  <div className="h-full rounded-full bg-[#1B3FA0]" style={{ width: `${Math.min(100, Math.max(0, data.athlete.progressionPercent))}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">At A Glance</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {glanceCards.map((card) => (
                <article className="rounded-lg border border-[#DDE3EC] bg-white p-4 shadow-[0_12px_30px_rgba(10,26,63,0.06)]" key={card.title}>
                  <div
                    className={
                      card.tone === "yellow"
                        ? "grid h-10 w-10 place-items-center rounded-lg bg-[#FFF4C2] text-[#F2B500]"
                        : "grid h-10 w-10 place-items-center rounded-lg bg-[#EAF0FF] text-[#1B3FA0]"
                    }
                  >
                    <card.icon size={21} />
                  </div>
                  <h3 className="mt-4 text-lg font-black">{card.title}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-[#17223F]">{card.detail}</p>
                  <a className="mt-4 grid h-8 w-8 place-items-center rounded-lg bg-[#0D4DD8] text-white" href={card.href} aria-label={card.title}>
                    <ArrowRight size={16} />
                  </a>
                </article>
              ))}
            </div>
          </Card>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.08em]">Today&apos;s Mission</h2>
                <span className="text-xs font-black text-[#1B3FA0]">73% complete</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#DDE8FF]">
                <div className="h-full w-[73%] rounded-full bg-[#1157E8]" />
              </div>
              <div className="mt-5 grid gap-1">
                {data.todayMission.items.map((mission) => (
                  <div className="flex items-center gap-3 border-b border-[#E8ECF3] py-3 last:border-0" key={mission.label}>
                    <span
                      className={
                        mission.state === "done"
                          ? "grid h-6 w-6 place-items-center rounded-full bg-[#25B44B] text-white"
                          : mission.state === "active"
                            ? "h-6 w-6 rounded-full border-2 border-[#F2C200]"
                            : "h-6 w-6 rounded-full border-2 border-[#AAB4C6]"
                      }
                    >
                      {mission.state === "done" ? <Check size={14} /> : null}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-black">{mission.label}</div>
                      <div className="text-xs font-medium text-[#66718F]">{mission.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button href="/onboarding/athlete" variant="cta">View Full Plan</Button>
            </Card>

            <Card>
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Agent Daily Brief</h2>
              <div className="mt-4 grid gap-3">
                {briefItems.map((item, index) => (
                  <div className="rounded-lg bg-[#F7F9FC] p-4" key={item}>
                    <div className="text-xs font-black uppercase tracking-[0.08em] text-[#1B3FA0]">
                      {index === 0 ? "Yesterday" : index === 1 ? "Today" : "Upcoming"}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#17223F]">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Opportunity Feed</h2>
              <div className="mt-4 grid gap-3">
                {data.opportunities.map((item) => (
                  <article className="rounded-lg border border-[#E1E6EF] p-4" key={item.id}>
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={item.state === "new" ? "yellow" : "silver"}>{toTitle(item.type)}</Badge>
                      <span className="text-xs font-black text-[#1B3FA0]">{Math.round(item.relevance * 100)} relevance</span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#17223F]">{item.rationale}</p>
                  </article>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Live Activity Timeline</h2>
              <div className="mt-4 grid gap-3">
                {data.timeline.map((event, index) => (
                  <div className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-[#E8ECF3] pb-3 last:border-0" key={event.id}>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF0FF] text-[#1B3FA0]">
                      {index === 0 ? <CloudUpload size={17} /> : index === 1 ? <Sparkles size={17} /> : <Play size={17} />}
                    </span>
                    <div>
                      <div className="text-sm font-black">{event.title}</div>
                      <div className="text-xs font-medium text-[#66718F]">{event.detail}</div>
                    </div>
                    <span className="text-xs font-bold text-[#66718F]">{event.meta}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        <aside className="grid h-fit gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Upcoming Events</h2>
              <a className="text-xs font-black text-[#1B3FA0]" href="/calendar">View Calendar</a>
            </div>
            <div className="mt-4 grid gap-4">
              {data.events.map((event) => (
                <div className="grid grid-cols-[58px_1fr_auto] items-center gap-4 border-b border-[#E8ECF3] pb-4 last:border-0 last:pb-0" key={event.id}>
                  <div className="rounded-lg border border-[#DDE3EC] bg-[#F8FAFD] py-2 text-center">
                    <div className="text-xs font-black text-[#1B3FA0]">{event.month}</div>
                    <div className="text-2xl font-black">{event.day}</div>
                  </div>
                  <div>
                    <div className="text-sm font-black">{event.title}</div>
                    <div className="text-xs leading-5 text-[#17223F]">{event.detail}</div>
                  </div>
                  <Badge tone={event.kind === "live_stream" ? "blue" : "yellow"}>{toTitle(event.kind)}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.08em]">Top College Matches</h2>
              <a className="text-xs font-black text-[#1B3FA0]" href="/recruiting">View All</a>
            </div>
            <div className="mt-4 grid gap-3">
              {data.matches.slice(0, 5).map((match) => (
                <div className="grid grid-cols-[46px_1fr_auto] items-center gap-3" key={match.id}>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#0A1A3F] text-lg font-black text-white shadow-[0_10px_22px_rgba(10,26,63,0.16)]">
                    {match.logoText}
                  </div>
                  <div>
                    <div className="text-sm font-black">{match.collegeName}</div>
                    <div className="text-xs text-[#66718F]">{match.division} - {match.distanceMiles} miles</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-[#18833C]">{match.matchPct}%</div>
                    <div className="text-xs font-black text-[#18833C]">Match</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Coach Connection</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0A1A3F] text-white">
                <UserCheck size={26} />
              </div>
              <div>
                <div className="font-black">{data.coachConnection.name}</div>
                <div className="text-sm leading-5 text-[#17223F]">Head Coach</div>
                <div className="text-sm text-[#66718F]">{data.coachConnection.orgName}</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Badge tone="green">{data.coachConnection.connected ? "Connected" : "Pending"}</Badge>
              <a className="rounded-lg border border-[#C7CDD6] px-4 py-2 text-sm font-black" href="/messages">Message Coach</a>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Trust Score</h2>
            <div className="mt-5 grid grid-cols-[128px_1fr] items-center gap-5">
              <div className="grid h-32 w-32 place-items-center rounded-full border-[16px] border-[#F2C200] bg-white shadow-inner">
                <div className="text-center">
                  <div className="text-4xl font-black">{data.trustScore.score}</div>
                  <div className="text-sm font-black text-[#18833C]">{toTitle(data.trustScore.tier)}</div>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                {data.trustScore.factors.map((factor) => (
                  <div className="flex items-center justify-between gap-3" key={factor.factor}>
                    <span className="font-bold text-[#17223F]">{factor.label}</span>
                    <span className="font-black text-[#1B3FA0]">{factor.displayWeight}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <div className="sticky bottom-5 z-20 mt-7 rounded-lg border border-[#1B3FA0] bg-[#08245B] p-4 text-white shadow-[0_18px_48px_rgba(10,26,63,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/80 text-lg font-black">AI</div>
            <div>
              <div className="text-lg font-black">Ask your Agent...</div>
              <div className="text-sm text-[#C7D8FF]">Get advice, ask questions, or tell me what you need.</div>
            </div>
          </div>
          <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F2C200] px-6 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.25)]" href="/messages">
            <Mic size={17} />
            Talk to Agent
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function StatusMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-[#DDE3EC] bg-[#F8FAFD] p-4">
      <div className="text-xs font-black uppercase tracking-[0.08em] text-[#66718F]">{label}</div>
      <div className="mt-2 text-3xl font-black text-[#0A1A3F]">{value}</div>
      <p className="mt-1 text-sm leading-5 text-[#66718F]">{detail}</p>
    </div>
  );
}
