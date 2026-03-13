-- Pumpline Database Schema
-- Run this in Supabase SQL Editor to create all tables, indexes, triggers, and RLS policies.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table: counties
-- ============================================
CREATE TABLE counties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  state       TEXT NOT NULL,
  state_full  TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  population  INTEGER,
  septic_pct  DECIMAL(5,2),
  meta_title  TEXT,
  meta_desc   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_counties_slug ON counties(slug);
CREATE INDEX idx_counties_state ON counties(state);
CREATE INDEX idx_counties_active ON counties(is_active) WHERE is_active = true;

-- ============================================
-- Table: providers
-- ============================================
CREATE TABLE providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id       UUID NOT NULL REFERENCES counties(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT NOT NULL,
  zip             TEXT,
  description     TEXT,
  services        TEXT[] NOT NULL DEFAULT '{}',
  service_area    TEXT,
  pricing_range   TEXT,
  response_time   TEXT,
  years_in_biz    INTEGER,
  license_number  TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_premium      BOOLEAN NOT NULL DEFAULT false,
  is_claimed      BOOLEAN NOT NULL DEFAULT false,
  claim_email     TEXT,
  photo_urls      TEXT[] DEFAULT '{}',
  avg_rating      DECIMAL(3,2) DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 100,
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','pending','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_county ON providers(county_id);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_status ON providers(status) WHERE status = 'active';
CREATE INDEX idx_providers_premium ON providers(is_premium) WHERE is_premium = true;
CREATE INDEX idx_providers_sort ON providers(county_id, sort_order, avg_rating DESC);

-- ============================================
-- Table: reviews
-- ============================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES providers(id),
  author_name   TEXT NOT NULL,
  author_city   TEXT,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT NOT NULL,
  service_type  TEXT,
  service_date  DATE,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','flagged')),
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_pending ON reviews(status) WHERE status = 'pending';
CREATE INDEX idx_reviews_approved ON reviews(provider_id, created_at DESC) WHERE status = 'approved';

-- ============================================
-- Table: leads
-- ============================================
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  source      TEXT NOT NULL DEFAULT 'checklist',
  county_slug TEXT,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);

-- ============================================
-- Table: admin_users
-- ============================================
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'moderator'
    CHECK (role IN ('moderator','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Trigger function: update provider review stats
-- Recomputes avg_rating and review_count on the
-- parent provider whenever a review is inserted,
-- updated, or deleted.
-- ============================================
CREATE OR REPLACE FUNCTION update_provider_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    avg_rating = COALESCE((
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        AND status = 'approved'
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        AND status = 'approved'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_review_stats();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Counties: anyone can SELECT where is_active = true
CREATE POLICY "Public can view active counties" ON counties
  FOR SELECT USING (is_active = true);

-- Providers: anyone can SELECT where status = 'active'
CREATE POLICY "Public can view active providers" ON providers
  FOR SELECT USING (status = 'active');

-- Reviews: anyone can SELECT where status = 'approved'
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Reviews: anyone can INSERT (new reviews default to pending)
CREATE POLICY "Public can submit reviews" ON reviews
  FOR INSERT WITH CHECK (status = 'pending');

-- Leads: anyone can INSERT
CREATE POLICY "Public can submit leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Admin users: no public access (service role bypasses RLS)
-- No policies created = no public access

-- ============================================
-- Admin RLS Policies
-- Authenticated users in admin_users table get full access
-- ============================================

-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Counties: admins can do everything
CREATE POLICY "Admins full access to counties" ON counties
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Providers: admins can do everything (including seeing inactive/suspended)
CREATE POLICY "Admins full access to providers" ON providers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Reviews: admins can read all statuses and update status
CREATE POLICY "Admins full access to reviews" ON reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Leads: admins can read all
CREATE POLICY "Admins can read leads" ON leads
  FOR SELECT USING (is_admin());

-- Admin users: admins can read their own table
CREATE POLICY "Admins can read admin_users" ON admin_users
  FOR SELECT USING (is_admin());
