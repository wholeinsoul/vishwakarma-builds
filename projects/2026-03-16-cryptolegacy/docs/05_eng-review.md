# Engineering Review — CryptoLegacy

## Crypto Inheritance Platform for Non-Technical Wallet Holders
**Date:** 2026-03-16
**Verdict:** FEASIBLE — every feature buildable tonight

---

## Step 0: Scope Challenge

### What existing code/patterns solve each sub-problem?
1. **Encryption** → Web Crypto API (native browser). No library needed. AES-256-GCM with PBKDF2 key derivation.
2. **Dead man's switch** → Supabase `pg_cron` or a Next.js API route triggered by Vercel Cron.
3. **Guide builder** → Multi-step React form. Standard wizard pattern.
4. **Auth** → Supabase Auth. Email/password + magic link.
5. **Payments** → Stripe Checkout (hosted page). Minimal integration.
6. **Email** → Resend (free tier: 100 emails/day, plenty for MVP).

### Minimum set of changes
This is a greenfield build. Minimum viable scope:
- Landing page with pricing
- Auth (sign up, sign in, magic link)
- Guide builder wizard (5 steps)
- Client-side encryption + storage
- Dead man's switch (check-in timer + email triggers)
- Beneficiary management (CRUD)
- Beneficiary decryption portal
- Stripe Checkout links

### Complexity check
- **Pages:** 8 (landing, auth, dashboard, guide-builder, beneficiaries, settings, decrypt, pricing)
- **API routes:** 6 (check-in, trigger-switch, webhook/stripe, cron/check-switches, beneficiary CRUD)
- **Services:** 4 (crypto, email, switch, stripe)
- **Database tables:** 5 (users via Supabase Auth, plans, beneficiaries, switches, check_ins)

This is appropriately scoped for one night. No fat.

---

## 1. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR landing page for SEO ("dead mans switch" 33.1K/mo), React for interactive wizard |
| **Styling** | Tailwind CSS + shadcn/ui | Fast, professional UI with zero design effort |
| **Auth** | Supabase Auth | Free tier, magic links, RLS integration |
| **Database** | Supabase PostgreSQL | Free tier, RLS for multi-tenant security, pg_cron available |
| **Encryption** | Web Crypto API (native) | Client-side AES-256-GCM. Zero-knowledge. No npm package needed. |
| **Email** | Resend | Free tier (100/day). Simple API. React Email templates. |
| **Payments** | Stripe Checkout | Hosted payment page. Webhook for subscription status. |
| **Deployment** | Vercel | Free tier. Edge functions. Cron jobs. |

