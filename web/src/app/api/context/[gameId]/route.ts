import { NextResponse } from "next/server";
import { publicSportsDataEngine } from "@/lib/services/public-sports-data-engine";

export async function GET(_: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const context = publicSportsDataEngine.buildGameContext({
    gameId,
    homeTeam: "North Ridge High",
    awayTeam: "Pine Creek",
    rosters: [
      { fullName: "Jayden Carter", jerseyNumber: "11", position: "WR", team: "home" },
      { fullName: "Marcus Lee", jerseyNumber: "7", position: "QB", team: "home" }
    ],
    coaches: [{ fullName: "Coach Davis", role: "Head Coach", team: "home" }],
    history: { previousMatchups: 2, lastResult: "North Ridge 28, Pine Creek 21" },
    knownStarters: ["Jayden Carter", "Marcus Lee"]
  });

  return NextResponse.json(context);
}

