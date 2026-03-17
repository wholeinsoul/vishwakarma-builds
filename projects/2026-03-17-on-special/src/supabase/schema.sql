-- =============================================
-- On Special — Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- BAR PROFILES
CREATE TABLE bar_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_name TEXT NOT NULL DEFAULT '',
  brand_voice TEXT NOT NULL DEFAULT 'casual',
  default_hashtags TEXT[] DEFAULT '{}',
  social_handles JSONB DEFAULT '{}',
  logo_url TEXT,
  location_city TEXT,
  location_state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bar_profiles_user_id_unique UNIQUE(user_id)
);

-- GENERATIONS (content history)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_profile_id UUID REFERENCES bar_profiles(id) ON DELETE SET NULL,
  specials_text TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'daily_special',
  instagram_caption TEXT,
  instagram_hashtags TEXT[],
  facebook_post TEXT,
  google_update TEXT,
  model_used TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generations_user_created
  ON generations(user_id, created_at DESC);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_id_unique UNIQUE(user_id)
);

-- RATE LIMITING
CREATE TABLE rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- ROW LEVEL SECURITY
ALTER TABLE bar_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own bar_profiles"
  ON bar_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users access own generations"
  ON generations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users access own rate_limits"
  ON rate_limits FOR ALL
  USING (auth.uid() = user_id);

-- Note: Service role bypasses RLS by default, no policy needed for webhooks.

-- RATE LIMIT INCREMENT FUNCTION (atomic upsert)
CREATE OR REPLACE FUNCTION increment_rate_limit(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO rate_limits (user_id, date, generation_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET generation_count = rate_limits.generation_count + 1;
END;
$$;
