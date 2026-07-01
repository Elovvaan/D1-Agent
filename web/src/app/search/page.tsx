import { ArrowRight, Filter, Search } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import { Badge } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { searchPublicData, type PublicDirectoryResult } from "@/lib/data/public-data-engine";
import type { IdentityRefType } from "@/lib/asset-identity/types";

const quickTypes = ["Schools", "Teams", "Athletes", "Coaches", "Games"];
const browseSports = ["Football", "Basketball", "Baseball", "Soccer", "Track & Field", "Volleyball", "Wrestling", "Softball", "Tennis", "Golf", "Lacrosse", "Swimming"];

function refTypeForGroup(group: string): IdentityRefType {
  if (group === "Athletes") return "Athlete";
  if (group === "Teams") return "Team";
  if (group === "Schools") return "School";
  return "Organization";
}

function toneForGroup(group: string) {
  if (group === "Schools") return "green" as const;
  if (group === "Athletes") return "yellow" as const;
  if (group === "Teams") return "blue" as const;
  return "silver" as const;
}

function ResultCard({ result }: { result: PublicDirectoryResult }) {
  const refType = refTypeForGroup(result.group);
  return <a className="group rounded-2xl border border-white/12 bg-white/[0.07] p-4 transition hover:border-[#F2C200]/60 hover:bg-white/[0.1]" href={result.href}><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><EntityMark entity={{ ref_type: refType, ref_id: result.id, display_name: result.title }} kind={refType === "Athlete" ? "headshot" : "logo"} /><div className="min-w-0"><div className="truncate text-sm font-black text-white">{result.title}</div><div className="mt-1 text-xs font-semibold text-[#C8D6FF]">{result.detail}</div>{result.sourceUrl ? <div className="mt-1 truncate text-[11px] font-semibold text-[#F2C200]">Source: {result.sourceUrl}</div> : null}</div></div><div className="flex items-center gap-2"><Badge tone={toneForGroup(result.group)}>{result.typeLabel}</Badge><ArrowRight className="text-[#F2C200] transition group-hover:translate-x-1" size={16} /></div></div></a>;
}

function Pill({ label }: { label: string }) {
  return <a className="rounded-xl border border-white/14 bg-white/[0.07] px-4 py-2 text-sm font-black text-white transition hover:border-[#F2C200]/60 hover:bg-white/[0.1]" href={`/search?q=${encodeURIComponent(label)}`}>{label}</a>;
}

export default async function PublicSearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q ?? "").trim();
  const groups = searchPublicData(query);
  const visibleGroups = groups.map((group) => ({ ...group, results: group.results.filter((result) => result.group !== "Sources" && result.group !== "Organizations") })).filter((group) => group.results.length);
  const flatResults = visibleGroups.flatMap((group) => group.results);
  return <PublicSiteShell variant="dark"><section className="relative overflow-hidden bg-[#061331] text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(27,63,160,0.62),transparent_36%),linear-gradient(135deg,#061331,#08245B_54%,#061331)]" /><div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" /><div className="relative mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl text-center"><h1 className="text-5xl font-black tracking-tight sm:text-6xl">Search everything.<br /><span className="text-[#F2C200]">Real data. Real fast.</span></h1><p className="mt-5 text-sm font-semibold leading-6 text-[#C8D6FF]">Search public schools, teams, athletes, games, coaches, rankings, and source-backed records.</p><form className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]"><label className="sr-only" htmlFor="q">Search MyD1</label><div className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-5 text-[#0A1A3F] shadow-[0_20px_60px_rgba(0,0,0,0.28)]"><Search size={20} className="text-[#66718F]" /><input className="min-h-11 flex-1 bg-transparent text-sm font-semibold outline-none" defaultValue={query} id="q" name="q" type="search" /></div><button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/[0.07] px-5 text-sm font-black text-white"><Filter size={17} /> Filters</button></form><div className="mt-5 flex flex-wrap justify-center gap-2">{quickTypes.map((item) => <Pill key={item} label={item} />)}</div></div>{query ? <div className="mt-10 grid gap-4">{flatResults.length ? visibleGroups.map((group) => <div className="rounded-[26px] border border-white/12 bg-white/[0.045] p-5" key={group.group}><div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">{group.group}</h2><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-[#C8D6FF]">{group.results.length}</span></div><div className="grid gap-3">{group.results.map((result) => <ResultCard key={`${result.group}-${result.id}-${result.href}`} result={result} />)}</div></div>) : <div className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 text-center"><h2 className="text-2xl font-black">No results found</h2><p className="mt-2 text-sm font-semibold text-[#C8D6FF]">Try another athlete, school, sport, state, ranking, or team.</p></div>}</div> : <div className="mt-10 rounded-[26px] border border-white/12 bg-white/[0.045] p-5"><h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Browse Sports</h2><div className="mt-4 flex flex-wrap gap-2">{browseSports.map((sport) => <Pill key={sport} label={sport} />)}</div></div>}</div></section></PublicSiteShell>;
}