**Why NOT:**
- ❌ Prisma → Supabase client is simpler for this scale
- ❌ Auth0 → Supabase Auth is free and integrated
- ❌ SendGrid → Resend is simpler, modern API
- ❌ Custom encryption library → Web Crypto API is native, auditable, battle-tested

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Landing  │  │ Guide Builder │  │  Beneficiary Decrypt Page │ │
│  │ Page     │  │ Wizard (5    │  │  - Enter passphrase       │ │
│  │ (SSR)    │  │ steps)       │  │  - AES-256-GCM decrypt    │ │
│  └──────────┘  │              │  │  - Display recovery guide │ │
│                │ Step 1: What │  └───────────────────────────┘ │
│                │   platforms? │                                 │
│                │ Step 2: Fill │  ┌───────────────────────────┐ │
│                │   details    │  │  Dashboard                │ │
│                │ Step 3: Add  │  │  - Switch status (active/ │ │
│                │   benefic.   │  │    triggered/disabled)    │ │
│                │ Step 4: Set  │  │  - Last check-in date     │ │
│                │   passphrase │  │  - Beneficiary list       │ │
│                │ Step 5: Set  │  │  - Check-in button        │ │
│                │   check-in   │  └───────────────────────────┘ │
│                │   interval   │                                 │
│                └──────┬───────┘                                 │
│                       │                                         │
│              ENCRYPT  │ (Web Crypto API)                        │
│              LOCALLY  │ AES-256-GCM + PBKDF2                   │
│                       │                                         │
│        ───── ONLY ENCRYPTED BLOB LEAVES BROWSER ─────          │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (VERCEL)                  │
│                                                                 │
│  POST /api/plans          — Save encrypted plan blob            │
│  POST /api/check-in       — Record check-in, reset timer        │
│  POST /api/beneficiaries  — CRUD beneficiaries                  │
│  POST /api/webhook/stripe — Handle subscription events          │
│  GET  /api/cron/switches  — Check for expired switches (cron)   │
│  POST /api/trigger        — Trigger switch, email beneficiaries │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + Auth)                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  auth.   │  │  plans   │  │  benefi- │  │  check_ins    │  │
│  │  users   │  │          │  │  ciaries │  │               │  │
│  │          │  │ id       │  │          │  │ id            │  │
│  │ id (FK)──┼─>│ user_id  │  │ id       │  │ plan_id (FK)  │  │
│  │ email    │  │ enc_blob │  │ plan_id  │  │ checked_in_at │  │
│  │ created  │  │ enc_iv   │  │ name     │  │               │  │
│  │          │  │ enc_salt │  │ email    │  └───────────────┘  │
│  │          │  │ interval │  │ phone?   │                     │
│  │          │  │ status   │  │ notified │  ┌───────────────┐  │
│  │          │  │ next_    │  │          │  │ subscriptions │  │
│  │          │  │ check_in │  └──────────┘  │               │  │
│  │          │  │ template │                │ id            │  │
│  │          │  │ created  │                │ user_id (FK)  │  │
│  │          │  │ updated  │                │ stripe_id     │  │
│  └──────────┘  └──────────┘                │ status        │  │
│                                            │ plan_type     │  │
│  RLS: Every table filtered by user_id      │ current_end   │  │
│  except decrypt page (public, by token)    └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐             │
│  │  Resend  │  │  Stripe  │  │  Vercel Cron     │             │
│  │  (Email) │  │ (Billing)│  │  (daily switch   │             │
│  │          │  │          │  │   check)          │             │
│  └──────────┘  └──────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

```sql
-- plans: stores encrypted recovery guides
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Recovery Plan',
  encrypted_blob TEXT NOT NULL,        -- Base64 AES-256-GCM ciphertext
  encryption_iv TEXT NOT NULL,         -- Base64 initialization vector
  encryption_salt TEXT NOT NULL,       -- Base64 PBKDF2 salt
  check_in_interval_days INTEGER NOT NULL DEFAULT 90,
  next_check_in TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'triggered', 'disabled')),
  template_ids TEXT[] DEFAULT '{}',    -- which platform templates were used
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
  notify_token UUID DEFAULT gen_random_uuid(),  -- unique token for decrypt page
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

-- RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own plans"
  ON plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own beneficiaries"
  ON beneficiaries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own check-ins"
  ON check_ins FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own subscriptions"
  ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_status_next_check_in ON plans(status, next_check_in);
CREATE INDEX idx_beneficiaries_plan_id ON beneficiaries(plan_id);
CREATE INDEX idx_beneficiaries_notify_token ON beneficiaries(notify_token);
CREATE INDEX idx_check_ins_plan_id ON check_ins(plan_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
```

---

## 4. Data Flow — Including Shadow Paths

### 4A. Guide Creation Flow

```
User fills wizard → Generate plaintext JSON guide
                         │
                    ┌────┴────┐
                    │ ENCRYPT │ (in browser)
                    │         │
                    │ 1. User enters passphrase
                    │ 2. PBKDF2 derives key from passphrase + random salt
                    │ 3. AES-256-GCM encrypts JSON guide
                    │ 4. Returns: { ciphertext, iv, salt }
                    └────┬────┘
                         │
                    POST /api/plans
                    Body: { enc_blob, enc_iv, enc_salt, interval, beneficiaries }
                         │
                    ┌────┴────┐
                    │ SERVER  │
                    │         │
                    │ 1. Validate auth (Supabase JWT)
                    │ 2. Check subscription active
                    │ 3. Insert into plans table
                    │ 4. Insert beneficiaries
                    │ 5. Set next_check_in = NOW() + interval
                    │ 6. Return plan ID
                    └─────────┘

SHADOW PATHS:
- Empty passphrase → Client-side validation rejects (min 12 chars)
- No beneficiaries → Client-side validation rejects (min 1)
- Expired subscription → API returns 402, redirect to Stripe
- Supabase down → API returns 503, retry toast
- Blob too large (>1MB) → API returns 413
- Duplicate plan title → Allowed (no unique constraint needed)
```

