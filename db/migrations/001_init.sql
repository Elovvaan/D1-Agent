CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE membership_role AS ENUM ('athlete', 'parent', 'coach', 'recruiter', 'scout', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('active', 'pending', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE org_type AS ENUM ('high_school', 'club', 'college', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE division_type AS ENUM ('ncaa_d1', 'ncaa_d2', 'ncaa_d3', 'naia', 'juco');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE visibility_type AS ENUM ('public', 'recruiters_only', 'private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE test_type AS ENUM ('sat', 'act', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE game_source AS ENUM ('stream', 'upload', 'external');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('scheduled', 'live', 'processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE stream_state AS ENUM ('idle', 'live', 'ended', 'errored');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('full_game', 'clip', 'highlight_reel', 'thumbnail');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE processing_state AS ENUM ('queued', 'processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE stat_source AS ENUM ('self', 'ai_extracted', 'coach_verified', 'external', 'public_record', 'multi_source');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE verification_subject AS ENUM ('stat', 'measurable', 'roster', 'game_data', 'recommendation', 'academics');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'corrected', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE trust_tier AS ENUM ('low', 'fair', 'good', 'excellent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE trust_factor AS ENUM ('coach_verified', 'stats_matched', 'gpa_verified', 'film_uploaded', 'recommendations', 'identity_verified', 'public_record_matched', 'multi_source_verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE factor_status AS ENUM ('met', 'partial', 'unmet');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE interest_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE match_stage AS ENUM ('prospect', 'contacted', 'responded', 'evaluating', 'offer', 'committed', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'complete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE campaign_creator AS ENUM ('agent', 'athlete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE outreach_channel AS ENUM ('in_app', 'email');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE approval_state AS ENUM ('pending_approval', 'approved', 'sent', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE response_state AS ENUM ('none', 'opened', 'replied', 'interested', 'passed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('profile_view', 'position_demand', 'showcase', 'teammate_news', 'reel_views_up', 'scholarship', 'agent_recommendation', 'new_match', 'coach_open');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE opportunity_state AS ENUM ('new', 'seen', 'acted', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE timeline_event_type AS ENUM ('game_uploaded', 'ai_processing', 'highlights_generated', 'stats_extracted', 'verification_requested', 'coach_verified', 'trust_increased', 'recruiter_viewed', 'match_updated', 'outreach_drafted', 'recruiter_responded', 'offer_received');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE data_source_kind AS ENUM ('schools', 'schedules', 'rosters', 'stats', 'streams', 'box_scores', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE ingest_state AS ENUM ('queued', 'running', 'succeeded', 'partial', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE roster_status AS ENUM ('active', 'inactive', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE stream_platform AS ENUM ('youtube', 'hudl', 'nfhs', 'facebook', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('school', 'team', 'player', 'coach', 'game', 'stream');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE d1_type AS ENUM ('org', 'athlete', 'membership', 'game', 'stream');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE entity_decision AS ENUM ('auto_merged', 'pending_review', 'rejected', 'manual_merged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  phone text,
  password_hash text,
  full_name text NOT NULL,
  avatar_url text,
  status user_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type org_type NOT NULL,
  name text NOT NULL,
  division division_type,
  city text,
  state text,
  country text DEFAULT 'US',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  role membership_role NOT NULL,
  org_id uuid REFERENCES orgs(id),
  status membership_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  is_minor boolean NOT NULL DEFAULT false,
  class_year int NOT NULL,
  primary_position text NOT NULL,
  secondary_position text,
  sport text NOT NULL DEFAULT 'football',
  hometown text,
  current_org_id uuid REFERENCES orgs(id),
  bio text,
  visibility visibility_type NOT NULL DEFAULT 'private',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES users(id),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  relationship text NOT NULL,
  consent_signed boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  type text NOT NULL,
  storage_key text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS measurables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  height_in numeric,
  weight_lb numeric,
  forty_yd numeric,
  vertical_in numeric,
  bench_lb numeric,
  wingspan_in numeric,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES memberships(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  gpa numeric,
  test_type test_type NOT NULL DEFAULT 'none',
  test_score int,
  transcript_doc_id uuid REFERENCES documents(id),
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES memberships(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id),
  org_id uuid REFERENCES orgs(id),
  opponent text NOT NULL,
  game_date date NOT NULL,
  location text,
  result text,
  source game_source NOT NULL,
  status game_status NOT NULL DEFAULT 'scheduled',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id),
  ingest_url text NOT NULL,
  playback_url text,
  youtube_url text,
  state stream_state NOT NULL DEFAULT 'idle',
  started_at timestamptz,
  ended_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id),
  type media_type NOT NULL,
  storage_key text NOT NULL,
  duration_s int,
  width int,
  height int,
  processing_state processing_state NOT NULL DEFAULT 'queued',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  game_id uuid REFERENCES games(id),
  asset_id uuid NOT NULL REFERENCES media_assets(id),
  title text NOT NULL,
  ai_generated boolean NOT NULL DEFAULT true,
  play_type text,
  start_s numeric,
  end_s numeric,
  score numeric,
  published boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  title text NOT NULL,
  asset_id uuid REFERENCES media_assets(id),
  visibility visibility_type NOT NULL DEFAULT 'recruiters_only',
  view_count int NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reel_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id),
  highlight_id uuid NOT NULL REFERENCES highlights(id),
  position int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  game_id uuid REFERENCES games(id),
  metric text NOT NULL,
  value numeric NOT NULL,
  source stat_source NOT NULL,
  source_refs jsonb,
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES memberships(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  coach_membership_id uuid NOT NULL REFERENCES memberships(id),
  subject_type verification_subject NOT NULL,
  subject_id uuid NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  coach_membership_id uuid NOT NULL REFERENCES memberships(id),
  body text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  signed boolean NOT NULL DEFAULT false,
  signed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  score int NOT NULL CHECK (score BETWEEN 0 AND 100),
  tier trust_tier NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_score_id uuid NOT NULL REFERENCES trust_scores(id),
  factor trust_factor NOT NULL,
  status factor_status NOT NULL,
  weight numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  conference text,
  positional_needs jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  college_id uuid NOT NULL REFERENCES colleges(id),
  match_pct int NOT NULL CHECK (match_pct BETWEEN 0 AND 100),
  interest_level interest_level NOT NULL,
  reasons jsonb NOT NULL DEFAULT '[]',
  saved boolean NOT NULL DEFAULT false,
  stage match_stage NOT NULL DEFAULT 'prospect',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  goal text NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  created_by campaign_creator NOT NULL DEFAULT 'agent',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES outreach_campaigns(id),
  college_id uuid NOT NULL REFERENCES colleges(id),
  recruiter_user_id uuid REFERENCES users(id),
  channel outreach_channel NOT NULL,
  draft_body text NOT NULL,
  approval_state approval_state NOT NULL DEFAULT 'pending_approval',
  sent_at timestamptz,
  response_state response_state NOT NULL DEFAULT 'none',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_user_id uuid NOT NULL REFERENCES users(id),
  recipient_user_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id),
  type text NOT NULL,
  title text NOT NULL,
  location text,
  starts_at timestamptz,
  source text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id),
  actor_user_id uuid REFERENCES users(id),
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id),
  action_type text NOT NULL,
  status text NOT NULL,
  input jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  requires_approval boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  type opportunity_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  rationale text NOT NULL,
  action_type text,
  relevance numeric NOT NULL DEFAULT 0,
  state opportunity_state NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  event_type timeline_event_type NOT NULL,
  ref_type text,
  ref_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  score int NOT NULL CHECK (score BETWEEN 0 AND 100),
  inputs jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind data_source_kind NOT NULL,
  base_url text NOT NULL,
  auth jsonb,
  trust_weight numeric NOT NULL DEFAULT 0.5,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_ingest_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  scope jsonb NOT NULL DEFAULT '{}',
  state ingest_state NOT NULL DEFAULT 'queued',
  counts jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  source_ref text NOT NULL,
  name text NOT NULL,
  city text,
  state text,
  country text,
  division text,
  conference text,
  league text,
  raw jsonb NOT NULL DEFAULT '{}',
  resolved_org_id uuid REFERENCES orgs(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_source_id, source_ref)
);

CREATE TABLE IF NOT EXISTS external_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_school_id uuid NOT NULL REFERENCES external_schools(id),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  source_ref text NOT NULL,
  sport text NOT NULL,
  season text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_source_id, source_ref)
);

CREATE TABLE IF NOT EXISTS external_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_team_id uuid NOT NULL REFERENCES external_teams(id),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  source_ref text NOT NULL,
  full_name text NOT NULL,
  jersey_number text,
  position text,
  class_year int,
  height_in numeric,
  weight_lb numeric,
  raw jsonb NOT NULL DEFAULT '{}',
  resolved_athlete_id uuid REFERENCES athletes(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_source_id, source_ref)
);

CREATE TABLE IF NOT EXISTS external_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_team_id uuid NOT NULL REFERENCES external_teams(id),
  external_player_id uuid NOT NULL REFERENCES external_players(id),
  season text NOT NULL,
  status roster_status NOT NULL DEFAULT 'unknown',
  starter boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_team_id uuid NOT NULL REFERENCES external_teams(id),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  source_ref text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  raw jsonb NOT NULL DEFAULT '{}',
  resolved_membership_id uuid REFERENCES memberships(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_source_id, source_ref)
);

CREATE TABLE IF NOT EXISTS external_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  source_ref text NOT NULL,
  home_external_team_id uuid NOT NULL REFERENCES external_teams(id),
  away_external_team_id uuid NOT NULL REFERENCES external_teams(id),
  game_date timestamptz NOT NULL,
  location text,
  result text,
  box_score jsonb,
  raw jsonb NOT NULL DEFAULT '{}',
  resolved_game_id uuid REFERENCES games(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_source_id, source_ref)
);

CREATE TABLE IF NOT EXISTS external_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_player_id uuid NOT NULL REFERENCES external_players(id),
  external_game_id uuid REFERENCES external_games(id),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  metric text NOT NULL,
  value numeric NOT NULL,
  season text,
  raw jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_game_id uuid REFERENCES external_games(id),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  url text NOT NULL,
  platform stream_platform NOT NULL,
  scheduled_at timestamptz,
  resolved_stream_id uuid REFERENCES streams(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type NOT NULL,
  external_id uuid NOT NULL,
  d1_type d1_type NOT NULL,
  d1_id uuid,
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  decision entity_decision NOT NULL,
  reviewed_by uuid REFERENCES memberships(id),
  reviewed_at timestamptz,
  evidence jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_scores_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  score int NOT NULL CHECK (score BETWEEN 0 AND 100),
  inputs jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_role ON memberships(user_id, role);
CREATE INDEX IF NOT EXISTS idx_athletes_user ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_athlete_relevance ON opportunities(athlete_id, relevance DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_athlete_time ON timeline_events(athlete_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_entity_matches_decision ON entity_matches(decision);

