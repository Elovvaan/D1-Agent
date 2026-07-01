import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { EntityMark } from "@/components/entity-mark";
import { Badge } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryRecord, toTitle } from "@/lib/data/services";
import type { IdentityRefType } from "@/lib/asset-identity/types";

function sourceNameFromUrl(url?: string) {
  if (!url) return "Public source";
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Public source"; }
}

function publicEntityLabel(typeLabel: string) {
  const normalized = typeLabel.toLowerCase();
  if (normalized.includes("school")) return "School";
  if (normalized.includes("team")) return "Team";
  if (normalized.includes("athlete")) return "Athlete";
  if (normalized.includes("ranking")) return "Ranking";
  if (normalized.includes("game")) return "Game";
  if (normalized.includes("coach")) return "Coach";
  if (normalized.includes("aggregator") || normalized.includes("source")) return "Source";
  return toTitle(typeLabel);
}

function refTypeFor(publicType: string): IdentityRefType {
  if (publicType === "Athlete") return "Athlete";
  if (publicType === "Team") return "Team";
  if (publicType === "School") return "School";
  return "Organization";
}

const hiddenFieldNames = new Set(["sourceurl", "reviewstatus", "imported", "importedat", "orgtype", "sourcename", "sourcetype", "confidencescore", "profileurl"]);

function cleanFieldName(name: string) {
  if (name.toLowerCase() === "name") return "Name";
  if (name.toLowerCase().includes("sport")) return "Sport";
  if (name.toLowerCase() === "city") return "City";
  if (name.toLowerCase() === "state") return "State";
  return toTitle(name);
}

function PublicDetail({ title, value }: { title: string; value: string }) {
  return <div className="group rounded-2xl border border-white/12 bg-white/[0.065] p-4 transition hover:-translate-y-0.5 hover:border-[#F2C200]/60 hover:bg-white/[0.095]"><div className="text-xs font-black uppercase tracking-[0.18em] text-[#F2C200]">{title}</div><div className="mt-2 break-words text-lg font-black text-white">{value}</div></div>;
}

function RelatedCard({ item }: { item: { name: string; label: string; type: string } }) {
  const refType = item.type === "school" ? "School" : item.type === "team" ? "Team" : "Organization";
  return <div className="group rounded-2xl border border-white/12 bg-white/[0.065] p-4 transition hover:-translate-y-0.5 hover:border-[#F2C200]/60 hover:bg-white/[0.095]"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><EntityMark entity={{ ref_type: refType, ref_id: item.name.toLowerCase().replace(/\s+/g, "-"), display_name: item.name }} kind="logo" size={44} /><div className="min-w-0"><div className="truncate text-sm font-black text-white">{item.name}</div><div className="mt-1 text-xs font-semibold text-[#C8D6FF]">{toTitle(item.label)}</div></div></div><Badge tone={item.type === "school" ? "green" : item.type === "team" ? "blue" : "yellow"}>{toTitle(item.type)}</Badge></div></div>;
}

