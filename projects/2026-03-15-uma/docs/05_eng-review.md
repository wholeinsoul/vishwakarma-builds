# Engineering Review — Uma
## 🏗️ Engineering Manager / Tech Lead Review (3x Ralph Loop)

**Focus:** Tech feasibility, WhatsApp integration costs, architecture
**Date:** 2026-03-15

---

# PASS 1: Architecture & Tech Stack

## Tech Stack Decision

| Layer | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js (TypeScript) | Best WhatsApp library ecosystem (whatsapp-web.js, Baileys). Async-native for message handling. |
| **Framework** | Fastify | Lighter than Express, built-in validation, great for webhook servers |
| **Database** | PostgreSQL (Supabase) | Structured data (users, prescriptions, schedules). Supabase = free tier + auth + RLS |
| **Job Queue** | BullMQ + Redis | Scheduled reminders need reliable, time-based job execution. BullMQ is battle-tested. |
| **AI Vision** | OpenAI GPT-4o (vision) | Best handwriting recognition. Falls back to Claude 3.5 Sonnet. |
| **Infographic** | HTML → PNG (Puppeteer) | Generate Hindi infographic as HTML template, render to PNG, send via WhatsApp |
| **Voice/TTS** | Google Cloud TTS (Hindi) | Free tier: 4M chars/month. High quality Hindi voices. Open-source fallback: Piper TTS |
| **WhatsApp** | Meta Cloud API (direct) | Free. No BSP middleman. ₹0 fixed cost, ₹0.13/utility message. Full control. |
| **Hosting** | Railway / Fly.io | Free/cheap tier. Auto-scaling. Or a ₹500/month VPS on DigitalOcean Bangalore region. |
| **Payments** | Razorpay | UPI + cards. Subscription billing. WhatsApp sends payment link → Razorpay handles rest. |

### Why NOT a BSP (AiSensy, Interakt, etc.)?

| Factor | Meta Cloud API (DIY) | BSP (e.g., AiSensy) |
|---|---|---|
| Fixed cost | ₹0/month | ₹2,000-10,000/month |
| Per-message cost | ₹0.13 (utility) | ₹0.13 + BSP markup (₹0.15-0.50) |
| Setup effort | 2-3 days | 2-3 hours |
| Template approval | You submit directly to Meta | BSP submits on your behalf (slightly faster) |
| Media handling | You manage uploads/downloads | Built-in |
| Webhook reliability | You build retry logic | They handle it |
| Vendor lock-in | None | Moderate (API differences) |
| Control | Full | Limited to BSP features |

**Decision: Meta Cloud API.** At our scale (0-10K users), the fixed cost savings of ₹2-10K/month matter. The 2-3 days of extra setup is a one-time cost. We get full control over message formatting, media handling, and conversation flow.

**Abstraction layer:** Build a `WhatsAppClient` interface so we can swap to a BSP later with a config change:

```typescript
interface WhatsAppClient {
  sendText(to: string, text: string): Promise<MessageId>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<MessageId>;
  sendVoice(to: string, audioUrl: string): Promise<MessageId>;
  sendButtons(to: string, text: string, buttons: Button[]): Promise<MessageId>;
  sendTemplate(to: string, template: string, params: Record<string, string>): Promise<MessageId>;
}
```

Two implementations: `MetaCloudClient` and `BSPClient` (stub for future).

---

## System Architecture

