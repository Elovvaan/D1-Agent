import { Instagram, PlaySquare, Radio, Youtube } from "lucide-react";
import { runMediaSync } from "@/app/actions/media-connection-actions";
import type { MediaConnection } from "@/lib/services/media-agent-service";
import { MediaSyncStatus } from "@/components/media-sync-status";

const platformIcons = {
  instagram: Instagram,
  tiktok: PlaySquare,
  youtube: Youtube,
  x: Radio,
  facebook: Radio
};

export function MediaConnectionCard({ connection, mode = "athlete" }: { connection: MediaConnection; mode?: "athlete" | "operations" }) {
  const Icon = platformIcons[connection.platform] ?? Radio;
  return (
    <div className="rounded-[26px] border border-white/12 bg-white/[0.06] p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]"><Icon size={20} /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8CFF00]">{connection.platform}</p>
            <h3 className="text-xl font-black">{connection.handle || "Connected account"}</h3>
            <p className="text-xs font-semibold text-[#CAD7FF]">{connection.athleteName}</p>
          </div>
        </div>
        <MediaSyncStatus status={connection.status} />
      </div>
      {connection.profileUrl ? <a className="mt-4 block truncate rounded-2xl border border-white/10 bg-[#071A43] px-3 py-2 text-xs font-semibold text-[#CAD7FF]" href={connection.profileUrl} target="_blank" rel="noreferrer">{connection.profileUrl}</a> : null}
      <div className="mt-4 flex flex-wrap gap-2">{connection.permissionScope.map((scope) => <span key={scope} className="rounded-full bg-white/[0.08] px-3 py-1 text-[11px] font-black uppercase text-[#CAD7FF]">{scope.replaceAll("_", " ")}</span>)}</div>
      {mode === "operations" ? <form action={runMediaSync} className="mt-5"><input type="hidden" name="connectionId" value={connection.id} /><input type="hidden" name="athleteId" value={connection.athleteId} /><input type="hidden" name="athleteName" value={connection.athleteName} /><input type="hidden" name="platform" value={connection.platform} /><button className="min-h-11 rounded-2xl bg-[#8CFF00] px-5 text-sm font-black uppercase text-[#061331]" type="submit">Queue sync check</button></form> : null}
    </div>
  );
}