export function DirectoryRecordView({ entityType, entityId }: { entityType: string; entityId: string }) {
  const record = getPublicDirectoryRecord(entityId);
  if (!record) {
    return <PublicSiteShell variant="dark"><section className="relative min-h-screen overflow-hidden bg-[#061331] text-white"><div className="absolute inset-0 bg-[linear-gradient(135deg,#061331,#08245B_55%,#061331)]" /><div className="relative mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8"><a className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-4 py-2 text-sm font-black text-white" href="/search"><ArrowLeft size={16} /> Back to Search</a><h1 className="mt-8 text-5xl font-black">{toTitle(entityType)} not found</h1><p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[#C8D6FF]">This public result is not available yet. Search again or browse schools, sports, and rankings.</p></div></section></PublicSiteShell>;
  }

  const linked = record.graphNode?.linked ?? [];
  const sourceUrl = record.entity.sourceUrl;
  const publicType = publicEntityLabel(record.typeLabel);
  const schools = linked.filter((item) => item.type === "school").slice(0, 6);
  const teams = linked.filter((item) => item.type === "team").slice(0, 6);
  const related = linked.filter((item) => item.type !== "school" && item.type !== "team").slice(0, 8);
  const nameField = record.fields.find((field) => field.name.toLowerCase() === "name")?.value ?? record.title;
  const locationField = record.fields.find((field) => ["state", "city", "location", "hometown"].includes(field.name.toLowerCase()))?.value;
  const sportField = record.fields.find((field) => field.name.toLowerCase().includes("sport"))?.value;
  const cleanFields = record.fields.filter((field) => !hiddenFieldNames.has(field.name.toLowerCase())).slice(0, 6);
  const refType = refTypeFor(publicType);

  return <PublicSiteShell variant="dark"><section className="relative min-h-screen overflow-hidden bg-[#061331] text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(27,63,160,0.58),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" /><div className="absolute -left-20 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200] shadow-[0_0_90px_rgba(242,194,0,0.34)]" /><div className="absolute left-32 top-0 h-full w-28 skew-x-[-12deg] border-r border-[#F2C200]/35 bg-[#0A1A3F]/55" /><div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" /><div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.28em] text-[#F2C200]">MyD1 Public Discovery</div><div className="mt-5 flex items-center gap-4"><EntityMark entity={{ ref_type: refType, ref_id: entityId, display_name: nameField }} kind={refType === "Athlete" ? "headshot" : "logo"} size={72} /><div><h1 className="text-5xl font-black tracking-tight sm:text-6xl">{nameField}</h1><div className="mt-3 flex flex-wrap gap-2"><Badge tone="blue">{publicType}</Badge>{sportField ? <Badge tone="yellow">{sportField}</Badge> : null}{locationField ? <Badge tone="silver">{locationField}</Badge> : null}</div></div></div><p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-[#C8D6FF]">Explore this public sports result and keep moving through related schools, teams, and sports records.</p></div><a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.07] px-4 text-sm font-black text-white transition hover:border-[#F2C200]/60 hover:bg-white/[0.1]" href="/search"><ArrowLeft size={16} /> Back to Search</a></div><div className="grid gap-5 lg:grid-cols-[1fr_330px]"><div className="rounded-[28px] border border-white/12 bg-white/[0.055] p-5 backdrop-blur"><form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/search"><div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 text-[#0A1A3F]"><Search size={18} className="text-[#66718F]" /><input className="min-h-10 flex-1 bg-transparent text-sm font-semibold outline-none" name="q" type="search" /></div><button className="rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#0A1A3F]">Search</button></form></div><div className="rounded-[28px] border border-white/12 bg-white/[0.075] p-5 backdrop-blur transition hover:border-[#F2C200]/60"><div className="text-xs font-black uppercase tracking-[0.2em] text-[#F2C200]">Source</div><div className="mt-3 text-2xl font-black">{sourceNameFromUrl(sourceUrl)}</div><p className="mt-3 text-sm font-semibold leading-6 text-[#C8D6FF]">Original public listing for this result.</p>{sourceUrl ? <a className="mt-5 inline-flex rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F]" href={sourceUrl} rel="noreferrer" target="_blank">Visit Source <ExternalLink size={15} className="ml-2" /></a> : null}</div></div><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:border-[#F2C200]/60"><ShieldCheck className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{publicType}</div><p className="text-sm font-semibold text-[#C8D6FF]">Result type</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:border-[#F2C200]/60"><MapPin className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{schools.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Related schools</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:border-[#F2C200]/60"><Users className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">{teams.length}</div><p className="text-sm font-semibold text-[#C8D6FF]">Related teams</p></div></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><section className="rounded-[28px] border border-white/12 bg-white/[0.055] p-5 backdrop-blur"><h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Overview</h2>{cleanFields.length ? <div className="mt-4 grid gap-3">{cleanFields.map((field) => <PublicDetail key={field.name} title={cleanFieldName(field.name)} value={field.value} />)}</div> : <p className="mt-4 text-sm font-semibold leading-6 text-[#C8D6FF]">More public details will appear as this page grows.</p>}</section><section className="rounded-[28px] border border-white/12 bg-white/[0.055] p-5 backdrop-blur"><h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Related Discovery</h2>{linked.length ? <div className="mt-4 grid gap-3">{[...schools, ...teams, ...related].slice(0, 8).map((item) => <RelatedCard key={`${item.type}-${item.name}`} item={item} />)}</div> : <p className="mt-4 text-sm font-semibold leading-6 text-[#C8D6FF]">Related public results will appear as the directory grows.</p>}</section></div></div></section></PublicSiteShell>;
}
