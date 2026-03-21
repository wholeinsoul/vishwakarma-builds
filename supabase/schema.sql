-- Partypop Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: profiles
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Table: parties
-- ============================================================
CREATE TABLE parties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  child_name      TEXT NOT NULL,
  child_age       INTEGER NOT NULL CHECK (child_age BETWEEN 1 AND 18),
  theme           TEXT NOT NULL,
  headcount       INTEGER NOT NULL CHECK (headcount BETWEEN 1 AND 100),
  budget          INTEGER,
  venue_type      TEXT NOT NULL DEFAULT 'backyard'
    CHECK (venue_type IN ('backyard','park','indoor','venue','restaurant')),
  party_date      DATE,
  dietary_notes   TEXT,

  -- Generated plan (JSON blob from AI)
  plan_data       JSONB,
  plan_generated  BOOLEAN NOT NULL DEFAULT false,

  -- Premium features
  is_premium      BOOLEAN NOT NULL DEFAULT false,
  stripe_session  TEXT,

  -- RSVP
  rsvp_enabled    BOOLEAN NOT NULL DEFAULT false,
  rsvp_slug       TEXT UNIQUE,
  rsvp_deadline   DATE,

  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','generated','active','completed','archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parties_user ON parties(user_id);
CREATE INDEX idx_parties_rsvp_slug ON parties(rsvp_slug) WHERE rsvp_slug IS NOT NULL;
CREATE INDEX idx_parties_status ON parties(status);

ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their parties" ON parties
  FOR ALL USING (auth.uid() = user_id);

-- Allow public read of party by rsvp_slug (for RSVP pages)
CREATE POLICY "Public can read party by rsvp_slug" ON parties
  FOR SELECT USING (rsvp_slug IS NOT NULL AND rsvp_enabled = true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Table: rsvps
-- ============================================================
CREATE TABLE rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id        UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT,
  attending       TEXT NOT NULL DEFAULT 'pending'
    CHECK (attending IN ('yes','no','maybe','pending')),
  num_children    INTEGER NOT NULL DEFAULT 1,
  dietary_needs   TEXT,
  notes           TEXT,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rsvps_party ON rsvps(party_id);
CREATE UNIQUE INDEX idx_rsvps_party_email ON rsvps(party_id, guest_email) WHERE guest_email IS NOT NULL;

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit RSVPs (guests don't have accounts)
CREATE POLICY "Public can submit RSVPs" ON rsvps
  FOR INSERT WITH CHECK (true);

-- Party owner can read all RSVPs for their parties
CREATE POLICY "Party owner reads RSVPs" ON rsvps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM parties WHERE parties.id = rsvps.party_id AND parties.user_id = auth.uid())
  );

-- Allow public to read RSVPs by party (for count display on RSVP page)
CREATE POLICY "Public can read RSVP counts" ON rsvps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM parties WHERE parties.id = rsvps.party_id AND parties.rsvp_enabled = true)
  );

-- ============================================================
-- Table: theme_templates
-- ============================================================
CREATE TABLE theme_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  emoji           TEXT NOT NULL DEFAULT '🎉',
  description     TEXT,
  color_primary   TEXT NOT NULL DEFAULT '#22c55e',
  color_secondary TEXT NOT NULL DEFAULT '#15803d',
  prompt_context  TEXT NOT NULL,
  age_min         INTEGER DEFAULT 1,
  age_max         INTEGER DEFAULT 12,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 100
);

ALTER TABLE theme_templates ENABLE ROW LEVEL SECURITY;

-- Public can read active themes
CREATE POLICY "Public reads themes" ON theme_templates
  FOR SELECT USING (is_active = true);
