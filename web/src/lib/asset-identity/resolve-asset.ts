import { deterministicPalette, initialsForName } from "./initials";
import type { AssetRecord, ResolveAssetInput, ResolvedAsset } from "./types";
import { shapeFor } from "./types";

function sourceScore(asset: AssetRecord) {
  if (asset.source_kind === "verified_edit") return 4;
  if (asset.source_kind === "uploaded") return 3;
  if (asset.source_kind === "cdn") return 2;
  return 1;
}

function recordTime(asset: AssetRecord) {
  return Date.parse(asset.last_seen || asset.first_seen || "") || 0;
}

function recordUrl(asset: AssetRecord) {
  return asset.variants?.[0]?.url || asset.storage_key;
}

function recordSet(asset: AssetRecord) {
  const variants = asset.variants || [];
  return variants.length ? variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ") : undefined;
}

export function resolveAsset(input: ResolveAssetInput): ResolvedAsset {
  const { entity, kind, includePending = false } = input;
  const shape = shapeFor(entity.ref_type);
  const candidates = (input.assets || [])
    .filter((asset) => asset.ref_type === entity.ref_type && asset.ref_id === entity.ref_id && asset.kind === kind)
    .filter((asset) => asset.review_status !== "rejected")
    .filter((asset) => includePending || asset.review_status === "approved")
    .sort((left, right) => {
      const bySource = sourceScore(right) - sourceScore(left);
      if (bySource !== 0) return bySource;
      const byConfidence = right.confidence - left.confidence;
      if (byConfidence !== 0) return byConfidence;
      const byTime = recordTime(right) - recordTime(left);
      if (byTime !== 0) return byTime;
      return right.id.localeCompare(left.id);
    });

  const winner = candidates[0];
  if (winner) {
    return {
      type: "image",
      id: winner.id,
      src: recordUrl(winner),
      srcSet: recordSet(winner),
      shape,
      kind,
      source_kind: winner.source_kind,
      confidence: winner.confidence,
      review_status: winner.review_status
    };
  }

  return {
    type: "initials",
    initials: initialsForName(entity.display_name),
    shape,
    kind,
    palette: deterministicPalette(entity)
  };
}
