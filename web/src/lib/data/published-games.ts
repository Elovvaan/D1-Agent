import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type PublishedGame = {
  id: string; state: string; sport: string; homeTeam: string; awayTeam: string; school?: string; venue?: string;
  gameDate: string; gameTime?: string; status: string; title: string; notes?: string; thumbnailUrl?: string; videoUrl?: string; publishTo?: string[];
};

export function getPublishedGames(destination: string) {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "games.json");
    if (!existsSync(filePath)) return [] as PublishedGame[];
    const data = JSON.parse(readFileSync(filePath, "utf8")) as { items?: PublishedGame[] };
    return (data.items ?? []).filter((game) => destination === "games" || (game.publishTo ?? []).includes(destination));
  } catch {
    return [] as PublishedGame[];
  }
}
