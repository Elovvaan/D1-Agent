export type IdentityRefType = "Athlete" | "Coach" | "School" | "Organization" | "Team" | "User";
export type AssetKind = "headshot" | "logo" | "mascot" | "wordmark";
export type AssetSourceKind = "uploaded" | "verified_edit" | "scraped" | "cdn";
export type AssetReviewStatus = "approved" | "pending" | "rejected";
export type AssetShape = "circle" | "rounded-square";

export type CanonicalIdentityRef = {
  ref_type: IdentityRefType;
  ref_id: string;
  display_name: string;
};

export type AssetVariant = {
  width: number;
  height: number;
  url: string;
};

export type AssetRecord = {
  id: string;
  ref_type: IdentityRefType;
  ref_id: string;
  kind: AssetKind;
  storage_key: string;
  source_kind: AssetSourceKind;
  source_url?: string;
  uploaded_by?: string;
  confidence: number;
  review_status: AssetReviewStatus;
  colors?: string[];
  crop?: { shape?: AssetShape; box?: { x: number; y: number; width: number; height: number } };
  variants?: AssetVariant[];
  first_seen?: string;
  last_seen?: string;
};

export type ResolvedAsset =
  | { type: "image"; id: string; src: string; srcSet?: string; shape: AssetShape; kind: AssetKind; source_kind: AssetSourceKind; confidence: number; review_status: AssetReviewStatus }
  | { type: "initials"; initials: string; shape: AssetShape; kind: AssetKind; palette: { bg: string; fg: string } };

export type ResolveAssetInput = {
  entity: CanonicalIdentityRef;
  kind: AssetKind;
  assets?: AssetRecord[];
  includePending?: boolean;
};

export function shapeFor(refType: IdentityRefType): AssetShape {
  return refType === "Athlete" || refType === "Coach" || refType === "User" ? "circle" : "rounded-square";
}