```
                    ┌─────────────────────────────────┐
                    │        WhatsApp User             │
                    │    (Elderly Parent / Caretaker)   │
                    └──────────┬──────────────────────┘
                               │
                               │ WhatsApp Messages
                               │ (text, images, voice, buttons)
                               ▼
                    ┌─────────────────────────────────┐
                    │     Meta Cloud API (WhatsApp)    │
                    │   Webhook → Our Server           │
                    │   Our Server → Send API          │
                    └──────────┬──────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Uma Server                            │
│                      (Node.js / Fastify)                         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Webhook      │  │ Conversation │  │ Reminder Scheduler      │ │
│  │ Handler      │→ │ Engine       │  │ (BullMQ + Redis)        │ │
│  │ (incoming    │  │ (state       │  │                         │ │
│  │  messages)   │  │  machine)    │  │ - Cron-like scheduling  │ │
│  └─────────────┘  └──────┬───────┘  │ - Per-user job queue    │ │
│                          │          │ - Retry on failure       │ │
│                          ▼          └────────────┬────────────┘ │
│  ┌─────────────────────────────────┐             │              │
│  │ Services                        │             │              │
│  │                                 │             ▼              │
│  │ ┌───────────────┐               │  ┌────────────────────┐   │
│  │ │ Prescription  │               │  │ Notification       │   │
│  │ │ Reader        │               │  │ Service            │   │
│  │ │ (GPT-4o API)  │               │  │ (sends reminders,  │   │
│  │ └───────┬───────┘               │  │  tracks responses) │   │
│  │         ▼                       │  └────────────────────┘   │
│  │ ┌───────────────┐               │                           │
│  │ │ Drug          │               │                           │
│  │ │ Validator     │               │                           │
│  │ │ (pharmacopoeia│               │                           │
│  │ │  DB lookup)   │               │                           │
│  │ └───────┬───────┘               │                           │
│  │         ▼                       │                           │
│  │ ┌───────────────┐               │                           │
│  │ │ Infographic   │               │                           │
│  │ │ Generator     │               │                           │
│  │ │ (HTML→PNG via │               │                           │
│  │ │  Puppeteer)   │               │                           │
│  │ └───────────────┘               │                           │
│  │ ┌───────────────┐               │                           │
│  │ │ Voice         │               │                           │
│  │ │ Generator     │               │                           │
│  │ │ (Google TTS / │               │                           │
│  │ │  Piper)       │               │                           │
│  │ └───────────────┘               │                           │
│  └─────────────────────────────────┘                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL (Supabase)                     │ │
│  │                                                             │ │
│  │  users │ prescriptions │ medications │ schedules │ adherence│ │
│  │  caretakers │ payments │ voice_clips │ conversations        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Users (elderly parents receiving reminders)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,       -- WhatsApp number (E.164)
  name VARCHAR(100),
  language VARCHAR(5) DEFAULT 'hi',         -- 'hi', 'en', 'hi-en'
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  status VARCHAR(20) DEFAULT 'onboarding',  -- onboarding, active, paused, churned
  onboarding_step INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caretakers (children/family who manage and pay)
CREATE TABLE caretakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  name VARCHAR(100),
  photo_url TEXT,                            -- Photo to show in reminders
  voice_clip_url TEXT,                       -- Pre-recorded voice message URL
  relationship VARCHAR(20),                  -- son, daughter, spouse, other
  user_id UUID REFERENCES users(id),         -- Which parent they care for
  is_payer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions (uploaded prescription images)
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,                   -- Original prescription photo
  ai_raw_response JSONB,                     -- Raw GPT-4o output
  doctor_name VARCHAR(100),
  prescription_date DATE,
  status VARCHAR(20) DEFAULT 'pending',      -- pending, confirmed, rejected
  infographic_url TEXT,                       -- Generated infographic image URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications (extracted from prescriptions)
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id),
  user_id UUID REFERENCES users(id),
  drug_name_en VARCHAR(200),                 -- English drug name
  drug_name_hi VARCHAR(200),                 -- Hindi drug name
  dosage VARCHAR(50),                        -- "500mg", "5ml", etc.
  frequency VARCHAR(50),                     -- "twice daily", "once at night"
  timing JSONB,                              -- ["08:00", "20:00"]
  instructions TEXT,                         -- "after food", "with water"
  duration_days INT,                         -- How many days to take
  is_active BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false,        -- User confirmed this is correct
  validated_against_db BOOLEAN DEFAULT false, -- Cross-checked with drug DB
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder Schedules (when to send each reminder)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  medication_id UUID REFERENCES medications(id),
  reminder_time TIME NOT NULL,               -- "08:00", "14:00", "20:00"
  days_of_week INT[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
  start_date DATE,
  end_date DATE,                             -- NULL = indefinite
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
  response VARCHAR(10),                      -- 'yes', 'no', 'no_response'
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
  plan VARCHAR(20),                          -- 'basic', 'premium', 'family'
  amount_paise INT,                          -- Amount in paise (₹199 = 19900)
  billing_cycle VARCHAR(10),                 -- 'monthly', 'annual'
  razorpay_subscription_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'trial',        -- trial, active, paused, cancelled
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation State (for multi-step WhatsApp flows)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL,
  state VARCHAR(50) NOT NULL,                -- 'idle', 'onboarding_name', 'confirming_med_1', etc.
  context JSONB DEFAULT '{}',                -- Temporary data during conversation
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
```

---

## API Endpoints / Webhook Handlers

### Incoming (WhatsApp → Server)
```
POST /webhook/whatsapp          -- Meta Cloud API webhook (all incoming messages)
  ├── Image message received    → PrescriptionReader.process()
  ├── Text message received     → ConversationEngine.handle()
  ├── Button reply received     → ConversationEngine.handleButton()
  └── Voice message received    → store as caretaker voice clip

POST /webhook/razorpay          -- Razorpay payment webhook
  ├── payment.captured          → SubscriptionService.activate()
  ├── subscription.charged      → SubscriptionService.renew()
  └── subscription.cancelled    → SubscriptionService.cancel()
```

### Outgoing (Server → WhatsApp)
```
ReminderScheduler (BullMQ cron jobs):
  Every minute: check for due reminders
  → NotificationService.sendReminder(user, medication)
    → WhatsAppClient.sendImage(infographic + caretaker photo)
    → WhatsAppClient.sendButtons("Dawai le li?", [YES, NO])
    → Wait 30 min for response
    → If no response: WhatsAppClient.sendText(caretaker, "Missed dose alert")
```

---

## WhatsApp Integration — Detailed Feasibility Analysis

### What We Need to Send

| Message Type | WhatsApp API Support | Cost (India) | Notes |
|---|---|---|---|
| Text message | ✅ Fully supported | ₹0.13 (utility template) or free (within 24hr window) | |
| Image with caption | ✅ Fully supported | Same as text | Infographic as image |
| Voice note (OGG Opus) | ✅ Supported (audio message) | Same as text | Must be OGG format with Opus codec |
| Interactive buttons (up to 3) | ✅ Supported | Same as text | "Yes / No / Snooze" |
| List message (up to 10 items) | ✅ Supported | Same as text | For medication selection |
| Template message (scheduled) | ✅ Required for business-initiated | ₹0.13/utility | Pre-approved by Meta |

### Template Messages We Need