### 4B. Dead Man's Switch Flow

```
VERCEL CRON (daily at 00:00 UTC)
         │
    GET /api/cron/switches
    Header: Authorization: Bearer CRON_SECRET
         │
    ┌────┴────┐
    │ QUERY   │
    │         │
    │ SELECT * FROM plans
    │ WHERE status = 'active'
    │ AND next_check_in < NOW()
    └────┬────┘
         │
    ┌────┴─────────────────────────────────┐
    │ For each expired plan:               │
    │                                      │
    │ 1. Check: days_overdue < 7?          │
    │    YES → Send REMINDER email to user │
    │          (with check-in link)        │
    │    NO  → Continue to step 2          │
    │                                      │
    │ 2. Check: days_overdue < 14?         │
    │    YES → Send URGENT email to user   │
    │          + SMS if phone on file      │
    │    NO  → Continue to step 3          │
    │                                      │
    │ 3. TRIGGER the switch:               │
    │    a. UPDATE plans SET status =      │
    │       'triggered'                    │
    │    b. For each beneficiary:          │
    │       - Send email with decrypt link │
    │         (/decrypt?token=<token>)     │
    │       - SET notified = true          │
    └──────────────────────────────────────┘

SHADOW PATHS:
- Cron fails → Vercel retries automatically. Max 1 hour delay.
- User checks in during 7-day grace → Timer resets, no trigger.
- All beneficiary emails bounce → Log error. Consider admin alert for v2.
- User deletes account during grace period → CASCADE deletes plan. No trigger.
- Subscription expires → Plan status set to 'paused'. Cron skips paused plans.
  If user resubscribes, plan reactivates with fresh timer.
```

### 4C. Beneficiary Decryption Flow

```
Beneficiary receives email:
"[Name] has granted you access to their crypto recovery plan."
"Click here to access: https://cryptolegacy.app/decrypt?token=<UUID>"
         │
    ┌────┴────┐
    │ DECRYPT │ page loads
    │ PAGE    │
    │         │
    │ 1. Fetch encrypted blob by token
    │    GET /api/decrypt?token=<UUID>
    │    → Returns: { enc_blob, enc_iv, enc_salt, plan_title }
    │    (No auth required — token is auth)
    │                                      │
    │ 2. Prompt for passphrase             │
    │    "Enter the passphrase [Name]      │
    │     shared with you"                 │
    │                                      │
    │ 3. DECRYPT in browser:               │
    │    a. PBKDF2 derive key from         │
    │       passphrase + salt              │
    │    b. AES-256-GCM decrypt blob       │
    │    c. Parse JSON → render guide      │
    │                                      │
    │ 4. Display step-by-step recovery     │
    │    instructions with platform-       │
    │    specific guidance                 │
    └──────────────────────────────────────┘

SHADOW PATHS:
- Invalid token → 404 page. "This link is invalid or has expired."
- Wrong passphrase → Decryption fails silently (GCM auth tag mismatch).
  Show: "Incorrect passphrase. Please try again." Max 5 attempts then lockout.
- Plan not triggered → API returns 403. "This plan has not been activated yet."
- Token already used → Allow re-use (beneficiary may need to access multiple times)
- Network error during fetch → Show offline message, retry button.
```

### 4D. Check-In Flow

