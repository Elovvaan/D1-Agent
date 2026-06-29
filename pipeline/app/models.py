from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ProcessingState(str, Enum):
    queued = "queued"
    processing = "processing"
    ready = "ready"
    failed = "failed"


class RosterSide(str, Enum):
    home = "home"
    away = "away"


class RosterPlayer(BaseModel):
    athlete_id: UUID | None = None
    external_player_id: UUID | None = None
    full_name: str
    jersey_number: str | None = None
    position: str | None = None
    team: RosterSide


class CoachContext(BaseModel):
    full_name: str
    role: str
    team: RosterSide


class GameContext(BaseModel):
    game_id: UUID
    home_team: str
    away_team: str
    rosters: list[RosterPlayer]
    coaches: list[CoachContext]
    history: dict[str, Any] = Field(default_factory=dict)
    known_starters: list[str] = Field(default_factory=list)


class PipelineJobRequest(BaseModel):
    job_id: UUID
    game_id: UUID
    media_asset_id: UUID
    source_url: str
    context: GameContext | None = None


class PipelineJobResult(BaseModel):
    job_id: UUID
    state: ProcessingState
    reason: str | None = None
    outputs: dict[str, Any] = Field(default_factory=dict)


class EntityResolutionRequest(BaseModel):
    entity_type: str
    confidence: float = Field(ge=0, le=1)
    evidence: dict[str, Any] = Field(default_factory=dict)


class EntityResolutionResult(BaseModel):
    decision: str
    confidence: float
    evidence: dict[str, Any]

