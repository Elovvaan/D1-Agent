import { ArrowRight, Building2, Search, Trophy, UserRound, Users } from "lucide-react";
import { PublicSiteShell } from "@/components/public-site-shell";
import { MiniChannel, SchoolTile, StateRail, slug, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { getStateProfile } from "@/lib/data/state-profiles";

function findState(value: string) {
  const normalized = value.toLowerCase();
  return getPublicSchoolHierarchy().find((state) => state.code.toLowerCase() === normalized || slug(state.name) === normalized || (normalized === "national" && state.code === "US"));
}

export default async function StateSchoolsPage({ params }: { params: Promise<{ stateCode: string }> }) {
  const { stateCode } = await params;
  const states = getPublicSchoolHierarchy();
  const state = findState(stateCode);
  if (!state) {
    return <PublicSiteShell variant="dark"><section className="min-h-screen bg-[#061331] px-4 py-16 text-white"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center"><h1 className="text-3xl font-black">State not found</h1><a className="mt-5 inline-flex rounded-xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/schools">Back to Schools</a></div></section></PublicSiteShell>;
  }
  const profile = getStateProfile(state.code);
  const selectedStateSlug = stateSlug(state);
  const teamCount = state.schools.reduce((total, school) => total + school.teams.length, 0);
  const athleteCount = state.schools.reduce((total, school) => total + school.athletes.length, 0);
  const coachCount = state.schools.reduce((total, school) => total + school.coaches.length, 0);
  const title = profile?.displayName || state.name;
  const tagline = profile?.tagline || `${state.name} schools`;
  return (
    <PublicSiteShell variant="dark">
      <section className="relative min-h-screen overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.55),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        {profile?.coverImageUrl ? <img src={profile.coverImageUrl} alt={`${state.name} cover`} className="absolute inset-0 h-full w-full object-cover opacity-20" /> : null}
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1560px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <StateRail states={states} activeCode={state.code} />
            <div className="min-w-0">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex items-start gap-4">
                  {profile?.badgeImageUrl ? <img src={profile.badgeImageUrl} alt={`${state.name} badge`} className="h-20 w-28 rounded-2xl border border-white/15 object-cover" /> : null}
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">{state.code} School Folder</div>
                    <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-5xl">{tagline}</h1>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">{profile?.bio || "This center panel only shows schools for the selected state. Pick a school to open teams, coaches, athletes, and games."}</p>
                  </div>
                </div>
                <a href="/get-started" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Add / Claim School <ArrowRight size={16} /></a>
              </div>
              <form className="grid gap-3 rounded-[26px] border border-white/12 bg-white/[0.055] p-4 backdrop-blur md:grid-cols-[1fr_auto]">
                <div className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-[#0A1A3F]"><Search size={18} className="text-[#66718F]" /><input className="flex-1 bg-transparent text-sm font-semibold outline-none" name="q" placeholder={`Search ${title} schools...`} type="search" /></div>
                <button className="rounded-xl border border-white/14 bg-white/[0.08] px-4 text-sm font-black text-white">Search</button>
              </form>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <MiniChannel title="Schools" icon={Building2} count={state.schools.length} />
                <MiniChannel title="Teams" icon={Users} count={teamCount} />
                <MiniChannel title="Athletes" icon={Trophy} count={athleteCount} />
                <MiniChannel title="Coaches" icon={UserRound} count={coachCount} />
              </div>
              <div className="mt-8 rounded-[30px] border border-white/12 bg-white/[0.045] p-5">
                <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{state.code} folder</p><h2 className="mt-1 text-2xl font-black">Schools in {title}</h2></div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{state.schools.map((school) => <SchoolTile key={school.id} school={school} stateCode={selectedStateSlug} />)}</div>
              </div>
              {!state.schools.length ? <div className="mt-8 rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center text-sm font-semibold text-[#C8D6FF]">No reviewed schools are ready in this state yet.</div> : null}
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
