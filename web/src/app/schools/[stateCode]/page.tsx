import { ArrowLeft, ArrowRight, Building2, Search, Trophy, UserRound, Users } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";

type StateNode = ReturnType<typeof getPublicSchoolHierarchy>[number];
type SchoolNode = StateNode["schools"][number];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findState(value: string) {
  const normalized = value.toLowerCase();
  return getPublicSchoolHierarchy().find((state) => state.code.toLowerCase() === normalized || slug(state.name) === normalized || (normalized === "national" && state.code === "US"));
}

function SchoolTile({ school, stateCode }: { school: SchoolNode; stateCode: string }) {
  return (
    <a href={`/schools/${stateCode}/${slug(school.title)}`} className="group rounded-[32px] border border-white/12 bg-white/[0.06] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#F2C200]/70 hover:bg-white/[0.09] hover:shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[28px] border border-white/14 bg-[radial-gradient(circle_at_74%_18%,rgba(242,194,0,0.5),transparent_20%),linear-gradient(135deg,#10224D,#1B3FA0_54%,#061331)] p-5 transition group-hover:scale-[1.03]">
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
        <EntityMark entity={{ ref_type: "School", ref_id: school.id, display_name: school.title }} kind="logo" size={86} />
        <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-white/20 opacity-0 transition duration-500 group-hover:left-full group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-white">{school.title}</h2>
          <p className="mt-1 truncate text-xs font-semibold leading-5 text-[#C8D6FF]">{school.detail}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F2C200] text-[#061331] transition group-hover:translate-x-1"><ArrowRight size={17} /></span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
        <span className="rounded-xl bg-[#E6EEFF] px-2 py-2 text-[#1B3FA0]">{school.teams.length}<br />Teams</span>
        <span className="rounded-xl bg-[#FFF1B8] px-2 py-2 text-[#6F5600]">{school.athletes.length}<br />Athletes</span>
        <span className="rounded-xl bg-[#DFFBEA] px-2 py-2 text-[#08743C]">{school.coaches.length}<br />Coaches</span>
      </div>
    </a>
  );
}

function MiniChannel({ title, icon: Icon, count }: { title: string; icon: typeof Users; count: number }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{count}</div><p className="text-sm font-semibold text-[#C8D6FF]">{title}</p></div>;
}

export default async function StateSchoolsPage({ params }: { params: Promise<{ stateCode: string }> }) {
  const { stateCode } = await params;
  const state = findState(stateCode);
  if (!state) {
    return <PublicSiteShell variant="dark"><section className="min-h-screen bg-[#061331] px-4 py-16 text-white"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center"><h1 className="text-3xl font-black">State not found</h1><a className="mt-5 inline-flex rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/schools">Back to Schools</a></div></section></PublicSiteShell>;
  }
  const stateSlug = state.code.toLowerCase() === "us" ? "national" : state.code.toLowerCase();
  const teamCount = state.schools.reduce((total, school) => total + school.teams.length, 0);
  const athleteCount = state.schools.reduce((total, school) => total + school.athletes.length, 0);
  const coachCount = state.schools.reduce((total, school) => total + school.coaches.length, 0);
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <a href="/schools" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-black text-white"><ArrowLeft size={16} /> All States</a>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">{state.code} School Folder</div>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl">{state.name} schools</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Pick a school. The next page opens teams, coaches, athletes, and games for that one school only.</p>
            </div>
            <a href="/get-started" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Add / Claim School <ArrowRight size={16} /></a>
          </div>
          <form className="grid gap-3 rounded-[26px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur md:grid-cols-[1fr_auto]">
            <div className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-[#0A1A3F]"><Search size={18} className="text-[#66718F]" /><input className="flex-1 bg-transparent text-sm font-semibold outline-none" name="q" placeholder={`Search ${state.name} schools...`} type="search" /></div>
            <button className="rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white">Search</button>
          </form>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MiniChannel title="Schools" icon={Building2} count={state.schools.length} />
            <MiniChannel title="Teams" icon={Users} count={teamCount} />
            <MiniChannel title="Athletes" icon={Trophy} count={athleteCount} />
            <MiniChannel title="Coaches" icon={UserRound} count={coachCount} />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{state.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={stateSlug} />)}</div>
          {!state.schools.length ? <div className="mt-8 rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center text-sm font-semibold text-[#C8D6FF]">No reviewed schools are ready in this state yet.</div> : null}
        </div>
      </section>
    </PublicSiteShell>
  );
}
