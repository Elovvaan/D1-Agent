export type CompetitionDivision = "A1" | "B1" | "D1" | "Unassigned";

export function calculateAge(dateOfBirth?: string, asOf = new Date()) {
  if (!dateOfBirth) return undefined;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  let age = asOf.getFullYear() - birthDate.getFullYear();
  const monthDelta = asOf.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

export function competitionDivisionForAge(age?: number): CompetitionDivision {
  if (typeof age !== "number") return "Unassigned";
  if (age >= 13 && age <= 15) return "A1";
  if (age >= 16 && age <= 18) return "B1";
  if (age > 18) return "D1";
  return "Unassigned";
}

export function competitionDivisionLabel(division?: string) {
  if (division === "A1") return "A1 · Ages 13–15";
  if (division === "B1") return "B1 · Ages 16–18";
  if (division === "D1") return "D1 / Open · 18+";
  return "Unassigned";
}

export function deriveAthleteEligibility(dateOfBirth?: string) {
  const age = calculateAge(dateOfBirth);
  const competitionDivision = competitionDivisionForAge(age);
  return { age, competitionDivision, competitionDivisionLabel: competitionDivisionLabel(competitionDivision) };
}
