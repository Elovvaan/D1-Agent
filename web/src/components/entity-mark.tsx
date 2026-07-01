import { resolveAsset } from "@/lib/asset-identity/resolve-asset";
import type { AssetRecord, AssetKind, CanonicalIdentityRef } from "@/lib/asset-identity/types";

export function EntityMark({ entity, kind, assets = [], size = 44 }: { entity: CanonicalIdentityRef; kind: AssetKind; assets?: AssetRecord[]; size?: number }) {
  const resolved = resolveAsset({ entity, kind, assets });
  const borderRadius = resolved.shape === "circle" ? "50%" : Math.max(6, Math.round(size * 0.18));
  if (resolved.type === "image") {
    return <img src={resolved.src} srcSet={resolved.srcSet} alt={entity.display_name} width={size} height={size} style={{ width: size, height: size, borderRadius, border: "1px solid #DDE3EC", background: "#FAFBFD", objectFit: kind === "logo" ? "contain" : "cover", padding: kind === "logo" ? Math.round(size * 0.12) : 0 }} />;
  }
  return <span role="img" aria-label={entity.display_name} style={{ width: size, height: size, borderRadius, border: "1px solid #DDE3EC", background: resolved.palette.bg, color: resolved.palette.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: Math.round(size * 0.36), flexShrink: 0 }}>{resolved.initials}</span>;
}
