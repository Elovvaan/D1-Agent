import type { CanonicalIdentityRef } from "./types";

const SWATCHES = [
  { bg: "#1B3FA0", fg: "#FFFFFF" },
  { bg: "#0A1A3F", fg: "#FFFFFF" },
  { bg: "#F2C200", fg: "#0A1A3F" },
  { bg: "#2563EB", fg: "#FFFFFF" },
  { bg: "#17833F", fg: "#FFFFFF" },
  { bg: "#7C3AED", fg: "#FFFFFF" }
] as const;

function hashValue(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function initialsForName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ID";
  const first = parts[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1] || "" : "";
  return last ? `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() : first.slice(0, 2).toUpperCase();
}

export function deterministicPalette(entity: CanonicalIdentityRef) {
  const index = hashValue(`${entity.ref_type}:${entity.ref_id}`) % SWATCHES.length;
  return SWATCHES[index] || SWATCHES[0];
}
