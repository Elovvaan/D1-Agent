import { NextResponse } from "next/server";
import { streamingEngine } from "@/lib/services/streaming-engine";

export async function POST(request: Request) {
  const body = (await request.json()) as { gameId: string; provider?: "mux" | "cloudflare_stream" };
  return NextResponse.json(
    streamingEngine.provisionLiveInput({
      gameId: body.gameId,
      provider: body.provider ?? "mux"
    })
  );
}