```
Template 1: "medication_reminder" (Utility)
  "🕐 {{1}} — Time for your medication:
   💊 {{2}}
   Dawai le li? / Did you take it?"
  Buttons: [✅ Haan/Yes] [❌ Nahi/No]
  
Template 2: "missed_dose_alert" (Utility)  
  "⚠️ {{1}} ne aaj {{2}} ki dawai nahi li.
   ({{1}} hasn't taken {{2}} today.)"
   
Template 3: "welcome_onboarding" (Utility)
  "🙏 Namaste! Uma mein aapka swagat hai.
   Apna naam batayein / Tell us your name:"

Template 4: "prescription_ready" (Utility)
  "✅ Aapki dawai ki jankari taiyar hai!
   (Your medication info is ready!)
   Neeche image dekhein / See the image below:"

Template 5: "weekly_report" (Utility)
  "📊 {{1}} ki is hafte ki report:
   ✅ {{2}}/{{3}} dawai li
   ❌ {{4}} baar miss hua"
```

### Cost Calculation Per User Per Month

**Basic Tier (text reminders only):**
```
Daily:
  3 reminders × ₹0.13 = ₹0.39/day (template messages)
  3 confirmation responses = FREE (customer service window, 24hr)
  
If missed (assume 20% miss rate):
  0.6 alerts to caretaker × ₹0.13 = ₹0.08/day

Monthly:
  (₹0.39 + ₹0.08) × 30 = ₹14.10/month

One-time:
  Prescription scan AI call: ₹3-5 (GPT-4o vision, ~$0.04)
  Infographic generation: negligible (server-side render)

TOTAL COGS: ~₹15-20/month
REVENUE: ₹199/month
GROSS MARGIN: 90-92%
```

**Premium Tier (voice + photo):**
```
Daily:
  3 reminders with image × ₹0.13 = ₹0.39/day
  3 voice notes × ₹0.13 = ₹0.39/day (sent as separate audio messages)
  3 confirmation responses = FREE
  0.6 caretaker alerts × ₹0.13 = ₹0.08/day

Monthly:
  (₹0.39 + ₹0.39 + ₹0.08) × 30 = ₹25.80/month

Voice generation (Google TTS / Piper):
  ~90 voice clips/month × ₹0.05 = ₹4.50/month
  (Or pre-recorded: ₹0)

TOTAL COGS: ~₹25-30/month
REVENUE: ₹499-799/month  
GROSS MARGIN: 94-96%
```

**At 10,000 users (mix of Basic/Premium):**
```
Revenue: ~₹30-40 lakh/month ($36K-$48K)
WhatsApp API: ~₹1.5-2.5 lakh/month ($1.8K-$3K)
AI costs: ~₹15K/month (one-time scans)
Server: ~₹5-10K/month
Redis: ~₹2-5K/month
TOTAL COGS: ~₹2-3 lakh/month
GROSS MARGIN: ~92-94%
NET before salaries/marketing: ~₹27-37 lakh/month ($33K-$45K)
```

### Voice Message Technical Pipeline

```
Caretaker records voice → 
  WhatsApp sends as OGG/Opus → 
  Server stores in S3/Supabase Storage →
  Used as-is for reminders (pre-recorded path)

OR (Premium AI voice):
  Caretaker records 30-second sample →
  Server sends to Google TTS / ElevenLabs / Piper →
  Generate reminder text in caretaker's voice →
  Convert to OGG Opus →
  Upload to Meta media API →
  Send as WhatsApp audio message

Voice format requirements:
  - Format: OGG with Opus codec (required by WhatsApp)
  - Max size: 16MB
  - ffmpeg conversion: `ffmpeg -i input.mp3 -c:a libopus -b:a 64k output.ogg`
  - Node.js: use fluent-ffmpeg or call ffmpeg as subprocess
```

### WhatsApp Business Account Setup

```
Step 1: Create Meta Business Account (business.facebook.com)
Step 2: Create WhatsApp Business Account in Meta Business Suite
Step 3: Add phone number (need a number that can receive SMS/call)
Step 4: Get API access token
Step 5: Set up webhook URL (our server endpoint)
Step 6: Submit message templates for approval
Step 7: Verify business (may require documents)

Timeline:
  - Steps 1-5: Same day
  - Step 6 (template approval): 1-7 days (usually 24-48 hours)
  - Step 7 (business verification): 2-14 days

FREE tier includes:
  - 1,000 free service conversations/month
  - Unlimited responses within 24-hour customer service window
```

---

## Data Flow — All Four Paths

### Flow 1: Prescription Scan

```
USER SENDS PHOTO ──▶ WEBHOOK RECEIVES ──▶ DOWNLOAD IMAGE ──▶ GPT-4o VISION ──▶ VALIDATE ──▶ GENERATE INFOGRAPHIC ──▶ SEND TO USER
       │                    │                    │                  │                │                │                    │
       ▼                    ▼                    ▼                  ▼                ▼                ▼                    ▼
   [not an image?]     [webhook fails?]    [download fails?]  [AI returns        [drug name       [Puppeteer           [WhatsApp
    → "Please send      → Meta retries      → retry 2x,        garbage?]          not in DB?]      crashes?]            send fails?]
    a photo"             3x with backoff     → "Sorry,          → "I couldn't      → flag for       → fallback to        → retry 2x,
                                             try again"          read this.         user review,     text-only format     → log error
                                                                 Please send        don't auto-                           → alert ops
                                                                 a clearer          confirm
                                                                 photo"
```

### Flow 2: Reminder Delivery

