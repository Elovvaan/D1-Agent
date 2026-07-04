export function SchoolRegionFields() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2C200]">School Assignment</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-black text-white"><span>School name</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="school" /></label>
        <label className="grid gap-2 text-sm font-black text-white"><span>Assigned ST</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="state" placeholder="UT" /></label>
        <label className="grid gap-2 text-sm font-black text-white"><span>District</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="district" /></label>
      </div>
    </div>
  );
}
