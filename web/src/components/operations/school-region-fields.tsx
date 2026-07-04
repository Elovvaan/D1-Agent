import { getNcesSeedSchoolResults } from "@/lib/data/nces-seed";

export function SchoolRegionFields() {
  const schools = getNcesSeedSchoolResults().slice(0, 60);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2C200]">School Assignment</p>
      <h4 className="mt-1 text-xl font-black text-white">Pull from national school registry</h4>
      <p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Select a registry school name, then confirm the state and district before saving the Schools page.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-black text-white"><span>Registry school name</span><select className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="school">{schools.map((school) => <option key={school.id} value={school.title}>{school.title}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-black text-white"><span>Assigned ST</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="state" placeholder="UT" /></label>
        <label className="grid gap-2 text-sm font-black text-white"><span>District</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="district" /></label>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-[#061331] p-3">
        {schools.slice(0, 8).map((school) => <div key={school.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-black text-white"><span>{school.title}</span><span className="text-[#F2C200]">{school.detail}</span></div>)}
      </div>
    </div>
  );
}