```
SCHEDULER FIRES ──▶ BUILD MESSAGE ──▶ ATTACH PHOTO/VOICE ──▶ SEND VIA WHATSAPP ──▶ WAIT FOR RESPONSE ──▶ LOG ADHERENCE
       │                   │                   │                      │                     │                    │
       ▼                   ▼                   ▼                      ▼                     ▼                    ▼
  [no active           [medication          [photo/voice           [send fails?]         [no response         [DB write
   medications?]        ended?]              not found?]            → retry 2x            in 30 min?]          fails?]
   → skip,              → deactivate         → send without         → fallback to         → send follow-up     → retry,
   → check if           schedule,            media (text only)      plain text             → if still none      → log to
   subscription         → notify user                               → log failure          in 60 min,           dead letter
   should pause         "course complete!"                                                 → alert caretaker    queue
```

---

## Failure Modes

| Codepath | Failure Mode | Rescued? | Test? | User Sees? | Logged? |
|---|---|---|---|---|---|
| Prescription scan | GPT-4o API timeout | Y | Y | "Processing taking longer, please wait" | Y |
| Prescription scan | GPT-4o returns no medications | Y | Y | "Couldn't read this prescription. Send clearer photo?" | Y |
| Prescription scan | GPT-4o hallucinates drug name | Y (partial) | Y | Drug validation flags it, asks user to confirm | Y |
| Infographic gen | Puppeteer crash | Y | Y | Falls back to text list | Y |
| Reminder send | WhatsApp API 429 (rate limit) | Y | Y | Delayed delivery, retry with backoff | Y |
| Reminder send | User blocked the number | Y | Y | Caretaker notified "parent may have blocked" | Y |
| Voice generation | TTS API fails | Y | Y | Falls back to text-only reminder | Y |
| Payment | Razorpay webhook missed | Y | Y | Periodic sync job checks payment status | Y |
| Conversation | User sends unexpected message | Y | Y | "I didn't understand. Send 'help' for options" | Y |
| Scheduling | Redis/BullMQ crashes | Y (partial) | Y | Reminders delayed until recovery | Y |

**CRITICAL GAP:** What if the user changes phones? WhatsApp number is the primary key. If they port their number, everything continues. If they get a new number, they need to re-onboard. Need a "transfer to new number" flow.

---

## Security Considerations

1. **Health data (DPDPA compliance):**
   - Prescription images stored encrypted at rest (Supabase default)
   - Data stored in India (Supabase Mumbai / AWS ap-south-1)
   - Data retention policy: prescriptions kept for 2 years, then deleted
   - User can request deletion ("Send DELETE to remove all your data")

2. **WhatsApp webhook verification:**
   - Verify Meta's webhook signature on every request
   - Reject unsigned/invalid requests

3. **Phone number validation:**
   - E.164 format validation
   - Rate limiting: max 5 prescription scans per day per number
   - Abuse detection: block numbers sending non-medical images repeatedly

4. **API keys:**
   - OpenAI, Meta, Razorpay keys in environment variables
   - Never logged, never in client-visible responses

5. **Caretaker verification:**
   - When caretaker claims to manage a parent, send OTP to parent's number for confirmation
   - Prevents unauthorized access to someone's medication data

---

# PASS 2: Challenge Pass — What's Wrong with This Architecture?

## Challenge 1: BullMQ + Redis is Overkill for MVP

**Problem:** I specified BullMQ + Redis for reminder scheduling. For an MVP with <100 users, this is over-engineering. Redis adds hosting cost and operational complexity.

**Alternative:** Use `node-cron` or even PostgreSQL-based scheduling:
```sql
-- Simple approach: query due reminders every minute
SELECT s.*, m.drug_name_en, m.dosage, u.phone
FROM schedules s
JOIN medications m ON s.medication_id = m.id
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true
  AND s.reminder_time BETWEEN NOW() - INTERVAL '1 minute' AND NOW()
  AND s.last_sent_at < NOW() - INTERVAL '23 hours';
```

Run this query via `node-cron` every minute. No Redis needed.

**Revised decision:** 
- **MVP (0-1000 users):** PostgreSQL + node-cron. Zero additional infrastructure.
- **Scale (1000+ users):** Migrate to BullMQ + Redis when the cron query gets slow.

**Savings:** ~₹2-5K/month on Redis hosting. Simpler deployment.

## Challenge 2: Puppeteer for Infographic Generation is Heavy

**Problem:** Puppeteer requires a headless Chrome instance. On a small VPS, this uses 200-500MB RAM. For every infographic generation, it spins up a browser context. This is slow (2-5 seconds) and resource-hungry.

**Alternatives:**
1. **Satori + @vercel/og** — React → SVG → PNG. No browser needed. Much lighter. Used by Vercel for OG images.
2. **Canvas API (node-canvas)** — Direct PNG generation with Cairo. Very fast. No browser.
3. **Sharp + SVG templates** — Generate SVG from template, convert to PNG with Sharp. Fastest option.
4. **HTML → PDF → PNG via a hosted service** — Use a free API like html-css-to-image.com

**Revised decision:** Use **Satori** (React → SVG → PNG). It's:
- Server-side only (no browser)
- Supports Hindi/Devanagari fonts (with font loading)
- ~100ms per image vs 2-5 seconds for Puppeteer
- No Chrome dependency
- Used in production by Vercel at massive scale

```typescript
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const svg = await satori(
  <MedicationInfoGraphic 
    medications={meds} 
    patientName="माँ"
    language="hi"
  />,
  { width: 800, height: 1200, fonts: [hindiFont, englishFont] }
);
const png = new Resvg(svg).render().asPng();
```

