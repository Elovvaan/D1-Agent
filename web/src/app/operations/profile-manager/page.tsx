import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ImageIcon, Save, Video } from "lucide-react";
import { slug, StateRail, stateSlug } from "@/components/schools-directory-navigator";
import { getPublicSchoolHierarchy } from "@/lib/data/public-data-engine";
import { getStateProfile } from "@/lib/data/state-profiles";
import { getSchoolProfile } from "@/lib/data/school-profiles";
import { saveSchoolProfile, saveStateProfile } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

export default async function ProfileManagerPage({ searchParams }: { searchParams?: Promise<{ state?: string; school?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  const states = getPublicSchoolHierarchy();
  const selectedState = states.find((state) => state.code.toLowerCase() === (params.state ?? "").toLowerCase()) ?? states[0];
  const profile = selectedState ? getStateProfile(selectedState.code) : undefined;
  const selectedSchool = selectedState?.schools.find((school) => school.id === params.school) ?? selectedState?.schools[0];
  const schoolProfile = selectedSchool ? getSchoolProfile(selectedSchool.id) : undefined;
  if (!isOperator) return <main className="min-h-screen bg-[#061331] p-8 text-white"><Link className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" href="/operations">Unlock Operations</Link></main>;
  return (
    <main className="min-h-screen bg-[#061331] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Profile Manager</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">State profile editor</h1>
            <p className="mt-2 text-sm font-semibold text-[#CAD7FF]">Edit the public-facing state layer: cover media, badge/logo, headline, bio, and featured sport.</p>
          </div>
          <div className="flex gap-2"><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black" href="/operations/directory">Directory Graph</Link><Link className="rounded-2xl bg-[#F2C200] px-4 py-3 text-sm font-black text-[#061331]" href={`/schools/${selectedState ? stateSlug(selectedState) : ""}`}>View Public</Link></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <StateRail states={states} activeCode={selectedState?.code} />
          <section className="min-w-0 rounded-[34px] border border-white/10 bg-white/[0.07] p-6">
            {params.status === "state-profile-saved" ? <div className="mb-5 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-3 text-sm font-black text-[#FFE27A]">State profile saved. Public state pages can now project this data.</div> : null}
            {selectedState ? (
              <form action={saveStateProfile} className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <input type="hidden" name="stateCode" value={selectedState.code} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{selectedState.code} public profile</p>
                  <h2 className="mt-2 text-3xl font-black">{selectedState.name}</h2>
                  <div className="mt-6 grid gap-4">
                    <label className="grid gap-2 text-sm font-black"><span>Display name</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="displayName" defaultValue={profile?.displayName ?? selectedState.name} /></label>
                    <label className="grid gap-2 text-sm font-black"><span>Headline / tagline</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="tagline" defaultValue={profile?.tagline ?? ""} /></label>
                    <label className="grid gap-2 text-sm font-black"><span>State bio</span><textarea className="min-h-36 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="bio" defaultValue={profile?.bio ?? ""} /></label>
                    <label className="grid gap-2 text-sm font-black"><span>Primary sport / focus</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="primarySport" defaultValue={profile?.primarySport ?? ""} /></label>
                  </div>
                </div>
                <aside className="rounded-[28px] border border-white/10 bg-[#071A43] p-5">
                  <div className="flex items-center gap-3"><ImageIcon className="text-[#F2C200]" /><h3 className="text-xl font-black">Media</h3></div>
                  <div className="mt-4 grid gap-4">
                    <label className="grid gap-2 text-sm font-black"><span>Cover image URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="coverImageUrl" defaultValue={profile?.coverImageUrl ?? ""} /></label>
                    <label className="grid gap-2 text-sm font-black"><span>Badge / logo image URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="badgeImageUrl" defaultValue={profile?.badgeImageUrl ?? ""} /></label>
                    <label className="grid gap-2 text-sm font-black"><span>Feature video URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="featureVideoUrl" defaultValue={profile?.featureVideoUrl ?? ""} /></label>
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-sm font-black"><Video size={16} className="text-[#F2C200]" /> Public response</div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#9DB5FF]">Save here, then the state page reads this profile as the state-level projection.</p>
                  </div>
                  <button className="mt-5 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save state profile</button>
                </aside>
              </form>
            ) : <div className="rounded-2xl bg-[#071A43] p-5 text-sm font-black text-[#CAD7FF]">No state selected.</div>}
          </section>
        </div>
        {selectedState ? (
          <section className="mt-6 rounded-[34px] border border-white/10 bg-white/[0.07] p-6">
            {params.status === "school-profile-saved" ? <div className="mb-5 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 p-3 text-sm font-black text-[#FFE27A]">School profile saved. Public school pages can now project this image.</div> : null}
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">School image cards</p>
            <h2 className="mt-2 text-2xl font-black">Pick a {selectedState.code} school to edit its logo / cover image</h2>
            {selectedState.schools.length ? (
              <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-white/10 bg-[#071A43] p-2">
                  {selectedState.schools.map((school) => (
                    <Link key={school.id} href={`/operations/profile-manager?state=${selectedState.code}&school=${encodeURIComponent(school.id)}`} className={`truncate rounded-xl px-3 py-2 text-sm font-black ${selectedSchool?.id === school.id ? "bg-[#F2C200] text-[#061331]" : "text-white hover:bg-white/[0.08]"}`}>{school.title}</Link>
                  ))}
                </div>
                {selectedSchool ? (
                  <form action={saveSchoolProfile} className="rounded-2xl border border-white/10 bg-[#071A43] p-5">
                    <input type="hidden" name="schoolId" value={selectedSchool.id} />
                    <input type="hidden" name="schoolSlug" value={slug(selectedSchool.title)} />
                    <input type="hidden" name="stateCode" value={selectedState.code} />
                    <h3 className="text-xl font-black">{selectedSchool.title}</h3>
                    <div className="mt-4 grid gap-4">
                      <label className="grid gap-2 text-sm font-black"><span>Logo image URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="logoImageUrl" defaultValue={schoolProfile?.logoImageUrl ?? ""} /></label>
                      <label className="grid gap-2 text-sm font-black"><span>Cover image URL</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="coverImageUrl" defaultValue={schoolProfile?.coverImageUrl ?? ""} /></label>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save school image</button>
                      <Link className="text-sm font-black text-[#F2C200] underline" href={`/schools/${selectedState.code.toLowerCase() === "us" ? "national" : selectedState.code.toLowerCase()}/${slug(selectedSchool.title)}`}>View Public <ArrowRight size={14} className="inline" /></Link>
                    </div>
                  </form>
                ) : null}
              </div>
            ) : <p className="mt-3 text-sm font-semibold text-[#CAD7FF]">No reviewed schools in this state yet.</p>}
          </section>
        ) : null}
      </div>
    </main>
  );
}
