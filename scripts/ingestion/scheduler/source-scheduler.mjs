export const refreshTiers = {
  DIRECTORY: "DIRECTORY",
  SEASONAL: "SEASONAL",
  LIVE: "LIVE"
};

export function refreshTierForSource(source) {
  const type = String(source?.source_type ?? "").toLowerCase();
  if (/score|live|stream/.test(type)) return refreshTiers.LIVE;
  if (/ranking|stats|schedule|roster|season|game/.test(type)) return refreshTiers.SEASONAL;
  return refreshTiers.DIRECTORY;
}

export function sourceSchedulerNote(source) {
  const tier = refreshTierForSource(source);
  if (tier === refreshTiers.LIVE) return "Hourly or event-driven during game windows.";
  if (tier === refreshTiers.SEASONAL) return "Daily in-season; paused or reduced off-season.";
  return "Weekly or operator-triggered directory refresh.";
}
