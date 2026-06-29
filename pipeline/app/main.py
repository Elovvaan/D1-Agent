from uuid import UUID

from fastapi import FastAPI

from app.models import EntityResolutionRequest, PipelineJobRequest
from app.services import pipeline_service, public_sports_data_service

app = FastAPI(
    title="D1 Agent Pipeline",
    description="Context-aware sports data, streaming, and AI/video pipeline service.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/context/{game_id}")
def game_context(game_id: UUID):
    return public_sports_data_service.get_context(game_id)


@app.post("/entity-resolution")
def entity_resolution(request: EntityResolutionRequest):
    return public_sports_data_service.resolve_entity(request.confidence, request.evidence)


@app.post("/jobs")
def enqueue_job(request: PipelineJobRequest):
    return pipeline_service.enqueue(request)


@app.post("/live/{game_id}/tick")
def live_tick(game_id: UUID):
    return pipeline_service.run_live_tick(game_id)

