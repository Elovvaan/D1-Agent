import { Activity, BadgeCheck, Binoculars, Clapperboard, Dumbbell, GraduationCap, Sparkles } from "lucide-react";
import type { AiAgent, AgentKey, AgentStatus } from "@/lib/services/ai-agent-service";

const icons: Record<AgentKey, typeof Activity> = {
  scout: Binoculars,
  recruiting: GraduationCap,
  media: Clapperboard,
  training: Dumbbell,
  opportunity: Sparkles
};

const tones: Record<AgentStatus, string> = {
  active: "border-[#8CFF00]/35 bg-[#8CFF00]/10 text-[#8CFF00]",
  waiting: "border-white/15 bg-white/[0.08] text-[#CAD7FF]",
  review: "border-[#F2C200]/35 bg-[#F2C200]/10 text-[#F2C200]",
  paused: "border-red-300/20 bg-red-500/10 text-red-200"
};

export function AiAgentCard({ agent }: { agent: AiAgent }) {
  const Icon = icons[agent.key] ?? Activity;
  return <article className="rounded-[30px] border border-white/12 bg-white/[0.06] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]"><Icon size={21} /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#8CFF00]">My AI Team</p><h3 className="text-xl font-black">{agent.name}</h3></div></div><span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black uppercase ${tones[agent.status]}`}><BadgeCheck size={14} />{agent.status}</span></div><div className="mt-5 grid gap-3"><div className="rounded-2xl border border-white/10 bg-[#071A43] p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2C200]">Current task</p><p className="mt-2 text-sm font-semibold leading-6 text-white">{agent.currentTask}</p></div><div className="rounded-2xl border border-white/10 bg-[#071A43] p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#8CFF00]">Last completed</p><p className="mt-2 text-sm font-semibold leading-6 text-white">{agent.lastCompletedTask}</p></div><div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#CAD7FF]">Next recommendation</p><p className="mt-2 text-sm font-semibold leading-6 text-white">{agent.nextRecommendation}</p></div></div></article>;
}