**Savings:** ~300MB less RAM, 20x faster generation, simpler deployment.

## Challenge 3: GPT-4o Vision Cost at Scale

**Problem:** GPT-4o vision costs ~$0.01-0.05 per image analysis (depending on image size and token output). At 10,000 users, each sending 1-2 prescriptions/month = 10-20K API calls/month = $100-$1,000/month.

**This is fine.** At 10,000 users, revenue is ~₹30-40 lakh/month. AI cost of ₹8-80K is 2-3% of revenue. But at 100K users, this becomes ₹8-80 lakh/month — still manageable but worth optimizing.

**Optimization path:**
1. Cache results — same prescription image shouldn't be processed twice
2. Use a smaller/cheaper model for "easy" prescriptions (printed prescriptions vs handwritten)
3. Fine-tune an open-source model (LLaVA, InternVL) on Indian prescription data — medium-term project
4. Use Medyug's approach: specialized OCR model for structured prescription data (no LLM needed for extraction, only for drug name resolution)

**Revised decision:** Stay with GPT-4o for MVP. Budget ₹5-10K/month for AI costs at 1000 users. Optimize later.

## Challenge 4: Timezone Handling

**Problem:** I defaulted everyone to `Asia/Kolkata` (IST, UTC+5:30). India has one timezone. But NRI caretakers are in US/UK/Australia timezones. When should THEY receive alerts?

**Solution:** 
- Parent's reminders: always IST (they're in India)
- Caretaker alerts: convert to caretaker's timezone
- Store caretaker's timezone during onboarding ("Which country are you in?")
- Don't alert a US-based son at 3 AM IST (which is 4:30 PM EST) about a missed 8 AM dose — wait until reasonable hours in their timezone

## Challenge 5: WhatsApp Number for the Service

**Problem:** We need an Indian phone number for the WhatsApp Business Account. Options:
1. **Virtual number from a provider** (e.g., Exotel, Knowlarity) — ₹500-2000/month
2. **Physical SIM card** — ₹99 one-time
3. **Meta's embedded signup flow** — generate a WhatsApp number directly through Meta

**Revised decision:** Physical SIM card for MVP (cheapest). Virtual number for production (reliability + no risk of losing a physical SIM).

## Challenge 6: What If the Server Goes Down?

**Problem:** If our server crashes, no reminders go out. For a medication service, this is a patient safety issue.

**Mitigation stack:**
1. **Health checks:** Railway/Fly.io auto-restarts crashed processes
2. **Monitoring:** Uptime check every minute (UptimeRobot, free tier)
3. **Missed reminder recovery:** When server comes back, check for any reminders that should have fired in the last N hours, send them with "Sorry for the delay" prefix
4. **Redundancy (future):** Multi-region deployment, but overkill for MVP

---

## Pass 2 Revised Architecture

```
SIMPLIFIED MVP ARCHITECTURE (Pass 2)

                    WhatsApp User
                         │
                    Meta Cloud API
                         │
              ┌──────────┴──────────┐
              │  Uma Server    │
              │  (Node.js/Fastify)   │
              │                      │
              │  ┌─────────────────┐ │
              │  │ Webhook Handler │ │
              │  └────────┬────────┘ │
              │           │          │
              │  ┌────────┴────────┐ │
              │  │ Conversation    │ │
              │  │ Engine (FSM)    │ │
              │  └────────┬────────┘ │
              │           │          │
              │  ┌────────┴────────┐ │
              │  │ Services:       │ │
              │  │ • PrescriptionAI│ │  ← GPT-4o Vision
              │  │ • DrugValidator │ │  ← Local DB
              │  │ • Infographic   │ │  ← Satori (no browser!)
              │  │ • VoiceGen      │ │  ← Google TTS
              │  │ • Reminder      │ │  ← node-cron + PostgreSQL
              │  │ • Payment       │ │  ← Razorpay
              │  └─────────────────┘ │
              │                      │
              │  ┌─────────────────┐ │
              │  │ PostgreSQL      │ │  ← Supabase (free tier)
              │  │ (all data)      │ │
              │  └─────────────────┘ │
              └──────────────────────┘

REMOVED from MVP:
  ✗ Redis (use PostgreSQL + node-cron)
  ✗ BullMQ (overkill)
  ✗ Puppeteer (use Satori)
  ✗ Complex voice cloning (pre-recorded only for MVP)
```

---

# PASS 3: Final Engineering Deep-Dive — The Hard Problems

## Hard Problem 1: Indian Handwritten Prescription Parsing

This is THE technical challenge. Let me break down what a real Indian prescription looks like:

```
Typical Indian prescription:
  ┌─────────────────────────────────────┐
  │ Dr. R. K. Sharma                    │ (printed header)
  │ MBBS, MD (Medicine)                 │
  │ Clinic: 42, MG Road, Lucknow       │
  │                                     │
  │ Pt: Kamla Devi    Age: 68/F         │ (handwritten)
  │ Date: 12/3/26                       │
  │                                     │
  │ Rx                                  │
  │ 1) Tab Metformin 500mg  1-0-1       │ (handwritten, barely legible)
  │    × 30 days                        │
  │ 2) Tab Amlodipine 5mg   0-0-1      │
  │    × 30 days                        │
  │ 3) Tab Ecosprin 75mg    0-1-0      │
  │    after lunch × 30 days            │
  │ 4) Syp Benadryl 5ml     SOS        │
  │                                     │
  │ Review after 1 month                │
  │                                     │
  │ (signature)                         │
  └─────────────────────────────────────┘

Notation:
  1-0-1 = morning-afternoon-night (1 tablet morning, 0 afternoon, 1 night)
  0-0-1 = night only
  0-1-0 = afternoon only
  SOS = as needed
  BD = twice daily
  TDS = three times daily
  OD = once daily
  HS = at bedtime
  AC = before food
  PC = after food
```

