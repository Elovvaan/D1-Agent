import { Save } from "lucide-react";
import { saveGameIntake } from "@/app/operations/game-actions";
import { allStates } from "@/components/schools-directory-navigator";

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} type={type} required={required} /></label>;
}

function Select({ label, name, children, required = false }: { label: string; name: string; children: React.ReactNode; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><select className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} required={required}>{children}</select></label>;
}

export function GameIntakeForm() {
  return (
    <form action={saveGameIntake} encType="multipart/form-data" className="rounded-[30px] border border-white/12 bg-[#071A43] p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Game Intake V1</p><h3 className="text-2xl font-black">Add game</h3><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">Save the game record, thumbnail, and video into the public Games hub.</p></div>
        <button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save game</button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Select label="State" name="state" required><option value="">Select state</option>{allStates.map((state) => <option key={state.code} value={state.code}>{state.code} — {state.name}</option>)}</Select>
        <Input label="Sport" name="sport" required />
        <Select label="Status" name="status"><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="final">Final</option><option value="postponed">Postponed</option></Select>
        <Input label="Home team" name="homeTeam" required />
        <Input label="Away team" name="awayTeam" required />
        <Input label="School / host" name="school" />
        <Input label="Game date" name="gameDate" type="date" required />
        <Input label="Game time" name="gameTime" type="time" />
        <Input label="Venue" name="venue" />
        <Input label="Home score" name="homeScore" type="number" />
        <Input label="Away score" name="awayScore" type="number" />
        <Input label="Title" name="title" />
      </div>
      <label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Notes</span><textarea className="min-h-32 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="notes" /></label>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-white"><span>Game thumbnail</span><input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="thumbnailFile" type="file" accept="image/*" /></label>
        <label className="grid gap-2 text-sm font-black text-white"><span>Game video</span><input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="videoFile" type="file" accept="video/*" /></label>
      </div>
    </form>
  );
}
