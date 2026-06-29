DO $$ BEGIN
  CREATE TYPE brand_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'hudl', 'website');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE brand_recommendation_status AS ENUM ('new', 'accepted', 'dismissed', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL UNIQUE REFERENCES athletes(id),
  headline text NOT NULL,
  summary text NOT NULL,
  profile_completion_pct int NOT NULL DEFAULT 0 CHECK (profile_completion_pct BETWEEN 0 AND 100),
  recruiting_goals jsonb NOT NULL DEFAULT '[]',
  privacy_settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coach_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  membership_id uuid NOT NULL UNIQUE REFERENCES memberships(id),
  org_id uuid NOT NULL REFERENCES orgs(id),
  title text NOT NULL,
  bio text,
  verified boolean NOT NULL DEFAULT false,
  verification_queue_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  membership_id uuid NOT NULL UNIQUE REFERENCES memberships(id),
  org_id uuid NOT NULL REFERENCES orgs(id),
  title text NOT NULL,
  territory jsonb NOT NULL DEFAULT '[]',
  position_groups jsonb NOT NULL DEFAULT '[]',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id),
  game_id uuid REFERENCES games(id),
  asset_id uuid REFERENCES media_assets(id),
  title text NOT NULL,
  kind media_type NOT NULL,
  duration_s int,
  view_count int NOT NULL DEFAULT 0,
  processing_state processing_state NOT NULL DEFAULT 'queued',
  visibility visibility_type NOT NULL DEFAULT 'recruiters_only',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athlete_brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL UNIQUE REFERENCES athletes(id),
  instagram_handle text,
  tiktok_handle text,
  youtube_handle text,
  hudl_url text,
  website_url text,
  followers int NOT NULL DEFAULT 0,
  weekly_reach int NOT NULL DEFAULT 0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  profile_clicks int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athlete_brand_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id uuid NOT NULL REFERENCES athlete_brand_profiles(id),
  platform brand_platform NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  impressions int NOT NULL DEFAULT 0,
  engagements int NOT NULL DEFAULT 0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  posted_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athlete_brand_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id uuid NOT NULL REFERENCES athlete_brand_profiles(id),
  recommendation text NOT NULL,
  rationale text,
  status brand_recommendation_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_profiles_org ON coach_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_org ON recruiter_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_films_athlete_state ON films(athlete_id, processing_state);
CREATE INDEX IF NOT EXISTS idx_brand_posts_profile_time ON athlete_brand_posts(brand_profile_id, posted_at DESC);