### GPT-4o Prompt for Prescription Reading

```
You are a medical prescription reader for Indian handwritten prescriptions.

Given this prescription image, extract ALL medications with the following details:
1. Drug name (exactly as written, plus standard name if you can identify it)
2. Dosage (mg, ml, etc.)
3. Frequency using the Indian notation:
   - "1-0-1" means morning-skip-night
   - "1-1-1" means morning-afternoon-night
   - "0-0-1" means night only
   - "BD" = twice daily, "TDS" = thrice daily, "OD" = once daily
   - "SOS" = as needed
4. Duration (days)
5. Special instructions (before food, after food, with water, etc.)

Also extract:
- Doctor's name (from header, usually printed)
- Patient name
- Date

Return as JSON:
{
  "doctor": "string",
  "patient": "string",
  "date": "string",
  "medications": [
    {
      "drug_name": "string (as written)",
      "standard_name": "string (identified standard name)",
      "dosage": "string",
      "frequency_notation": "string (1-0-1 format)",
      "frequency_text_hi": "string (Hindi: सुबह-दोपहर-रात)",
      "frequency_text_en": "string (English: morning-afternoon-night)",
      "times": ["08:00", "20:00"],
      "duration_days": number,
      "instructions": "string",
      "confidence": 0.0-1.0
    }
  ],
  "unreadable_parts": ["string (describe what couldn't be read)"]
}

IMPORTANT:
- If you're not confident about a drug name, set confidence < 0.7 and include your best guess
- Note any part you can't read in unreadable_parts
- Indian prescriptions often mix English drug names with Hindi instructions
- Common abbreviations: Tab=tablet, Cap=capsule, Syp=syrup, Inj=injection
```

### Drug Database Validation

Need a local database of Indian drug names for validation:

**Source options:**
1. **CDSCO (Central Drugs Standard Control Organisation)** — India's FDA equivalent. Published list of approved drugs.
2. **Indian Pharmacopoeia** — Standard reference
3. **1mg/PharmEasy product catalogs** — Scraped or API'd
4. **Open FDA drug database** — For international generics

**MVP approach:** Start with top 500 most commonly prescribed drugs in India (covers ~80% of prescriptions for chronic conditions):
- Metformin, Glimepiride, Sitagliptin (diabetes)
- Amlodipine, Telmisartan, Atenolol, Losartan (BP)
- Atorvastatin, Rosuvastatin (cholesterol)
- Ecosprin, Clopidogrel (blood thinners)
- Pantoprazole, Omeprazole (acidity)
- Metoprolol, Ramipril (heart)
- Levothyroxine (thyroid)
- etc.

Store with: name, max dose, common dose ranges, contraindications, food interactions.

```typescript
// Drug validation
function validateDrug(extracted: ExtractedMedication): ValidationResult {
  const drug = drugDb.findByName(extracted.drug_name);
  
  if (!drug) {
    return { valid: false, reason: 'UNKNOWN_DRUG', action: 'ASK_USER' };
  }
  
  if (extracted.dosage_mg > drug.max_dose_mg) {
    return { valid: false, reason: 'DOSE_TOO_HIGH', action: 'FLAG_AND_ASK' };
  }
  
  if (extracted.dosage_mg < drug.min_therapeutic_dose_mg) {
    return { valid: false, reason: 'DOSE_TOO_LOW', action: 'FLAG_AND_ASK' };
  }
  
  return { valid: true };
}
```

## Hard Problem 2: WhatsApp Conversation State Machine

WhatsApp doesn't have "screens" or "pages." Everything is a conversation. We need a state machine to track where each user is in the flow.

```
STATE MACHINE — User Conversation Flow

                    ┌──────────┐
                    │  START   │
                    └────┬─────┘
                         │ (first message from unknown number)
                         ▼
                    ┌──────────┐
                    │ONBOARD_1 │ "Namaste! Are you the patient or caretaker?"
                    │(role)    │ [Patient] [Caretaker]
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌──────────┐          ┌──────────┐
        │ONBOARD_2a│          │ONBOARD_2b│
        │(patient  │          │(caretaker │
        │ name)    │          │ + parent  │
        └────┬─────┘          │ phone)    │
             │                └────┬─────┘
             │                     │ (sends OTP to parent for verification)
             ▼                     ▼
        ┌──────────┐          ┌──────────┐
        │ONBOARD_3 │          │ONBOARD_3b│
        │(language │          │(caretaker │
        │ pref)    │          │ photo +   │
        └────┬─────┘          │ voice)    │
             │                └────┬─────┘
             │                     │
             └──────────┬──────────┘
                        ▼
                   ┌──────────┐
                   │  READY   │ "Send me a prescription photo!"
                   └────┬─────┘
                        │ (user sends image)
                        ▼
                   ┌──────────┐
                   │SCAN_PROC │ "Processing your prescription... ⏳"
                   └────┬─────┘
                        │ (AI returns results)
                        ▼
                   ┌──────────┐
                   │CONFIRM_1 │ "Is Medicine #1 correct? [Metformin 500mg, 1-0-1]"
                   │(per med) │ [✅ Correct] [❌ Wrong]
                   └────┬─────┘
                        │ (repeat for each medication)
                        ▼
                   ┌──────────┐
                   │SCHEDULE  │ "Set reminder times? Default: 8AM, 2PM, 8PM"
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │  ACTIVE  │ ← Normal state. Receiving reminders.
                   │          │   Can send new prescription anytime.
                   │          │   Can type "help", "stop", "status"
                   └────┬─────┘
                        │
              ┌─────────┼──────────┐
              ▼         ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │REMINDER│ │NEW_RX  │ │SETTINGS│
         │RESPONSE│ │(new    │ │(change │
         │(yes/no)│ │ scan)  │ │ times, │
         └────────┘ └────────┘ │ pause) │
                               └────────┘
```

