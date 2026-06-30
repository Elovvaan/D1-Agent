import { randomUUID } from "node:crypto";

export function ulid(prefix = "") {
  return `${prefix}${randomUUID()}`;
}

export function seasonFromEndYear(endYear) {
  const end = Number(endYear);
  return {
    id: `${end - 1}-${String(end).slice(-2)}`,
    start_year: end - 1,
    end_year: end,
    is_current: false
  };
}

export function endYearOf(season) {
  if (typeof season === "string") {
    const match = season.match(/^(\d{4})-(\d{2})$/);
    if (match) return Number(`20${match[2]}`);
    const year = season.match(/20\d{2}/)?.[0];
    return year ? Number(year) : new Date().getFullYear();
  }
  return Number(season.end_year);
}

export function currentAcademicSeason(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const end = month >= 7 ? year + 1 : year;
  return { ...seasonFromEndYear(end), is_current: true };
}
