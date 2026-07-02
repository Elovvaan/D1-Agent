import { ArrowLeft, ArrowRight, Building2, CalendarDays, Trophy, UserRound, Users } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicSchoolHierarchy, type PublicDirectoryResult } from "@/lib/data/public-data-engine";
import { getSchoolProfile } from "@/lib/data/school-profiles";

type StateNode = ReturnType<typeof getPublicSchoolHierarchy>[number];
type SchoolNode = StateNode["schools"][number];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findState(value: string) {
  const normalized = value.toLowerCase();
  return getPublicSchoolHierarchy().find((state) => state.code.toLowerCase() === normalized || slug(state.name) === normalized || (normalized === "national" && state.code === "US"));
}

function findSchool(state: StateNode, value: string) {
  return state.schools.find((school) => slug(school.title) === value.toLowerCase() || school.id === value);
}

function ChannelCard({ title, icon: Icon, items, empty }: { title: string; icon: typeof Users; items: PublicDirectoryResult[]; empty: string }) {
  return (
    <section className="rounded-[28px] border border-white/12 bg-white/[0.06] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Icon className="text-[#F2C200]" size={20} /><h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">{title}</h2></div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-[#C8D6FF]">{items.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.length ? items.map((item) => (
          <a href={item.href} key={`${title}-${item.id}-${item.href}`} className="group rounded-2xl border border-white/10 bg-[#071A43] p-4 transition hover:border-[#F2C200]/60 hover:bg-white/[0.08]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-white">{item.title}</div>
                <div className="mt-1 truncate text-xs font-semibold text-[#9DB5FF]">{item.detail}</div>
              </div>
              <ArrowRight className="shrink-0 text-[#F2C200] transition group-hover:translate-x-1" size={15} />
            </div>
          </a>
        )) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#9DB5FF]">{empty}</div>}
      </div>
    </section>
  );
}

function TeamCard({ team }: { team: SchoolNode["teams"][number] }) {
  return (
    <a href={team.href} className="group rounded-[28px] border border-white/12 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-[#F2C200]/70 hover:bg-white/[0.09]">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[24px] border border-white/14 bg-[radial-gradient(circle_at_74%_18%,rgba(242,194,0,0.5),transparent_20%),linear-gradient(135deg,#10224D,#1B3FA0_54%,#061331)] p-5">
        <EntityMark entity={{ ref_type: "Team", ref_id: team.id, display_name: team.title }} kind="logo" size={78} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate text-lg font-black text-white">{team.title}</h3><p className="mt-1 truncate text-xs font-semibold text-[#C8D6FF]">{team.detail}</p></div>
        <ArrowRight className="shrink-0 text-[#F2C200] transition group-hover:translate-x-1" size={17} />
      </div>
    </a>
  );
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ stateCode: string; schoolSlug: string }> }) {
  const { stateCode, schoolSlug } = await params;
  const state = findState(stateCode);
  const school = state ? findSchool(state, schoolSlug) : undefined;
  if (!state || !school) {
    return <PublicSiteShell variant="dark"><section className="min-h-screen bg-[#061331] px-4 py-16 text-white"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center"><h1 className="text-3xl font-black">School not found</h1><a className="mt-5 inline-flex rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/schools">Back to Schools</a></div></section></PublicSiteShell>;
  }
  const statePath = `/schools/${state.code.toLowerCase() === "us" ? "national" : state.code.toLowerCase()}`;
  const schoolProfile = getSchoolProfile(school.id);
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        {schoolProfile?.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={schoolProfile.coverImageUrl} alt="" className="absolute inset-0 h-[420px] w-full object-cover opacity-30" />
        ) : null}
        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <a href={statePath} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-black text-white"><ArrowLeft size={16} /> {state.name} Schools</a>
          <div className="mb-8 grid gap-6 lg:grid-cols-[180px_1fr_auto] lg:items-end">
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[32px] border border-white/14 bg-[radial-gradient(circle_at_74%_18%,rgba(242,194,0,0.5),transparent_20%),linear-gradient(135deg,#10224D,#1B3FA0_54%,#061331)] p-6">
              {schoolProfile?.logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={schoolProfile.logoImageUrl} alt={school.title} width={104} height={104} style={{ width: 104, height: 104, borderRadius: 18, objectFit: "contain", background: "#FAFBFD", padding: 12 }} />
              ) : (
                <EntityMark entity={{ ref_type: "School", ref_id: school.id, display_name: school.title }} kind="logo" size={104} />
              )}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">School Hub</div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{school.title}</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">{school.detail}</p>
            </div>
            <a href={school.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Open Record <ArrowRight size={16} /></a>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Users className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{school.teams.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Teams</p></div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Trophy className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{school.athletes.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Athletes</p></div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><UserRound className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{school.coaches.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Coaches</p></div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><CalendarDays className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{school.games.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Games</p></div>
          </div>
          <section className="mt-8 rounded-[28px] border border-white/12 bg-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3"><Building2 className="text-[#F2C200]" /><h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Teams</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{school.teams.length ? school.teams.map((team) => <TeamCard key={team.id} team={team} />) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-semibold text-[#9DB5FF]">No teams connected yet.</div>}</div>
          </section>
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            <ChannelCard title="Coaches" icon={UserRound} items={school.coaches} empty="No coaches connected yet." />
            <ChannelCard title="Athletes" icon={Trophy} items={school.athletes} empty="No athletes connected yet." />
            <ChannelCard title="Games" icon={CalendarDays} items={school.games} empty="No games connected yet." />
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
