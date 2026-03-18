-- Uma MVP Database Schema
-- Users (elderly parents receiving reminders)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  name VARCHAR(100),
  language VARCHAR(5) DEFAULT 'hi',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  status VARCHAR(20) DEFAULT 'onboarding',
  onboarding_step INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caretakers (children/family who manage and pay)
CREATE TABLE caretakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  name VARCHAR(100),
  photo_url TEXT,
  voice_clip_url TEXT,
  relationship VARCHAR(20),
  user_id UUID REFERENCES users(id),
  is_payer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions (uploaded prescription images)
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  ai_raw_response JSONB,
  doctor_name VARCHAR(100),
  prescription_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  infographic_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications (extracted from prescriptions)
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id),
  user_id UUID REFERENCES users(id),
  drug_name_en VARCHAR(200),
  drug_name_hi VARCHAR(200),
  dosage VARCHAR(50),
  frequency VARCHAR(50),
  timing JSONB,
  instructions TEXT,
  duration_days INT,
  is_active BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false,
  validated_against_db BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder Schedules (when to send each reminder)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  medication_id UUID REFERENCES medications(id),
  reminder_time TIME NOT NULL,
  days_of_week INT[] DEFAULT '{1,2,3,4,5,6,7}',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adherence Log (did they take it?)
CREATE TABLE adherence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  medication_id UUID REFERENCES medications(id),
  schedule_id UUID REFERENCES schedules(id),
  reminder_sent_at TIMESTAMPTZ NOT NULL,
  response VARCHAR(10),
  response_at TIMESTAMPTZ,
  caretaker_alerted BOOLEAN DEFAULT false,
  caretaker_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (payment tracking)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caretaker_id UUID REFERENCES caretakers(id),
  user_id UUID REFERENCES users(id),
  plan VARCHAR(20),
  amount_paise INT,
  billing_cycle VARCHAR(10),
  razorpay_subscription_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation State (for multi-step WhatsApp flows)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  state VARCHAR(50) NOT NULL,
  context JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_caretakers_phone ON caretakers(phone);
CREATE INDEX idx_schedules_active ON schedules(is_active, reminder_time);
CREATE INDEX idx_adherence_user_date ON adherence_log(user_id, reminder_sent_at);
CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_medications_active ON medications(user_id, is_active);
