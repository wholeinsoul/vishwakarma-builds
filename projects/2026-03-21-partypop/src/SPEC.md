# Engineering Review — Partypop MVP
## AI Kids' Party Plan Generator + RSVP Tracker
**Date:** 2026-03-21 | **Mode:** SCOPE REDUCTION (overnight build)

---

## Step 0: Scope

### Build (MVP)
1. Party plan questionnaire (multi-step wizard)
2. AI plan generation via GPT-4o-mini (timeline, activities, food, decorations, shopping list)
3. 10 themed prompt templates
4. Printable/shareable plan output
5. Shopping list with quantity calculations
6. RSVP tracker (shareable link + guest form + parent dashboard)
7. User auth + saved plans
8. Landing page
9. Stripe per-party payment ($4.99 premium unlock)

### NOT Building
- Vendor marketplace/recommendations, booking/commissions, mobile app, invitation design, gift registry, photo gallery, wedding tier

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR for landing/SEO pages, client components for wizard + RSVP. Vercel deploy. Proven in our pipeline (Pumpline, CryptoLegacy, On Special). |
| **Database** | Supabase (PostgreSQL) | Free tier, auth built-in, RLS, real-time for RSVP updates |
| **AI** | OpenAI GPT-4o-mini | Fast, cheap ($0.15/1M input, $0.60/1M output), great for structured party plan output. ~$0.01-0.03 per plan generation. |
| **Styling** | Tailwind CSS + shadcn/ui | Fast to build, polished components, print-friendly with @media print |
| **Hosting** | Vercel | Free tier, edge caching, zero-config |
| **Payments** | Stripe Checkout | Per-party $4.99 payment. Simple session-based. |
| **Email** | Resend | RSVP confirmation emails, plan share notifications |
| **Analytics** | Vercel Analytics or Plausible | Privacy-friendly, no cookie banner |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
│   Parent (Google/Social)       Guest (RSVP Link)     Admin           │
└─────────┬──────────────────────────┬─────────────────────┬──────────┘
          │                          │                     │
          ▼                          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Static/SSR    │  │  API Routes  │  │  RSVP Public Pages       │  │