```
User clicks "I'm still here" button (Dashboard)
         │
    POST /api/check-in
    Body: { plan_id }
    Auth: Supabase JWT
         │
    ┌────┴────┐
    │ SERVER  │
    │         │
    │ 1. Validate auth
    │ 2. Verify plan belongs to user
    │ 3. Verify plan status = 'active'
    │ 4. INSERT check_in record
    │ 5. UPDATE plan SET next_check_in
    │    = NOW() + interval_days
    │ 6. Return { next_check_in }
    └─────────┘

User also gets email with check-in link:
  https://cryptolegacy.app/check-in?plan=<ID>&token=<JWT>
  → Auto-authenticates and checks in (one-click)

SHADOW PATHS:
- Plan paused/triggered → Return 409 "Plan is not active"
- Plan not found → Return 404
- Double check-in (spam click) → Idempotent. Second insert is fine, timer already reset.
- Check-in link expired (JWT expired) → Redirect to login, then check-in
```

---

## 5. API Endpoints / Pages

### Pages
| Route | Auth? | Description |
|-------|-------|-------------|
| `/` | No | Landing page (SSR for SEO) |
| `/pricing` | No | Pricing page with Stripe Checkout links |
| `/auth/login` | No | Login (email/password + magic link) |
| `/auth/signup` | No | Sign up |
| `/auth/callback` | No | Supabase auth callback |
| `/dashboard` | Yes | Main dashboard — plan status, check-in button, beneficiaries |
| `/create` | Yes | Guide builder wizard (5 steps) |
| `/settings` | Yes | Account settings, subscription management |
| `/decrypt` | No | Beneficiary decryption page (token-based access) |
| `/check-in` | Token | One-click check-in from email link |

### API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/plans` | JWT | Create/update encrypted plan |
| GET | `/api/plans` | JWT | Get user's plans |
| POST | `/api/check-in` | JWT | Record check-in, reset timer |
| GET | `/api/check-in` | Token | One-click check-in from email |
| POST | `/api/beneficiaries` | JWT | Add beneficiary |
| DELETE | `/api/beneficiaries/[id]` | JWT | Remove beneficiary |
| GET | `/api/decrypt` | Token | Get encrypted blob for beneficiary |
| POST | `/api/webhook/stripe` | Stripe sig | Handle subscription events |
| GET | `/api/cron/switches` | Cron secret | Daily dead man's switch check |

---

## 6. Failure Modes

| Failure | Impact | Recovery |
|---------|--------|----------|
| **Supabase outage** | Users can't log in, plans can't be saved | Vercel shows maintenance page. Data is safe. |
| **Vercel cron fails** | Dead man's switch doesn't fire on time | Vercel auto-retries. Max delay: 1 hour. Acceptable for 30-90 day intervals. |
| **Resend email fails** | Check-in reminder or trigger email not delivered | Log failed sends. Retry queue. For triggers: retry 3x over 24 hours. |
| **Stripe webhook missed** | Subscription status stale | Stripe auto-retries webhooks. Reconcile daily. |
| **Browser crypto API unavailable** | Encryption/decryption fails | Only in very old browsers. Show "unsupported browser" message. |
| **User loses passphrase** | Can't decrypt own plan | Clearly warn during setup: "THERE IS NO PASSWORD RESET. We cannot recover your plan." |
| **All beneficiary emails invalid** | Trigger fires but nobody receives instructions | Log error. For v2: verify email on add. |

---

## 7. Edge Cases

1. **User dies AND email account is compromised** → Beneficiary can't receive email. V2: add SMS + WhatsApp delivery.
2. **User in hospital for 3 months** → False trigger. Mitigation: 7-day grace period + 14-day urgent warning before trigger. User can also designate a "trusted person" who can pause the switch.
3. **Beneficiary tries wrong passphrase** → GCM decryption fails. Show clear error. Lock after 5 attempts (per hour) to prevent brute force.
4. **User has multiple wallets across platforms** → Support multiple "sections" in one plan. Each section = one platform template.
5. **User changes platforms after creating plan** → Guide builder allows editing. Re-encrypt with same or new passphrase.
6. **Subscription lapses → Plan auto-paused** → Timer stops. No false triggers. Resume when resubscribed.
7. **User wants to test the flow** → "Send test notification" button that sends a preview email to the user (not beneficiaries).
8. **Concurrent check-in from email link + dashboard** → Idempotent. Both succeed. Timer resets once.
9. **Beneficiary forwards decrypt link** → Token is UUID, not guessable. But anyone with the link + passphrase can decrypt. Acceptable for MVP — the passphrase is the real security layer.
10. **Large plan (50+ wallets)** → Encrypted blob size limit: 1MB. Should be more than enough for text instructions.

