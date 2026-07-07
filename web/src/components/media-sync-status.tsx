import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import type { MediaConnectionStatus, MediaImportStatus } from "@/lib/services/media-agent-service";

export function MediaSyncStatus({ status }: { status: MediaConnectionStatus | MediaImportStatus | "pending" | "approved" | "rejected" }) {
  const config = {
    connected: { label: "Connected", tone: "bg-[#8CFF00]/15 text-[#8CFF00] border-[#8CFF00]/30", icon: CheckCircle2 },
    "permission-needed": { label: "Permission Needed", tone: "bg-[#F2C200]/15 text-[#F2C200] border-[#F2C200]/30", icon: ShieldCheck },
    "sync-paused": { label: "Sync Paused", tone: "bg-white/10 text-white border-white/15", icon: Clock3 },
    error: { label: "Error", tone: "bg-red-500/15 text-red-200 border-red-300/20", icon: XCircle },
    imported: { label: "Imported", tone: "bg-[#8CFF00]/15 text-[#8CFF00] border-[#8CFF00]/30", icon: CheckCircle2 },
    queued: { label: "Queued", tone: "bg-[#F2C200]/15 text-[#F2C200] border-[#F2C200]/30", icon: Clock3 },
    review: { label: "Review", tone: "bg-[#F2C200]/15 text-[#F2C200] border-[#F2C200]/30", icon: ShieldCheck },
    published: { label: "Published", tone: "bg-[#8CFF00]/15 text-[#8CFF00] border-[#8CFF00]/30", icon: CheckCircle2 },
    failed: { label: "Failed", tone: "bg-red-500/15 text-red-200 border-red-300/20", icon: XCircle },
    pending: { label: "Pending", tone: "bg-[#F2C200]/15 text-[#F2C200] border-[#F2C200]/30", icon: Clock3 },
    approved: { label: "Approved", tone: "bg-[#8CFF00]/15 text-[#8CFF00] border-[#8CFF00]/30", icon: CheckCircle2 },
    rejected: { label: "Rejected", tone: "bg-red-500/15 text-red-200 border-red-300/20", icon: XCircle }
  }[status] ?? { label: status, tone: "bg-white/10 text-white border-white/15", icon: Clock3 };
  const Icon = config.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase ${config.tone}`}><Icon size={14} />{config.label}</span>;
}
