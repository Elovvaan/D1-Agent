import Link from "next/link";
import { cookies } from "next/headers";
import { Bot, Braces, Database, Play, Save, ShieldCheck } from "lucide-react";
import { readJsonSync, userStatePath } from "@/lib/data/platform-storage";
import { signInOperator } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

type BuilderItem = { id: string; name?: string; purpose?: string; status?: string; createdAt?: string };

function readItems() {
  return readJsonSync<{ items?: BuilderItem[] }>(userStatePath("builder-items.json"), { items: [] }).items ?? [];
}

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Operations</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Operations</button></form></div></main>;
}

function Field({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} required={required} /></label>;
}

function Area({ label, name }: { label: string; name: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><textarea className="min-h-28 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name={name} /></label>;
}

export default async function AiBuilderPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;
  const items = readItems();

  return <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-[1600px]"><header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">AI Builder</p><h1 className="mt-2 text-4xl font-black">Build platform assistants</h1><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">Define the assistant, its job, its inputs, its process, and the output it should create for MyD1 operations.</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black text-white" href="/operations">Back to Operations</Link></div></div>{params.status ? <div className="mt-4 rounded-2xl border border-[#F2C200]/30 bg-[#F2C200]/10 px-4 py-3 text-sm font-black text-[#FFE27A]">{params.status}</div> : null}</header><section className="mt-5 grid gap-4 md:grid-cols-4"><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Bot className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Plan</div><p className="text-sm font-semibold text-[#C8D6FF]">Name the assistant.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Database className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Input</div><p className="text-sm font-semibold text-[#C8D6FF]">Choose the data it reads.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><Braces className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Steps</div><p className="text-sm font-semibold text-[#C8D6FF]">Define the process.</p></div><div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5"><ShieldCheck className="text-[#F2C200]" /><div className="mt-3 text-3xl font-black">Rules</div><p className="text-sm font-semibold text-[#C8D6FF]">Set limits and review.</p></div></section><section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]"><form action="/operations/ai-builder" className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Builder form</p><h2 className="text-2xl font-black">Assistant blueprint</h2></div><button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save blueprint</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><Field label="Assistant name" name="name" required /><Field label="Status" name="status" /></div><div className="mt-4 grid gap-4"><Area label="Purpose" name="purpose" /><Area label="When should it run?" name="runWhen" /><Area label="What data should it use?" name="inputs" /><Area label="What steps should it follow?" name="steps" /><Area label="What should it output?" name="output" /><Area label="Rules / approvals" name="rules" /></div></form><aside className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5"><div className="flex items-center gap-3"><Play className="text-[#F2C200]" /><h2 className="text-2xl font-black">Saved blueprints</h2></div><div className="mt-4 grid gap-3">{items.length ? items.slice(0, 10).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-[#071A43] p-4"><div className="text-sm font-black">{item.name || item.id}</div><div className="mt-1 text-xs font-semibold text-[#9DB5FF]">{item.status || "draft"}</div><p className="mt-2 text-xs font-semibold leading-5 text-[#CAD7FF]">{item.purpose}</p></div>) : <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4 text-sm font-black text-[#CAD7FF]">No assistant blueprints saved yet.</div>}</div></aside></section></div></main>;
}
