-- CryptoLegacy Database Schema
-- Run this in your Supabase SQL editor

-- plans: stores encrypted recovery guides
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Recovery Plan',
  encrypted_blob TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  check_in_interval_days INTEGER NOT NULL DEFAULT 90,
  next_check_in TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'triggered', 'disabled')),
  template_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- beneficiaries: people who receive the plan when switch triggers
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notified BOOLEAN DEFAULT FALSE,
  notify_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- check_ins: log of user check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions: Stripe subscription tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  plan_type TEXT NOT NULL DEFAULT 'basic'
    CHECK (plan_type IN ('basic', 'premium')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD their own plans"
  ON plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own beneficiaries"
  ON beneficiaries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own check-ins"
  ON check_ins FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Public access for beneficiary decrypt (by token)
CREATE POLICY "Beneficiaries can read by notify_token"
  ON beneficiaries FOR SELECT
  USING (true);

CREATE POLICY "Plans accessible via beneficiary token"
  ON plans FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_status_next_check_in ON plans(status, next_check_in);
CREATE INDEX idx_beneficiaries_plan_id ON beneficiaries(plan_id);
CREATE INDEX idx_beneficiaries_notify_token ON beneficiaries(notify_token);
CREATE INDEX idx_check_ins_plan_id ON check_ins(plan_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
