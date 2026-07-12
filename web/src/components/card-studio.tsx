"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { Download, ImagePlus, Printer, RotateCcw, ShieldCheck } from "lucide-react";

type CardData = {
  playerName: string;
  position: string;
  jerseyNumber: string;
  school: string;
  cityState: string;
  classYear: string;
  editionYear: string;
  collectorNumber: string;
  printRun: string;
  cardId: string;
  profileUrl: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  achievement1: string;
  achievement2: string;
  achievement3: string;
  bio: string;
};

const initialData: CardData = {
  playerName: "PLAYER NAME",
  position: "POSITION",
  jerseyNumber: "00",
  school: "SCHOOL / TEAM",
  cityState: "CITY, STATE",
  classYear: "2027",
  editionYear: "2026",
  collectorNumber: "001",
  printRun: "100",
  cardId: "MYD1-2026-001",
  profileUrl: "myd1.com/athlete/profile",
  stat1Label: "PPG",
  stat1Value: "0.0",
  stat2Label: "RPG",
  stat2Value: "0.0",
  stat3Label: "APG",
  stat3Value: "0.0",
  achievement1: "First achievement",
  achievement2: "Second achievement",
  achievement3: "Third achievement",
  bio: "Add a short athlete biography, leadership note, or community story here."
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-[#061331] outline-none transition focus:border-[#1B3FA0]" />
    </label>
  );
}

