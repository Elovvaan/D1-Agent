import { getImportedPlayers } from "@/lib/data/public-imports";
import { defaultAthleteId, getAthleteProfile, getBrandProfile } from "@/lib/data/services";

export async function getAthleteOnboardingData() {
  const athlete = getAthleteProfile(defaultAthleteId);
  const brand = getBrandProfile(defaultAthleteId);
  const importedPlayers = await getImportedPlayers();
  const importedMatches = importedPlayers
    .filter((player) => {
      const haystack = `${player.name} ${player.position ?? ""} ${player.jerseyNumber ?? ""}`.toLowerCase();
      return haystack.includes(athlete.fullName.split(" ")[0].toLowerCase()) || haystack.includes(athlete.primaryPosition.toLowerCase()) || haystack.includes(athlete.jerseyNumber ?? "");
    })
    .slice(0, 8);

  return {
    athlete,
    brand,
    importedPlayers,
    importedMatches,
    hasImportedRecords: importedPlayers.length > 0,
    schoolOptions: ["Air Force Academy Athletics", athlete.schoolName, "Manual school entry"],
    teamOptions: ["2026 Football Roster", `${athlete.schoolName} Varsity`, "Manual team entry"],
    sportOptions: ["Football", "Basketball", "Baseball", "Soccer", "Volleyball", "Track"],
    steps: [
      { title: "Sign up", detail: "Create the athlete account and secure the recruiting profile." },
      { title: "Assign progression", detail: "Set A1 Foundation, B1 Recruit, C1 College, or D1 Elite based on education level." },
      { title: "Select school / team / sport", detail: "Anchor the athlete to a school, team, sport, and position." },
      { title: "Claim public record", detail: "Use imported public roster data when available." },
      { title: "Complete profile", detail: "Add bio, hometown, academics, and measurables." },
      { title: "Connect Athlete Brand", detail: "Attach Instagram, TikTok, YouTube, Hudl, and website links." },
      { title: "Invite coach", detail: "Request verification for roster/player/profile fields." },
      { title: "Guardian consent", detail: "Required before minor outreach or contact routing leaves D1." },
      { title: "Preview and Command Center", detail: "Review public profile, then continue into the Agent workflow." }
    ]
  };
}
