import { endYearOf } from "../types.mjs";

const ordinal = { freshman: 1, sophomore: 2, junior: 3, senior: 4, grad: 5 };
const wordMap = [
  [/\b(fr|fresh|freshman|frosh)\b/i, "freshman"],
  [/\b(so|soph|sophomore)\b/i, "sophomore"],
  [/\b(jr|jun|junior)\b/i, "junior"],
  [/\b(sr|sen|senior)\b/i, "senior"],
  [/\b(gr|grad|graduate|5th[-\s]?year|fifth[-\s]?year|6th[-\s]?year)\b/i, "grad"]
];
const gradeMap = { "9": "freshman", "10": "sophomore", "11": "junior", "12": "senior" };

export function normalizePlayerClass(raw, level = "hs") {
  const text = String(raw ?? "").trim();
  if (!text) return { normalized: "unknown", ordinal: null, redshirt: false, confidence: 0, raw: "", reason: "empty" };
  const redshirt = /\b(rs|r)[-\s]?(?=fr|so|jr|sr|fresh|soph|jun|sen)/i.test(text) || /redshirt/i.test(text);
  for (const [regex, cls] of wordMap) {
    if (!regex.test(text)) continue;
    if (cls === "grad" && level === "hs") return { normalized: "unknown", ordinal: null, redshirt, confidence: 0.2, raw: text, reason: "grad_class_on_hs_roster" };
    const confidence = level === "college" && (redshirt || cls === "grad") ? 0.55 : 0.95;
    return { normalized: cls, ordinal: ordinal[cls], redshirt: level === "college" ? redshirt : false, confidence, raw: text };
  }
  const numeric = text.replace(/(st|nd|rd|th)\b/i, "").match(/\b(9|10|11|12)\b/);
  if (numeric && level === "hs") {
    const cls = gradeMap[numeric[1]];
    return { normalized: cls, ordinal: ordinal[cls], redshirt: false, confidence: 0.9, raw: text };
  }
  if (numeric && level === "college") return { normalized: "unknown", ordinal: null, redshirt, confidence: 0.3, raw: text, reason: "numeric_grade_on_college_roster" };
  return { normalized: "unknown", ordinal: null, redshirt, confidence: 0.1, raw: text, reason: "unrecognized_token" };
}

export function inferGraduationYear({ resolution, season, level }) {
  if (resolution.ordinal == null || resolution.normalized === "unknown") {
    return { graduation_year: null, confidence: 0, nominal: level === "college", reason: "class_unresolved" };
  }
  const end = endYearOf(season);
  if (level === "hs") return { graduation_year: end + (4 - resolution.ordinal), confidence: Math.min(0.95, resolution.confidence), nominal: false };
  const ord = resolution.ordinal === 5 ? 4 : resolution.ordinal;
  return { graduation_year: end + (4 - ord), confidence: resolution.redshirt || resolution.normalized === "grad" ? 0.25 : 0.45, nominal: true, reason: "college_nominal" };
}

export function classForSeason(graduationYear, season) {
  const end = endYearOf(season);
  const ord = 4 - (graduationYear - end);
  if (ord > 4) return { normalized: "grad", ordinal: null, graduated: true, pre_enrollment: false };
  if (ord < 1) return { normalized: "unknown", ordinal: null, graduated: false, pre_enrollment: true };
  return { normalized: { 1: "freshman", 2: "sophomore", 3: "junior", 4: "senior" }[ord], ordinal: ord, graduated: false, pre_enrollment: false };
}
