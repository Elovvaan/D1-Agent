import { ArrowRight, type LucideIcon } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import type { PublicStateNode } from "@/lib/data/public-data-engine";
import { getSchoolProfile } from "@/lib/data/school-profiles";
import { decodeHtmlEntities } from "@/lib/text";
import { usStates as allStates } from "@/lib/us-states";

export { allStates };

type StateNode = PublicStateNode;
type SchoolNode = StateNode["schools"][number];

export function slug(value: string) {
  return decodeHtmlEntities(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function stateSlug(state: StateNode) {
  return state.code.toLowerCase() === "us" ? "national" : state.code.toLowerCase();
}

export function StateRail({ states, activeCode }: { states: StateNode[]; activeCode?: string }) {
  const stateMap = new Map(states.map((state) => [state.code, state]));
  return (
    <aside className="rounded-[28px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="mb-3 px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C200]">All States</p>
        <p className="mt-1 text-xs font-semibold text-[#9DB5FF]">50 states + DC</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {allStates.map((item) => {
          const liveState = stateMap.get(item.code);
          const href = liveState ? `/schools/${stateSlug(liveState)}` : `/schools/${item.code.toLowerCase()}`;
          const count = liveState?.schools.length ?? 0;
          const active = activeCode === item.code;
          return (
            <a key={item.code} href={href} className={`group flex min-h-9 items-center gap-2 rounded-xl border px-2 py-1.5 transition ${active ? "border-[#F2C200] bg-[#F2C200] text-[#061331]" : liveState ? "border-white/10 bg-[#071A43] hover:border-[#F2C200]/70 hover:bg-[#102A64]" : "border-white/5 bg-white/[0.035] opacity-75 hover:opacity-100"}`}>
              <span className={`grid h-6 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black ${active ? "bg-[#061331] text-[#F2C200]" : "bg-[#F2C200] text-[#061331]"}`}>{item.code}</span>
              <span className={`min-w-0 flex-1 truncate text-[11px] font-black ${active ? "text-[#061331]" : "text-white"}`}>{item.name}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-[#061331]/15 text-[#061331]" : "bg-white/[0.08] text-[#CAD7FF]"}`}>{count}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

export function SchoolTile({ school, stateCode }: { school: SchoolNode; stateCode: string }) {
  const profile = getSchoolProfile(school.id);
  return (
    <a href={`/schools/${stateCode}/${slug(school.title)}`} className="group rounded-[32px] border border-white/12 bg-white/[0.06] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#F2C200]/70 hover:bg-white/[0.09] hover:shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
      <div data-myd1-school-logo="true" data-myd1-school-id={school.id} data-myd1-school-name={school.title} className="relative grid aspect-square place-items-center overflow-hidden rounded-[28px] border border-white/14 bg-[radial-gradient(circle_at_74%_18%,rgba(242,194,0,0.5),transparent_20%),linear-gradient(135deg,#10224D,#1B3FA0_54%,#061331)] p-5 transition group-hover:scale-[1.03]">
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
        {profile?.logoImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logoImageUrl} alt={school.title} width={86} height={86} style={{ width: 86, height: 86, borderRadius: 18, objectFit: "contain", background: "#FAFBFD", padding: 10 }} />
        ) : (
          <EntityMark entity={{ ref_type: "School", ref_id: school.id, display_name: school.title }} kind="logo" size={86} />
        )}
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

export function MiniChannel({ title, icon: Icon, count }: { title: string; icon: LucideIcon; count: number }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Icon className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{count}</div><p className="text-sm font-semibold text-[#C8D6FF]">{title}</p></div>;
}