---

## 8. Security Considerations

### Encryption Architecture (Zero-Knowledge)
```
CRITICAL: The server NEVER sees plaintext instructions.

1. User enters passphrase in browser
2. PBKDF2(passphrase, salt, 600000 iterations) → 256-bit key
3. AES-256-GCM(key, iv, plaintext) → ciphertext + auth tag
4. Send to server: { ciphertext + tag (base64), iv (base64), salt (base64) }
5. Server stores encrypted blob. Cannot decrypt without passphrase.

Passphrase requirements:
- Minimum 12 characters
- Entropy check (no "password123")
- Displayed only once during creation
- User must share passphrase with beneficiaries OUT OF BAND
  (in person, phone call, sealed envelope, etc.)
```

### Auth Security
- Supabase Auth with PKCE flow
- Magic link login (no password reuse risk)
- JWT tokens with 1-hour expiry
- RLS on every table (user_id filter)

### API Security
- CORS: same-origin only
- Rate limiting: 60 req/min per user
- Cron endpoint: verify `CRON_SECRET` header
- Stripe webhook: verify signature with `stripe.webhooks.constructEvent`
- Decrypt endpoint: rate limit to 10 req/min per token (brute force protection)

### Data at Rest
- Encrypted blob is AES-256-GCM ciphertext (even if DB is compromised, data is useless)
- Supabase encryption at rest (standard)
- No plaintext PII beyond name + email

### Input Validation
- All user input sanitized (zod schemas)
- XSS: React's default escaping + CSP headers
- SQL injection: parameterized queries via Supabase client
- CSRF: SameSite cookies + origin check

---

## 9. Deployment Plan

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=