│  │ Pages         │  │  /api/*      │  │  /rsvp/[partyId]         │  │
│  │              │  │              │  │  (no auth required)       │  │
│  │ /            │  │ POST plan    │  │                          │  │
│  │ /plan/new    │  │ POST rsvp    │  │                          │  │
│  │ /plan/[id]   │  │ POST payment │  │                          │  │
│  │ /dashboard   │  │ GET plans    │  │                          │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SUPABASE    │  │  OPENAI      │  │  STRIPE      │
│  PostgreSQL  │  │  GPT-4o-mini │  │  Checkout    │
│  + Auth      │  │  Plan gen    │  │  $4.99/party │
│  + RLS       │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│  RESEND      │
│  Email       │
│  RSVP notify │
└──────────────┘
```

---

## Database Schema

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `parties`
```sql
CREATE TABLE parties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,                    -- "Jake's 7th Birthday"
  child_name      TEXT NOT NULL,
  child_age       INTEGER NOT NULL CHECK (child_age BETWEEN 1 AND 18),
  theme           TEXT NOT NULL,                    -- "dinosaurs"
  headcount       INTEGER NOT NULL CHECK (headcount BETWEEN 1 AND 100),
  budget          INTEGER,                          -- in cents ($300 = 30000)
  venue_type      TEXT NOT NULL DEFAULT 'backyard'  -- backyard|park|indoor|venue|restaurant
    CHECK (venue_type IN ('backyard','park','indoor','venue','restaurant')),
  party_date      DATE,
  dietary_notes   TEXT,                             -- "2 kids nut-free, 1 vegetarian"
  
  -- Generated plan (JSON blob from AI)
  plan_data       JSONB,                            -- full plan: timeline, activities, food, decorations, shopping
  plan_generated  BOOLEAN NOT NULL DEFAULT false,
  
  -- Premium features
  is_premium      BOOLEAN NOT NULL DEFAULT false,   -- paid $4.99
  stripe_session  TEXT,                             -- Stripe checkout session ID
  
  -- RSVP
  rsvp_enabled    BOOLEAN NOT NULL DEFAULT false,
  rsvp_slug       TEXT UNIQUE,                      -- short slug for /rsvp/[slug]
  rsvp_deadline   DATE,
  
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','generated','active','completed','archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parties_user ON parties(user_id);
CREATE INDEX idx_parties_rsvp_slug ON parties(rsvp_slug) WHERE rsvp_slug IS NOT NULL;
CREATE INDEX idx_parties_status ON parties(status);
```

### Table: `rsvps`
```sql
CREATE TABLE rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id        UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT,
  attending       TEXT NOT NULL DEFAULT 'pending'   -- yes|no|maybe|pending
    CHECK (attending IN ('yes','no','maybe','pending')),
  num_children    INTEGER NOT NULL DEFAULT 1,       -- how many kids coming
  dietary_needs   TEXT,                             -- "nut allergy"
  notes           TEXT,                             -- "arriving 15 min late"
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rsvps_party ON rsvps(party_id);
CREATE UNIQUE INDEX idx_rsvps_party_email ON rsvps(party_id, guest_email) WHERE guest_email IS NOT NULL;
```

### Table: `theme_templates`
```sql
CREATE TABLE theme_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,             -- "dinosaurs"
  name            TEXT NOT NULL,                    -- "Dinosaur Adventure"
  emoji           TEXT NOT NULL DEFAULT '🦕',
  description     TEXT,
  color_primary   TEXT NOT NULL DEFAULT '#22c55e',  -- theme color for UI
  color_secondary TEXT NOT NULL DEFAULT '#15803d',
  prompt_context  TEXT NOT NULL,                    -- AI prompt additions for this theme
  age_min         INTEGER DEFAULT 1,
  age_max         INTEGER DEFAULT 12,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 100
);
```

### Seed Data: 10 Theme Templates
```
dinosaurs, princess, superhero, sports, unicorn, minecraft, space, ocean, construction, safari
```

### RLS Policies
```sql
-- Profiles: users can read/update their own
CREATE POLICY "Users own their profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Parties: users can CRUD their own
CREATE POLICY "Users own their parties" ON parties
  FOR ALL USING (auth.uid() = user_id);

-- RSVPs: anyone can INSERT (guests don't have accounts)
CREATE POLICY "Public can submit RSVPs" ON rsvps
  FOR INSERT WITH CHECK (true);

-- RSVPs: party owner can read all RSVPs for their parties
CREATE POLICY "Party owner reads RSVPs" ON rsvps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM parties WHERE parties.id = rsvps.party_id AND parties.user_id = auth.uid())
  );

-- Theme templates: public read
CREATE POLICY "Public reads themes" ON theme_templates
  FOR SELECT USING (is_active = true);
```

---

## Page Map & Routes

### Public Pages (SEO)
| Route | Page | Auth | Cache |
|-------|------|------|-------|
| `/` | Landing page (hero, demo, themes, pricing) | No | SSG |
| `/themes` | Theme gallery (10 themes with previews) | No | SSG |
| `/rsvp/[slug]` | Guest RSVP form (public) | No | Dynamic |
| `/rsvp/[slug]/confirmed` | RSVP confirmation page | No | Dynamic |
| `/blog/[slug]` | SEO content ("dinosaur party ideas") | No | SSG |

### Auth Pages
| Route | Page | Auth |
|-------|------|------|
| `/login` | Login / Sign up | No |
| `/dashboard` | My parties list | Yes |
| `/plan/new` | Plan wizard (multi-step) | Yes |
| `/plan/[id]` | View/edit generated plan | Yes |
| `/plan/[id]/rsvp` | RSVP management dashboard | Yes |
| `/plan/[id]/print` | Print-friendly plan view | Yes |
| `/plan/[id]/share` | Shareable plan link | Yes (owner generates, public views) |

### API Routes
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `POST` | `/api/plans/generate` | AI plan generation | Yes |
| `PATCH` | `/api/plans/[id]` | Update plan details | Yes (owner) |
| `POST` | `/api/rsvp` | Submit RSVP (guest) | No (rate-limited) |
| `GET` | `/api/rsvp/[partyId]` | Get RSVPs for party | Yes (owner) |
| `POST` | `/api/checkout` | Create Stripe session | Yes |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler | Stripe signature |
| `GET` | `/api/themes` | List theme templates | No |

---

## Data Flow Diagrams

### Flow 1: Plan Generation (Primary Flow)

```
  Parent fills wizard (theme, age, headcount, budget, venue)
       │
       ▼
  POST /api/plans/generate
       │
       ├── VALIDATION (Zod)
       │    ├── [NIL] Missing required fields → 400 + field errors
       │    ├── [EMPTY] Theme empty → 400 "Select a theme"
       │    ├── [RANGE] Age < 1 or > 18 → 400 "Invalid age"
       │    ├── [RANGE] Headcount < 1 or > 100 → 400
       │    └── [AUTH] No session → 401
       │
       ├── CHECK: Has user exceeded free plan limit? (1 free, then $4.99)
       │    ├── [FREE] First plan → proceed
       │    ├── [PAID] is_premium = true → proceed
       │    └── [BLOCKED] No payment → redirect to checkout
       │
       ├── AI GENERATION
       │    ├── [HAPPY] GPT-4o-mini returns structured JSON plan → parse + save
       │    ├── [MALFORMED] AI returns invalid JSON → retry once, then 500 with fallback template
       │    ├── [TIMEOUT] OpenAI >30s → 504 "Taking longer than expected, try again"
       │    ├── [RATE_LIMIT] OpenAI 429 → 503 "Busy, try again in a moment"
       │    └── [REFUSAL] AI refuses to generate → 500 with generic plan fallback
       │
       ├── PERSIST: Save plan_data JSONB to parties table
       │    ├── [HAPPY] Insert/update success → return plan
       │    └── [ERROR] DB error → 500 + log
       │
       ▼
  Redirect to /plan/[id] — display generated plan
```

### Flow 2: RSVP Submission (Guest Flow)

```
  Guest visits /rsvp/[slug]
       │
       ├── [HAPPY] Party found, RSVP enabled → show form
       ├── [NOT FOUND] Invalid slug → 404
       ├── [CLOSED] Past deadline → "RSVPs are closed"
       └── [DISABLED] rsvp_enabled = false → 404
       │
       ▼
  Guest fills form (name, attending, dietary, notes)
       │
       ▼
  POST /api/rsvp
       │
       ├── VALIDATION
       │    ├── [NIL] No name → 400
       │    ├── [INVALID] Attending not yes/no/maybe → 400
       │    └── [SPAM] Rate limit: 10/IP/hour → 429
       │
       ├── DUPLICATE CHECK
       │    ├── [DUPLICATE] Same email already RSVP'd → update existing (upsert)
       │    └── [NEW] Insert new RSVP
       │
       ├── PERSIST → 201
       │
       ├── NOTIFY (optional)
       │    └── Email parent that new RSVP received (via Resend)
       │
       ▼
  Redirect to /rsvp/[slug]/confirmed
```

### Flow 3: Payment (Stripe)

```
  Parent clicks "Unlock Premium" on /plan/[id]
       │
       ▼
  POST /api/checkout → Create Stripe Checkout Session
       │
       ├── [HAPPY] Session created → redirect to Stripe
       ├── [ERROR] Stripe API fails → 500 "Payment unavailable"
       │
       ▼
  Stripe Checkout (hosted by Stripe)
       │
       ├── [SUCCESS] → Stripe webhook fires
       │    ├── POST /api/webhooks/stripe
       │    ├── Verify signature
       │    ├── Set party.is_premium = true
       │    └── Redirect to /plan/[id]?upgraded=true
       │
       └── [CANCEL] → Return to /plan/[id]
```

---

## AI Prompt Architecture

### System Prompt Structure
```
You are Partypop, an AI party planner for kids' birthdays.
Generate a complete party plan in JSON format.

Theme: {theme_template.prompt_context}
Child's name: {child_name}
Age: {child_age}
Headcount: {headcount} kids + parents
Budget: ${budget}
Venue: {venue_type}
Dietary notes: {dietary_notes}

Return VALID JSON with this structure:
{
  "party_title": "string",
  "timeline": [
    { "time": "2:00 PM", "duration_min": 15, "activity": "string", "description": "string", "supplies_needed": ["string"] }
  ],
  "activities": [
    { "name": "string", "description": "string", "age_appropriate": true, "duration_min": 15, "supplies": ["string"], "instructions": "string" }
  ],
  "food_menu": [
    { "item": "string", "quantity": "string", "notes": "string" }
  ],
  "decorations": [
    { "item": "string", "quantity": number, "estimated_cost": number }
  ],
  "shopping_list": [
    { "item": "string", "quantity": "string", "category": "food|decoration|activity|supplies", "estimated_cost": number }
  ],
  "tips": ["string"],
  "estimated_total": number
}
```

### Theme-Specific Context Example (Dinosaurs)
```
Theme: Dinosaur Adventure 🦕
Context: A prehistoric adventure party! Think fossil digs, dino eggs, lush jungle decorations with green/brown palette.
Iconic elements: fossil excavation activity, dino egg hunt, volcano cake, pterodactyl toss game.
Color scheme: forest green, brown, tan.
Music suggestions: Jurassic Park theme, jungle sounds.
```

---

## Security Considerations

| Threat | Mitigation |
|--------|-----------|
| XSS in RSVP guest input | Sanitize all text inputs. React auto-escapes JSX. CSP headers. |
| RSVP spam flooding | Rate limit: 10 RSVPs/IP/hour via Upstash Redis |
| AI prompt injection via party details | User input goes into data fields, not system prompt. Structured JSON output reduces injection surface. |
| Stripe webhook forgery | Verify Stripe signature on every webhook |
| Unauthorized plan access | RLS: users can only access their own parties |
| RSVP slug enumeration | UUIDs for party IDs, short random slugs (nanoid 8 chars) for RSVP URLs |
| Plan data scraping | Rate limiting on API routes. Auth required for plan generation. |

### Headers (next.config.mjs)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Failure Modes Registry

```
CODEPATH              | FAILURE MODE              | HANDLED? | TESTED? | USER SEES           | LOGGED?
──────────────────────|───────────────────────────|──────────|─────────|─────────────────────|────────
Plan generation       | OpenAI timeout (>30s)     | Y        | Y       | "Taking too long"   | Y
Plan generation       | OpenAI 429 rate limit     | Y        | Y       | "Busy, try again"   | Y
Plan generation       | Malformed JSON response   | Y        | Y       | Retry, then fallback| Y
Plan generation       | OpenAI refusal            | Y        | Y       | Generic plan        | Y
Plan generation       | DB save fails             | Y        | Y       | "Error saving"      | Y
RSVP submission       | Invalid slug              | Y        | Y       | 404 page            | N
RSVP submission       | Past deadline             | Y        | Y       | "RSVPs closed"      | N
RSVP submission       | Rate limited              | Y        | Y       | 429 silent          | Y
RSVP submission       | Duplicate email           | Y        | Y       | Upsert (update)     | N
Stripe checkout       | Session creation fails    | Y        | Y       | "Payment error"     | Y
Stripe webhook        | Invalid signature         | Y        | Y       | 400 (silent)        | Y
Stripe webhook        | Party not found           | Y        | Y       | Log warning         | Y
Theme loading         | No themes in DB           | Y        | N       | Hardcoded fallbacks | N
Auth                  | Session expired           | Y        | Y       | Redirect to login   | N
Print view            | Plan not generated        | Y        | Y       | "Generate first"    | N
Share link            | Party deleted/archived     | Y        | Y       | "No longer available"| N
```

**CRITICAL GAP:** AI JSON parsing failure needs robust fallback. If GPT returns malformed JSON after retry, serve a pre-built generic plan template for the theme (static fallback data stored in theme_templates.fallback_plan JSONB column).

---

## Edge Cases

### Plan Generation
| Edge Case | Handling |
|-----------|---------|
| Budget = $0 or very low ($20) | AI adapts plan to "free/DIY" activities, dollar store shopping list |
| Headcount = 1 (just the birthday child) | AI generates intimate celebration plan, skip group games |
| Headcount = 100 (huge party) | AI scales quantities, suggests venue rental, multiple activity stations |
| Age = 1 (baby's first birthday) | AI focuses on parent-friendly activities, safe food, photo opportunities |
| Age = 17-18 (teen party) | AI adapts to teen-appropriate activities (no pin-the-tail) |
| Offensive theme requested | Theme is from curated list (10 options) — no free-text theme input in MVP |
| Multiple dietary restrictions | AI incorporates all restrictions into food menu with clear labeling |

### RSVP
| Edge Case | Handling |
|-----------|---------|
| Guest submits RSVP twice (same email) | Upsert — update existing RSVP |
| Guest changes mind after RSVP | Can re-submit via same link — upsert handles it |
| 50+ RSVPs (large party) | Paginate on parent dashboard. No hard limit. |
| RSVP after deadline | Show "RSVPs are closed" message, don't accept |
| Guest tries XSS in name/notes | Sanitize input, React escapes output |
| RSVP link shared publicly (spam) | Rate limit per IP. Party owner can disable RSVP. |

### Payment
| Edge Case | Handling |
|-----------|---------|
| User navigates away during Stripe checkout | Party stays draft. Can retry checkout. |
| Webhook arrives before redirect | Webhook sets is_premium. Page checks on load. Both paths work. |
| User tries to generate plan without paying (after free limit) | Check party count. Redirect to checkout if > 1 and not premium. |

---

## File Structure

```
projects/2026-03-21-partypop/src/
├── supabase/
│   ├── schema.sql              # All tables, indexes, RLS, triggers
│   └── seed.sql                # 10 theme templates
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (nav, footer)
│   │   ├── page.tsx            # Landing page (hero, themes, pricing, CTA)
│   │   ├── login/
│   │   │   └── page.tsx        # Auth page (Supabase magic link)
│   │   ├── dashboard/
│   │   │   └── page.tsx        # My parties list
│   │   ├── plan/
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Plan wizard (multi-step form)
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # View/edit generated plan
│   │   │       ├── rsvp/
│   │   │       │   └── page.tsx # RSVP management dashboard
│   │   │       ├── print/
│   │   │       │   └── page.tsx # Print-friendly view
│   │   │       └── share/
│   │   │           └── page.tsx # Public shareable plan view
│   │   ├── rsvp/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # Guest RSVP form (public, no auth)
│   │   │       └── confirmed/
│   │   │           └── page.tsx # RSVP confirmation
│   │   ├── themes/
│   │   │   └── page.tsx        # Theme gallery
│   │   ├── api/
│   │   │   ├── plans/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts # AI plan generation
│   │   │   ├── rsvp/
│   │   │   │   └── route.ts    # RSVP submission
│   │   │   ├── checkout/
│   │   │   │   └── route.ts    # Stripe session creation
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts # Stripe webhook
│   │   │   └── themes/
│   │   │       └── route.ts    # List themes
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn components (Button, Card, Input, etc.)
│   │   ├── PlanWizard.tsx      # Multi-step plan creation form
│   │   ├── PlanView.tsx        # Rendered plan display (timeline, activities, etc.)
│   │   ├── PlanSection.tsx     # Reusable section (timeline, food, shopping list)
│   │   ├── ShoppingList.tsx    # Interactive shopping list with checkboxes
│   │   ├── Timeline.tsx        # Visual day-of timeline
│   │   ├── RsvpForm.tsx        # Guest RSVP form (public)
│   │   ├── RsvpDashboard.tsx   # Parent RSVP management view
│   │   ├── ThemeCard.tsx       # Theme selection card
│   │   ├── ThemeGrid.tsx       # Grid of theme cards
│   │   ├── PricingCard.tsx     # Pricing display
│   │   └── PrintView.tsx       # Print-optimized plan layout
│   ├── lib/
│   │   ├── supabase.ts         # Supabase clients (browser + server)
│   │   ├── openai.ts           # OpenAI client + plan generation
│   │   ├── stripe.ts           # Stripe client + checkout helpers
│   │   ├── resend.ts           # Email client
│   │   ├── validation.ts       # Zod schemas
│   │   ├── themes.ts           # Theme config + prompt templates
│   │   ├── slug.ts             # nanoid slug generator for RSVP URLs
│   │   └── rate-limit.ts       # Upstash rate limiter
│   └── types/
│       └── index.ts            # TypeScript types (Party, RSVP, Theme, PlanData)
├── public/
│   ├── og-image.png
│   └── favicon.ico
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

**~40 files.** Standard Next.js app complexity.

---

## Deployment Plan

### Infrastructure
```
GitHub → Vercel (build + deploy) → Vercel Edge (serve)
                                ↓
                          Supabase (DB + Auth)
                                ↓
                          OpenAI (plan generation)
                                ↓
                          Stripe (payments)
                                ↓
                          Resend (email)
                                ↓
                          Upstash Redis (rate limiting)
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=        # $4.99 Party Pass
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=https://partypop.app
```

### Deploy Sequence
1. Create Supabase project → run schema.sql → run seed.sql (10 themes)
2. Create Stripe product + $4.99 price → get price ID
3. Create Upstash Redis instance
4. Set up Resend + verify domain
5. Push to GitHub → Connect Vercel → Set env vars → Deploy
6. Configure Stripe webhook URL → `https://partypop.app/api/webhooks/stripe`
7. Verify: landing loads, wizard works, plan generates, RSVP works, payment works
8. Register domain → point DNS to Vercel
9. Submit sitemap to Google Search Console

### Rollback
- Vercel instant rollback to any previous deployment
- Supabase migrations versioned
- No destructive operations in MVP

---

## Completion Summary

```
+====================================================================+
|            ENG REVIEW — COMPLETION SUMMARY                          |
+====================================================================+
| Mode selected        | SCOPE REDUCTION (overnight MVP)              |
| Tech Stack           | Next.js 14 + Supabase + OpenAI + Stripe +   |
|                      | Tailwind/shadcn + Resend + Upstash           |
| Database             | 4 tables, 6 indexes, 5 RLS policies          |
| Pages                | 12 routes (7 auth, 5 public)                 |
| API Endpoints        | 5 routes + 1 webhook                         |
| Data Flows           | 3 flows mapped with shadow paths             |
| AI Prompts           | 10 themed templates + structured JSON output |
| Security             | RLS, rate limiting, input validation,         |
|                      | Stripe signature verification, CSP headers   |
| Failure Modes        | 16 mapped, 1 critical (AI JSON fallback)     |
| Edge Cases           | 17 identified with handling                   |
| File Structure       | ~40 files                                     |
| Deployment           | Vercel + Supabase + Stripe + 5 env services  |
+====================================================================+
```