**Implementation:** Finite State Machine stored in `conversations` table.

```typescript
const transitions: Record<State, Record<string, State>> = {
  START: { '*': 'ONBOARD_ROLE' },
  ONBOARD_ROLE: { 'patient': 'ONBOARD_NAME', 'caretaker': 'ONBOARD_CARETAKER' },
  ONBOARD_NAME: { '*': 'ONBOARD_LANGUAGE' },
  ONBOARD_CARETAKER: { '*': 'ONBOARD_PARENT_PHONE' },
  // ... etc
  ACTIVE: { 
    'image': 'SCAN_PROCESSING',
    'help': 'ACTIVE',  // show help menu, stay in ACTIVE
    'stop': 'PAUSED',
    'status': 'ACTIVE', // show status, stay in ACTIVE
  },
};
```

## Hard Problem 3: Hindi Infographic Design

The infographic needs to be:
- Readable by elderly with potentially poor eyesight
- Beautiful enough to feel trustworthy
- Bilingual (Hindi + English)
- Compact enough for WhatsApp image viewing (800x1200 max)

```
┌─────────────────────────────────────────────┐
│  🏥 Uma — आपकी दवाई की जानकारी       │
│  Date: 12 मार्च 2026 | Dr. R.K. Sharma      │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ ☀️ सुबह (Morning) — 8:00 AM            │ │
│  │                                         │ │
│  │  💊 Metformin 500mg — 1 गोली           │ │
│  │     मेटफॉर्मिन                          │ │
│  │     खाना खाने के बाद                    │ │
│  │     (After food)                        │ │
│  │                                         │ │
│  │  💊 Amlodipine 5mg — 1 गोली            │ │
│  │     एम्लोडिपिन                          │ │
│  │     पानी के साथ                         │ │
│  │     (With water)                        │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ 🌙 रात (Night) — 8:00 PM               │ │
│  │                                         │ │
│  │  💊 Metformin 500mg — 1 गोली           │ │
│  │     मेटफॉर्मिन                          │ │
│  │     खाना खाने के बाद                    │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ 🌤️ दोपहर (Afternoon) — 2:00 PM         │ │
│  │                                         │ │
│  │  💊 Ecosprin 75mg — 1 गोली             │ │
│  │     एकोस्प्रिन                          │ │
│  │     खाना खाने के बाद                    │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ⚠️ यह AI द्वारा पढ़ा गया है।                │
│  कृपया अपने डॉक्टर या फार्मासिस्ट से        │
│  सत्यापित करें।                              │
│  (AI-read. Please verify with your          │
│  doctor or pharmacist.)                     │
│                                             │
│  30 दिन तक लें | Review: 12 अप्रैल 2026    │
└─────────────────────────────────────────────┘
```

## Hard Problem 4: Handling Multiple Prescriptions Over Time

Real scenario: Elderly patient visits doctor every 1-3 months. New prescription may:
- Continue some medications unchanged
- Change dosage of existing medications
- Add new medications
- Remove/stop old medications

**Solution:** When a new prescription is scanned:
1. Compare with existing active medications
2. Show diff to user: "I see your Metformin dosage changed from 500mg to 1000mg. Is that correct?"
3. Deactivate old medications, activate new ones
4. Update reminder schedule

```typescript
function reconcilePrescriptions(
  existing: Medication[],
  newOnes: Medication[]
): PrescriptionDiff {
  const continued = []; // same drug, same dose
  const changed = [];   // same drug, different dose
  const added = [];     // new drug
  const stopped = [];   // old drug not in new prescription

  for (const newMed of newOnes) {
    const existing = findByDrugName(existing, newMed.drug_name);
    if (existing && existing.dosage === newMed.dosage) {
      continued.push(newMed);
    } else if (existing) {
      changed.push({ old: existing, new: newMed });
    } else {
      added.push(newMed);
    }
  }
  // ... stopped = existing not in newOnes
  return { continued, changed, added, stopped };
}
```

## Hard Problem 5: Scaling the Reminder Cron

At 100K users with 3 reminders/day = 300K messages/day = ~3.5 messages/second average, but concentrated in 3 peaks (morning 8-9 AM, afternoon 1-2 PM, night 8-9 PM IST).

**Peak load:** 100K messages in 1 hour = ~28 messages/second.

**WhatsApp API rate limits:** Meta Cloud API allows ~80 messages/second for verified businesses. We're well within limits.

**Server load:** Sending 28 msgs/sec with a Node.js server is trivial. Each message is a POST to Meta's API (~200ms round trip). With 10 concurrent connections, that's 50 messages/second capacity.