# Resend
RESEND_API_KEY=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://cryptolegacy.app
```

### Deployment Steps
1. Create Supabase project (free tier)
2. Run schema SQL
3. Configure Supabase Auth (email provider)
4. Create Stripe products + prices ($9/mo basic, $29/mo premium)
5. Set up Resend domain (or use default)
6. Deploy to Vercel (free tier)
7. Set env vars in Vercel
8. Configure Vercel Cron: `0 0 * * *` → `/api/cron/switches`
9. Verify: sign up → create plan → check in → test decrypt page

### CI/CD
- Push to main → Vercel auto-deploys
- Preview deployments for PRs

---

## 10. Test Plan

### Unit Tests (vitest)
| Test | File | What |
|------|------|------|
| Encryption round-trip | `__tests__/crypto.test.ts` | Encrypt → decrypt with correct passphrase returns original |
| Wrong passphrase fails | `__tests__/crypto.test.ts` | Decrypt with wrong passphrase throws |
| PBKDF2 key derivation | `__tests__/crypto.test.ts` | Same passphrase + salt → same key |
| Different salt → different key | `__tests__/crypto.test.ts` | Same passphrase + different salt → different key |
| Guide template rendering | `__tests__/templates.test.ts` | Coinbase/Binance/MetaMask templates render correctly |
| Check-in timer calculation | `__tests__/switch.test.ts` | next_check_in = now + interval_days |
| Switch status transitions | `__tests__/switch.test.ts` | active → triggered, active → paused, paused → active |
| Passphrase validation | `__tests__/validation.test.ts` | Min length, entropy check |
| Beneficiary email validation | `__tests__/validation.test.ts` | Valid/invalid email formats |

### Integration Tests (vitest + Supabase local)
| Test | What |
|------|------|
| Create plan API | Auth → create plan → verify in DB |
| Check-in API | Check in → verify next_check_in updated |
| Cron switch check | Insert expired plan → run cron → verify status = triggered |
| Decrypt API | Create plan → trigger → fetch by token → verify encrypted blob returned |
| Stripe webhook | Mock event → verify subscription status updated |

### E2E Tests (manual for MVP)
| Flow | Steps |
|------|-------|
| Full user journey | Sign up → create plan → add beneficiary → check in → verify dashboard |
| Dead man's switch | Create plan with 1-day interval → wait → verify trigger email |
| Beneficiary decryption | Trigger plan → open decrypt link → enter passphrase → verify guide displays |
| Subscription flow | Sign up → subscribe via Stripe → verify plan creation allowed |

---

## 11. File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page (SSR)
│   ├── pricing/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── dashboard/page.tsx
│   ├── create/page.tsx             # Guide builder wizard
│   ├── settings/page.tsx
│   ├── decrypt/page.tsx            # Beneficiary decryption (public)
│   ├── check-in/page.tsx           # One-click check-in
│   └── api/
│       ├── plans/route.ts
│       ├── check-in/route.ts
│       ├── beneficiaries/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── decrypt/route.ts
│       ├── webhook/stripe/route.ts
│       └── cron/switches/route.ts
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── guide-builder/
│   │   ├── platform-selector.tsx
│   │   ├── detail-form.tsx
│   │   ├── beneficiary-form.tsx
│   │   ├── passphrase-setup.tsx
│   │   └── interval-selector.tsx
│   ├── dashboard/
│   │   ├── switch-status.tsx
│   │   ├── check-in-button.tsx
│   │   └── beneficiary-list.tsx
│   ├── decrypt/
│   │   ├── passphrase-input.tsx
│   │   └── recovery-guide.tsx
│   └── landing/
│       ├── hero.tsx
│       ├── how-it-works.tsx
│       ├── pricing-cards.tsx
│       ├── trust-signals.tsx
│       └── faq.tsx
├── lib/
│   ├── crypto.ts                   # AES-256-GCM encrypt/decrypt
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts           # Auth middleware
│   ├── stripe.ts                   # Stripe helpers
│   ├── resend.ts                   # Email service
│   ├── templates/                  # Platform-specific recovery templates
│   │   ├── coinbase.ts
│   │   ├── binance.ts
│   │   ├── metamask.ts
│   │   ├── ledger.ts
│   │   ├── kraken.ts
│   │   └── generic.ts
│   └── validations.ts             # Zod schemas
├── __tests__/
│   ├── crypto.test.ts
│   ├── templates.test.ts
│   ├── switch.test.ts
│   └── validation.test.ts
├── middleware.ts                    # Supabase auth middleware
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 12. Platform Templates

Pre-built recovery guide templates for common platforms:

| Platform | Template Fields | Recovery Steps |
|----------|----------------|----------------|
| **Coinbase** | Email, 2FA method, 2FA backup code | 1. Go to coinbase.com 2. Log in with email 3. Enter 2FA 4. Transfer to your wallet |
| **Binance** | Email, 2FA, API key location | Similar to Coinbase + Binance-specific steps |
| **MetaMask** | Seed phrase location, password | 1. Install MetaMask 2. Import wallet 3. Enter seed phrase |
| **Ledger** | Device location, PIN, recovery phrase location | 1. Find Ledger device 2. Enter PIN 3. Access via Ledger Live |
| **Kraken** | Email, 2FA, master key | Standard exchange recovery |
| **Generic** | Free-form text | User writes custom instructions |

Each template generates structured JSON that becomes part of the encrypted blob.

---

## Summary

**Architecture:** Next.js 14 + Supabase + Stripe + Resend + Vercel. Zero-knowledge encryption via Web Crypto API. Dead man's switch via Vercel Cron.

**Key decisions:**
1. **Client-side encryption only** — We never see plaintext. This is the trust differentiator.
2. **No wallet APIs** — We deliver encrypted instructions, not crypto. Massively simpler.
3. **Escalation chain before trigger** — 7-day reminder, 14-day urgent, then trigger. Prevents false alarms.
4. **Token-based decrypt access** — No auth required for beneficiaries. Token + passphrase = access.

**Build order:**
1. Supabase schema + auth setup
2. Encryption library (`lib/crypto.ts`) + tests
3. Landing page + auth pages
4. Guide builder wizard
5. Dashboard + check-in
6. Beneficiary management
7. Dead man's switch cron
8. Decrypt page
9. Stripe integration
10. Polish + deploy

**Estimated build time:** 6-8 hours for functional MVP.
