from uuid import UUID

from app.models import EntityResolutionResult, GameContext, PipelineJobRequest, PipelineJobResult, ProcessingState


class PublicSportsDataService:
    def resolve_entity(self, confidence: float, evidence: dict) -> EntityResolutionResult:
        if confidence >= 0.92:
            decision = "auto_merged"
        elif confidence >= 0.55:
            decision = "pending_review"
        else:
            decision = "rejected"
        return EntityResolutionResult(decision=decision, confidence=confidence, evidence=evidence)

    def get_context(self, game_id: UUID) -> GameContext:
        return GameContext(
            game_id=game_id,
            home_team="North Ridge High",
            away_team="Pine Creek",
            rosters=[
                {"full_name": "Jayden Carter", "jersey_number": "11", "position": "WR", "team": "home"},
                {"full_name": "Marcus Lee", "jersey_number": "7", "position": "QB", "team": "home"},
            ],
            coaches=[{"full_name": "Coach Davis", "role": "Head Coach", "team": "home"}],
            history={"previous_matchups": 2},
            known_starters=["Jayden Carter", "Marcus Lee"],
        )


class PipelineService:
    def enqueue(self, request: PipelineJobRequest) -> PipelineJobResult:
        context = request.context or public_sports_data_service.get_context(request.game_id)
        return PipelineJobResult(
            job_id=request.job_id,
            state=ProcessingState.queued,
            outputs={
                "context_loaded": True,
                "home_team": context.home_team,
                "away_team": context.away_team,
                "planned_steps": [
                    "transcode",
                    "scene_detection",
                    "highlight_scoring",
                    "player_identification",
                    "stat_extraction",
                    "starter_reel",
                ],
            },
        )

    def run_live_tick(self, game_id: UUID) -> PipelineJobResult:
        return PipelineJobResult(
            job_id=game_id,
            state=ProcessingState.processing,
            outputs={
                "live_events": [
                    "Touchdown detected",
                    "Highlight created",
                    "Player identified",
                    "Stats updated",
                    "Trust verification queued",
                ],
                "fallback": "post_stream_pipeline",
            },
        )


public_sports_data_service = PublicSportsDataService()
pipeline_service = PipelineService()