**The real bottleneck at scale:** PostgreSQL query to find due reminders. At 100K users with 300K schedule rows:
```sql
-- This query runs every minute
SELECT ... FROM schedules s
WHERE s.is_active = true
  AND s.reminder_time BETWEEN '08:00' AND '08:01'
  AND s.last_sent_at < CURRENT_DATE;
```
With index on `(is_active, reminder_time)`, this is fast even at 300K rows. PostgreSQL handles this easily.

**When to worry:** At 1M+ users, we'd need BullMQ + Redis for job distribution across multiple workers. But that's a nice problem to have.

---

## FINAL ARCHITECTURE (Pass 3)

### Tech Stack — Final

| Layer | Choice | Monthly Cost (MVP, <1000 users) |
|---|---|---|
| Server | Node.js + Fastify on Railway | Free tier (500 hrs/month) |
| Database | Supabase PostgreSQL | Free tier (500MB) |
| WhatsApp | Meta Cloud API (direct) | ~₹1,500-3,000 (per-message) |
| AI Vision | OpenAI GPT-4o | ~₹3,000-5,000 |
| Infographic | Satori + @resvg/resvg-js | ₹0 (server-side) |
| Voice TTS | Google Cloud TTS | Free tier (4M chars/month) |
| Audio Convert | ffmpeg (system) | ₹0 |
| Payments | Razorpay | 2% per transaction |
| Monitoring | UptimeRobot | Free |
| **TOTAL** | | **₹5,000-10,000/month (~$60-$120)** |

### At 10,000 users:

| Layer | Monthly Cost |
|---|---|
| Server | ₹2,000-5,000 (Railway/Fly.io paid) |
| Database | ₹1,500 (Supabase Pro) |
| WhatsApp | ₹1.5-2.5 lakh |
| AI Vision | ₹8,000-15,000 |
| Voice TTS | ₹2,000-5,000 |
| Razorpay | 2% of revenue |
| **TOTAL** | **~₹2-3 lakh/month (~$2,400-$3,600)** |
| **Revenue** | **~₹30-40 lakh/month** |
| **Margin** | **~92-94%** |

---

## Deployment Plan

### MVP (Week 1-2):
1. Set up Meta Business Account + WhatsApp Cloud API
2. Deploy webhook server on Railway
3. Set up Supabase project (Mumbai region)
4. Submit 5 message templates for approval
5. Build core services: PrescriptionAI, InfographicGen, ConversationEngine
6. Build reminder scheduler (node-cron + PostgreSQL)
7. Test with 10 family members

### Beta (Week 3-4):
1. Add Razorpay payment flow
2. Add caretaker linking + alerts
3. Add drug database validation (top 500 drugs)
4. Test with 50 users (friends + family network)

### Launch (Week 5-8):
1. WhatsApp Business verification complete
2. Production monitoring (UptimeRobot + Sentry)
3. Launch to first 100 paying customers
4. Add voice message support (pre-recorded)

### Scale (Month 3+):
1. Add regional languages (Tamil, Telugu, Bengali, Marathi)
2. Add AI voice generation (Premium tier)
3. Migrate to BullMQ + Redis if needed
4. Add pharmacy referral partnerships

---

## Build vs. Buy Decisions

| Component | Build | Buy | Decision | Reasoning |
|---|---|---|---|---|
| WhatsApp integration | ✅ | BSP | **BUILD** | ₹0 fixed cost, full control, simple API |
| Prescription OCR | | ✅ GPT-4o | **BUY** | Best accuracy, not worth building custom |
| Drug database | ✅ | | **BUILD** | No good purchasable option for Indian drugs |
| Infographic gen | ✅ Satori | | **BUILD** | Template-based, simple with Satori |
| Voice TTS | | ✅ Google | **BUY** | Hindi voice quality matters, Google is best free option |
| Payment | | ✅ Razorpay | **BUY** | Standard, proven, handles UPI |
| Hosting | | ✅ Railway | **BUY** | Free tier sufficient for MVP |

---

## FINAL FEASIBILITY VERDICT

```
COMPONENT              FEASIBLE?    DIFFICULTY    NOTES
────────────────────────────────────────────────────────────
WhatsApp API setup     ✅ YES       LOW           Well-documented, free
Prescription OCR       ✅ YES       MEDIUM        GPT-4o is good, need validation layer
Hindi infographic      ✅ YES       LOW           Satori + Devanagari fonts
Reminder scheduling    ✅ YES       LOW           node-cron + PostgreSQL
Voice messages         ✅ YES       MEDIUM        OGG Opus format conversion needed
Payment collection     ✅ YES       LOW           Razorpay link in WhatsApp
Drug DB validation     ✅ YES       MEDIUM        Need to curate 500-drug database
Conversation FSM       ✅ YES       MEDIUM        Multi-step WhatsApp flows are tricky
End-to-end MVP         ✅ YES       MEDIUM-HIGH   Can build in 2-3 days, not 1 night
────────────────────────────────────────────────────────────
OVERALL: ✅ TECHNICALLY FEASIBLE

Total monthly cost for MVP: ~₹5,000-10,000 ($60-$120)
Break-even: ~30-50 Basic subscribers
```

**The tech is not the hard part.** The hardest parts are:
1. Getting WhatsApp Business verification + template approval (bureaucratic, not technical)
2. Curating a reliable Indian drug database (research, not coding)
3. Making the conversation flow feel natural in Hindi (UX writing, not engineering)
4. Handling the inevitable edge cases where AI can't read the prescription (product design)

**All of these are solvable. None of them are blockers.**