function CardFrame({ side, data, photo }: { side: "front" | "back"; data: CardData; photo: string }) {
  const serial = `${data.collectorNumber.padStart(3, "0")}/${data.printRun}`;

  if (side === "front") {
    return (
      <article className="relative aspect-[2.5/3.5] overflow-hidden rounded-[24px] border border-[#D7A92D] bg-[#050505] text-white shadow-[0_28px_70px_rgba(0,0,0,0.35)] print:rounded-none print:shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(215,169,45,0.2),transparent_36%),linear-gradient(145deg,#101010_0%,#030303_72%)]" />
        <div className="absolute inset-3 rounded-[18px] border border-[#D7A92D]/80" />
        <div className="absolute left-5 top-5 z-10 rounded-xl border border-[#D7A92D] bg-black/75 px-3 py-2 text-center"><div className="text-[11px] font-black text-[#D7A92D]">1ST</div><div className="text-[9px] font-black uppercase">Edition</div></div>
        <div className="absolute right-5 top-5 z-10 text-sm font-black text-[#E6C45E]">{serial}</div>
        <div className="absolute inset-x-6 top-20 bottom-24 overflow-hidden rounded-[18px] border border-white/10 bg-[#111]">
          {photo ? <img src={photo} alt="Athlete card portrait" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-center text-sm font-black uppercase tracking-[0.18em] text-white/35">Upload athlete photo</div>}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        <div className="absolute bottom-5 left-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#D7A92D] bg-black text-[8px] font-black text-[#E6C45E] shadow-[0_0_20px_rgba(215,169,45,0.4)]">MYD1</div>
        <div className="absolute inset-x-14 bottom-5 z-10 text-center"><h2 className="truncate text-xl font-black uppercase tracking-tight text-[#F0D273]">{data.playerName}</h2><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em]">{data.position} · #{data.jerseyNumber}</p><p className="mt-1 truncate text-[8px] font-bold uppercase tracking-[0.12em] text-[#E6C45E]">{data.school} · {data.cityState}</p></div>
      </article>
    );
  }

  return (
    <article className="relative aspect-[2.5/3.5] overflow-hidden rounded-[24px] border border-[#D7A92D] bg-[#070707] p-5 text-white shadow-[0_28px_70px_rgba(0,0,0,0.35)] print:rounded-none print:shadow-none">
      <div className="absolute inset-3 rounded-[18px] border border-[#D7A92D]/70" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4"><div><div className="text-2xl font-black italic">MY<span className="text-[#D7A92D]">D1</span></div><p className="text-[8px] font-black uppercase tracking-[0.22em]">Sports Cards</p></div><div className="text-right text-[8px] font-bold uppercase text-[#E6C45E]"><div>Card ID</div><div className="mt-1 text-white">{data.cardId}</div></div></div>
        <div className="mt-4 border-b border-[#D7A92D]/40 pb-3"><h2 className="text-xl font-black uppercase text-[#F0D273]">{data.playerName}</h2><p className="text-[10px] font-black uppercase tracking-[0.12em]">{data.position} · #{data.jerseyNumber}</p><p className="mt-1 text-[8px] font-bold uppercase text-[#D7A92D]">{data.school} · {data.cityState}</p></div>
        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#E6C45E]">Season Stats</p>
          <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-lg border border-[#D7A92D]/50">
            {[
              [data.stat1Label, data.stat1Value],
              [data.stat2Label, data.stat2Value],
              [data.stat3Label, data.stat3Value],
            ].map(([label, value], index) => (
              <div key={`${index}-${label}`} className="border-r border-[#D7A92D]/30 px-2 py-2 text-center last:border-r-0">
                <div className="text-[7px] font-black text-white/60">{label}</div>
                <div className="mt-1 text-sm font-black">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#E6C45E]">Achievements</p>
          <ul className="mt-1.5 grid gap-1 text-[8px] font-semibold leading-4 text-white/85">
            {[data.achievement1, data.achievement2, data.achievement3]
              .filter(Boolean)
              .map((item, index) => (
                <li key={`${index}-${item}`}>• {item}</li>
              ))}
          </ul>
        </div>
        <div className="mt-3"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#E6C45E]">About the Athlete</p><p className="mt-1 text-[7px] font-semibold leading-3 text-white/75">{data.bio}</p></div>
        <div className="mt-auto border-t border-[#D7A92D]/40 pt-3"><div className="h-7 border-b border-white/50 text-center text-[8px] italic text-[#E6C45E]">Wet ink signature</div><div className="mt-2 flex items-end justify-between gap-3"><div><p className="text-[7px] font-black uppercase text-white/50">Collector Copy</p><p className="text-sm font-black">{serial}</p></div><div className="max-w-[54%] text-right"><p className="truncate text-[7px] font-bold text-[#E6C45E]">{data.profileUrl}</p><p className="mt-1 text-[6px] font-bold uppercase text-white/45">100 signed copies · archive copy retained by MYD1</p></div></div></div>
      </div>
    </article>
  );
}

export function CardStudio() {
  const [data, setData] = useState<CardData>(initialData);
  const [photo, setPhoto] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const update = (key: keyof CardData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const serial = useMemo(() => `${data.collectorNumber.padStart(3, "0")}/${data.printRun}`, [data.collectorNumber, data.printRun]);

  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow re-uploading the same file by clearing the input value.
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setPhoto((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  return (
    <section className="grid gap-6">
      <header className="rounded-[32px] bg-[#061331] p-6 text-white shadow-[0_24px_80px_rgba(6,19,49,0.18)]"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MYD1 Operations</p><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-black tracking-tight">First Edition Card Studio</h1><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Create a consistent front-and-back player collectible, assign the signed edition number, preview both sides, and print the production card.</p></div><div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#CAD7FF]">Current collector copy</p><p className="mt-1 text-2xl font-black text-[#F2C200]">{serial}</p></div></div></header>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,460px)_1fr]">
        <aside className="rounded-[28px] border border-[#DDE3EC] bg-white p-5 shadow-[0_18px_50px_rgba(10,26,63,0.08)]"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-[#061331]">Card fields</h2><button onClick={() => { setData(initialData); setPhoto(""); }} className="inline-flex items-center gap-2 rounded-xl border border-[#DDE3EC] px-3 py-2 text-xs font-black text-[#061331]"><RotateCcw size={15} /> Reset</button></div><label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#AFC0E8] bg-[#F6F8FD] px-4 py-4 text-sm font-black text-[#1B3FA0]"><ImagePlus size={18} /> Upload athlete photo<input type="file" accept="image/*" onChange={onPhoto} className="hidden" /></label><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Player name" value={data.playerName} onChange={(value) => update("playerName", value)} /><Field label="Position" value={data.position} onChange={(value) => update("position", value)} /><Field label="Jersey number" value={data.jerseyNumber} onChange={(value) => update("jerseyNumber", value)} /><Field label="Class year" value={data.classYear} onChange={(value) => update("classYear", value)} /><Field label="School / team" value={data.school} onChange={(value) => update("school", value)} /><Field label="City, state" value={data.cityState} onChange={(value) => update("cityState", value)} /><Field label="Collector number" value={data.collectorNumber} onChange={(value) => update("collectorNumber", value)} /><Field label="Print run" value={data.printRun} onChange={(value) => update("printRun", value)} /><Field label="Card ID" value={data.cardId} onChange={(value) => update("cardId", value)} /><Field label="Profile URL" value={data.profileUrl} onChange={(value) => update("profileUrl", value)} /><Field label="Stat 1" value={`${data.stat1Label}: ${data.stat1Value}`} onChange={(value) => { const [label, ...rest] = value.split(":"); update("stat1Label", label.trim()); update("stat1Value", rest.join(":").trim()); }} /><Field label="Stat 2" value={`${data.stat2Label}: ${data.stat2Value}`} onChange={(value) => { const [label, ...rest] = value.split(":"); update("stat2Label", label.trim()); update("stat2Value", rest.join(":").trim()); }} /><Field label="Stat 3" value={`${data.stat3Label}: ${data.stat3Value}`} onChange={(value) => { const [label, ...rest] = value.split(":"); update("stat3Label", label.trim()); update("stat3Value", rest.join(":").trim()); }} /><Field label="Achievement 1" value={data.achievement1} onChange={(value) => update("achievement1", value)} /><Field label="Achievement 2" value={data.achievement2} onChange={(value) => update("achievement2", value)} /><Field label="Achievement 3" value={data.achievement3} onChange={(value) => update("achievement3", value)} /></div><label className="mt-4 grid gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Athlete bio<textarea value={data.bio} onChange={(event) => update("bio", event.target.value)} rows={4} className="rounded-xl border border-[#DDE3EC] px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-[#061331] outline-none focus:border-[#1B3FA0]" /></label></aside>

        <main className="rounded-[28px] bg-[#0A0A0A] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1"><button onClick={() => setSide("front")} className={side === "front" ? "rounded-xl bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331]" : "rounded-xl px-4 py-2 text-xs font-black text-white/70"}>Front</button><button onClick={() => setSide("back")} className={side === "back" ? "rounded-xl bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331]" : "rounded-xl px-4 py-2 text-xs font-black text-white/70"}>Back</button></div><div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#061331]"><Printer size={15} /> Print</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331]"><Download size={15} /> Save PDF</button></div></div><div className="mx-auto max-w-[430px]"><CardFrame side={side} data={data} photo={photo} /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"><ShieldCheck className="text-[#F2C200]" size={18} /><p className="mt-2 text-xs font-black uppercase">Signed run</p><p className="mt-1 text-[11px] font-semibold text-white/60">100 wet-ink collector copies plus one MYD1 archive copy.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"><p className="text-xs font-black uppercase text-[#F2C200]">Print size</p><p className="mt-2 text-sm font-black">2.5 × 3.5 in</p><p className="mt-1 text-[11px] font-semibold text-white/60">Use 300 DPI output and cardstock-compatible printer settings.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"><p className="text-xs font-black uppercase text-[#F2C200]">Brand rule</p><p className="mt-2 text-sm font-black">Athlete first</p><p className="mt-1 text-[11px] font-semibold text-white/60">MYD1 stays limited to the authentication seal and issuer information.</p></div></div></main>
      </div>
    </section>
  );
}
