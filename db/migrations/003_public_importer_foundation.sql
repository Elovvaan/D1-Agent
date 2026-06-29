DO $$ BEGIN
  CREATE TYPE public_import_entity_type AS ENUM ('school', 'team', 'player', 'coach', 'game', 'stream');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public_import_decision AS ENUM ('auto_merged', 'pending_review', 'rejected', 'manual_merged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public_claim_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE imported_verification_status AS ENUM ('pending', 'approved', 'corrected', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public_import_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  source_title text,
  parser_version text NOT NULL,
  fetched_at timestamptz NOT NULL,
  http_status int NOT NULL,
  entity_count int NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  artifact_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_import_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_run_id uuid NOT NULL REFERENCES public_import_runs(id),
  entity_type public_import_entity_type NOT NULL,
  source_ref text NOT NULL,
  source_url text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (import_run_id, source_ref)
);

CREATE TABLE IF NOT EXISTS public_import_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_id uuid NOT NULL REFERENCES public_import_entities(id),
  field_name text NOT NULL,
  field_value text NOT NULL,
  source_url text NOT NULL,
  selector text,
  parser text NOT NULL,
  raw_snippet text,
  fetched_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_import_entity_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_id uuid NOT NULL REFERENCES public_import_entities(id),
  entity_type public_import_entity_type NOT NULL,
  existing_entity_id uuid,
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  decision public_import_decision NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}',
  reviewed_by uuid REFERENCES memberships(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_import_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_match_id uuid NOT NULL REFERENCES public_import_entity_matches(id),
  reason text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status public_import_decision NOT NULL DEFAULT 'pending_review',
  assigned_to uuid REFERENCES memberships(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athlete_claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_id uuid NOT NULL REFERENCES public_import_entities(id),
  athlete_user_id uuid NOT NULL REFERENCES users(id),
  status public_claim_status NOT NULL DEFAULT 'pending',
  evidence jsonb NOT NULL DEFAULT '{}',
  reviewed_by uuid REFERENCES memberships(id),
  reviewed_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coach_imported_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_entity_id uuid NOT NULL REFERENCES public_import_entities(id),
  coach_membership_id uuid NOT NULL REFERENCES memberships(id),
  status imported_verification_status NOT NULL DEFAULT 'pending',
  corrected_fields jsonb NOT NULL DEFAULT '[]',
  note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_import_runs_url ON public_import_runs(source_url);
CREATE INDEX IF NOT EXISTS idx_public_import_entities_run ON public_import_entities(import_run_id);
CREATE INDEX IF NOT EXISTS idx_public_import_fields_entity ON public_import_fields(import_entity_id);
CREATE INDEX IF NOT EXISTS idx_public_import_review_status ON public_import_review_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_athlete_claim_requests_status ON athlete_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_coach_imported_verifications_status ON coach_imported_verifications(status);
