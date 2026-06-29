export interface StreamProvisionRequest {
  gameId: string;
  provider: "mux" | "cloudflare_stream";
  youtubeRestreamUrl?: string;
}

export class StreamingEngine {
  provisionLiveInput(request: StreamProvisionRequest) {
    return {
      gameId: request.gameId,
      ingestUrl: `rtmp://ingest.d1.local/live/${request.gameId}`,
      playbackUrl: `https://playback.d1.local/${request.gameId}/index.m3u8`,
      provider: request.provider,
      state: "idle" as const
    };
  }

  transition(state: "idle" | "live" | "ended" | "errored", event: "start" | "end" | "error") {
    if (event === "start") return "live";
    if (event === "end") return "ended";
    if (event === "error") return "errored";
    return state;
  }
}

export const streamingEngine = new StreamingEngine();

