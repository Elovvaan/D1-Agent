ALTER TYPE public_import_entity_type ADD VALUE IF NOT EXISTS 'stat';

CREATE TABLE IF NOT EXISTS public_stat_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_id uuid NOT NULL REFERENCES public_import_entities(id),
  athlete_id uuid REFERENCES athletes(id),
  game_id uuid REFERENCES games(id),
  metric text NOT NULL,
  stat_value numeric,
  display_value text NOT NULL,
  source_url text NOT NULL,
  selector text,
  parser text NOT NULL,
  raw_snippet text,
  fetched_at timestamptz NOT NULL,
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  match_state text NOT NULL CHECK (match_state IN ('auto_matched', 'needs_review', 'rejected', 'approved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_stat_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_stat_record_id uuid NOT NULL REFERENCES public_stat_records(id),
  reason text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL CHECK (status IN ('pending_review', 'approved', 'corrected', 'rejected')) DEFAULT 'pending_review',
  evidence jsonb NOT NULL DEFAULT '{}',
  reviewed_by uuid REFERENCES memberships(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_stat_records_athlete ON public_stat_records(athlete_id, match_state);
CREATE INDEX IF NOT EXISTS idx_public_stat_records_import_entity ON public_stat_records(import_entity_id);
CREATE INDEX IF NOT EXISTS idx_public_stat_review_status ON public_stat_review_queue(status, priority);
