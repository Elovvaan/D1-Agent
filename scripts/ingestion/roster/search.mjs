export function parseRosterQuery(input) {
  const raw = String(input ?? "").trim();
  const lower = raw.toLowerCase();
  const query = { intent: "roster", raw };
  const year = lower.match(/\b(20\d{2})\b/);
  if (year) query.season_id = `${Number(year[1])}-${String(Number(year[1]) + 1).slice(2)}`;
  if (/\blast\s+year\b/.test(lower)) query.relative_season = -1;
  else if (/\b(two|2)\s+years?\s+ago|prior\s+year\b/.test(lower)) query.relative_season = -2;
  else if (/\bthis\s+year\b|\bcurrent\b/.test(lower)) query.relative_season = 0;
  for (const [word, cls] of Object.entries({ freshman: "freshman", freshmen: "freshman", sophomore: "sophomore", sophomores: "sophomore", junior: "junior", juniors: "junior", senior: "senior", seniors: "senior" })) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) {
      query.class = cls;
      query.intent = "players";
      break;
    }
  }
  query.sport = ["football", "basketball", "baseball", "softball", "soccer", "volleyball", "lacrosse", "hockey", "wrestling", "track", "tennis", "golf"].find((sport) => new RegExp(`\\b${sport}\\b`).test(lower));
  if (/\bmaxpreps\b/.test(lower)) query.source_key = "maxpreps";
  if (/\buhsaa\b/.test(lower)) query.source_key = "uhsaa";
  return query;
}
