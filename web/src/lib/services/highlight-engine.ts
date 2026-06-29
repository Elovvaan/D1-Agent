import type { GameContext, PipelineJobResult } from "@d1/shared";

export interface CandidateSegment {
  startS: number;
  endS: number;
  labels: string[];
  confidence: number;
}

export class HighlightEngine {
  scoreSegments(segments: CandidateSegment[], context: GameContext) {
    const jerseyBoost = context.rosters.length > 0 ? 0.08 : 0;
    return segments.map((segment) => ({
      ...segment,
      score: Math.min(1, segment.confidence + jerseyBoost + (segment.labels.includes("touchdown") ? 0.18 : 0))
    }));
  }

  assembleStarterReel(jobId: string, segments: CandidateSegment[]): PipelineJobResult {
    return {
      jobId,
      state: "ready",
      outputs: {
        clips: segments.length,
        reelVisibility: "recruiters_only"
      }
    };
  }
}

export const highlightEngine = new HighlightEngine();

