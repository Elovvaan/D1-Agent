import Link from "next/link";
import { cookies } from "next/headers";
import { Save, Smartphone } from "lucide-react";
import { AssetInput } from "@/components/operations/asset-input";
import { getPageProfile } from "@/lib/data/page-profiles";
import { savePageProfile, signInOperator } from "../actions";

const OPERATOR_COOKIE = "myd1_operator_access";
const OPERATOR_COOKIE_VALUE = "granted";

function TextInput({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="grid gap-2 text-sm font-black text-white"><span>{label}</span><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name={name} defaultValue={defaultValue ?? ""} /></label>;
}

function UnlockPanel() {
  return <main className="min-h-screen bg-[#061331] px-6 py-10 text-white"><div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-[#0A1A3F] p-6"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Private Back Window</p><h1 className="mt-3 text-4xl font-black">Unlock Platform Management</h1><form action={signInOperator} className="mt-6 grid gap-3"><input className="min-h-12 rounded-2xl bg-white px-4 text-sm font-black text-[#061331] outline-none" name="accessCode" placeholder="Operator access code" type="password" /><button className="min-h-12 rounded-2xl bg-[#F2C200] px-5 text-sm font-black text-[#061331]" type="submit">Unlock Management</button></form></div></main>;
}

export default async function MobileAppOperationsPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isOperator = cookieStore.get(OPERATOR_COOKIE)?.value === OPERATOR_COOKIE_VALUE;
  if (!isOperator) return <UnlockPanel />;
  const profile = getPageProfile("app");

  return <main className="min-h-screen bg-[#061331] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-[1400px]"><header className="rounded-[30px] border border-white/10 bg-[#0A1A3F] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">MyD1 Command Window</p><div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-3xl font-black">Mobile App Workstation</h1><p className="mt-1 text-sm font-semibold text-[#CAD7FF]">Edit the /app mobile experience from Platform Management.</p></div><div className="flex flex-wrap gap-2"><Link href="/operations" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white">Back to Platform Management</Link><Link href="/operations/preview?path=%2Fapp&back=%2Foperations%2Fapp" className="rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]">Preview app</Link></div></div>{params.status ? <div className="mt-4 rounded-2xl border border-[#8CFF00]/30 bg-[#8CFF00]/10 px-4 py-3 text-sm font-black text-[#8CFF00]">Saved</div> : null}</header>

  <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]"><form action={savePageProfile} encType="multipart/form-data" className="rounded-[30px] border border-white/12 bg-[#071A43] p-5"><input type="hidden" name="pageKey" value="app" /><input type="hidden" name="stateCode" value="" /><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">App page manager</p><h2 className="text-2xl font-black">Edit Mobile App</h2><p className="mt-1 text-xs font-semibold text-[#9DB5FF]">These fields feed the mobile app home and preview editor.</p></div><button className="rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Save className="inline" size={16} /> Save app</button></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><TextInput label="Hero headline" name="headline" defaultValue={profile?.headline} /><TextInput label="Subheadline" name="subheadline" defaultValue={profile?.subheadline} /><TextInput label="CTA label" name="ctaLabel" defaultValue={profile?.ctaLabel} /><TextInput label="CTA link" name="ctaHref" defaultValue={profile?.ctaHref} /></div><label className="mt-4 grid gap-2 text-sm font-black text-white"><span>Body / public copy</span><textarea className="min-h-40 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#061331] outline-none" name="body" defaultValue={profile?.body ?? ""} /></label><div className="mt-5 grid gap-3 lg:grid-cols-3"><AssetInput label="App cover image" fieldName="coverImageUrl" currentUrl={profile?.coverImageUrl} accept="image/*" helper="Optional mobile app hero/cover image." /><AssetInput label="App icon / badge" fieldName="badgeImageUrl" currentUrl={profile?.badgeImageUrl} accept="image/*" helper="Optional app badge or icon." /><AssetInput label="App feature video" fieldName="featureVideoUrl" currentUrl={profile?.featureVideoUrl} accept="video/*" helper="Optional app preview video." /></div></form>

  <aside className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5"><Smartphone className="text-[#8CFF00]" /><h3 className="mt-3 text-2xl font-black">App Operations</h3><p className="mt-2 text-sm font-semibold leading-6 text-[#CAD7FF]">Use this workstation to control the mobile app entry point. Use Preview App for the same inline edit flow as the public pages.</p><div className="mt-5 grid gap-3"><Link className="rounded-2xl bg-[#8CFF00] px-4 py-3 text-center text-sm font-black text-[#061331]" href="/operations/preview?path=%2Fapp&back=%2Foperations%2Fapp">Open editable preview</Link><Link className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-center text-sm font-black text-white" href="/app" target="_blank">Open live app</Link></div></aside></section></div></main>;
}
