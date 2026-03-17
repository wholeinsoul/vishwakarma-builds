# Engineering Review — On Special
## AI Specials-to-Content Tool for Bars & Restaurants
**Date:** 2026-03-17

---

## Step 0: Scope Challenge

### What already exists that solves sub-problems?
| Sub-problem | Existing Solution | Reuse? |
|-------------|------------------|--------|
| AI content generation | OpenAI API (GPT-4o) | ✅ Direct API call |
| User auth | Supabase Auth (email/password, magic link) | ✅ Built-in |
| Database + storage | Supabase Postgres + Storage | ✅ Built-in |
| Payments | Stripe Checkout + Customer Portal | ✅ Hosted checkout |
| Frontend framework | Next.js App Router | ✅ Standard stack |
| Clipboard API | Browser Navigator.clipboard | ✅ Native |
| Social media formatting | None — must build | 🔨 Custom prompts per platform |

### Minimum set of changes
The entire app is greenfield, so "minimum changes" = minimum features:

1. **Auth** — Supabase email/password (skip OAuth providers for V1)
2. **Bar profile** — One form, one table
3. **Specials input** — One textarea + category selector
4. **AI generation** — One API route calling OpenAI
5. **Content preview** — Three cards (IG/FB/Google) with copy buttons
6. **Content history** — One list page
7. **Landing page** — Static, no CMS
8. **Stripe checkout** — One subscription tier ($99/mo)

**File count estimate:** ~15-20 files. Acceptable for a full-stack MVP.

### NOT in scope (explicitly deferred)
| Item | Rationale |
|------|-----------|
| Auto-posting (Instagram/Facebook/Google APIs) | OAuth per-bar per-platform adds 2-3 days. Phase 1.5. |
| POS integration (Toast/Square/Clover) | Requires API partnerships. Phase 2. |
| Weather-reactive posting | Third-party API + logic layer. Phase 2. |
| Event detection | NLP + local event APIs. Phase 2. |
| Consumer discovery app | Two-sided marketplace. Phase 3. |
| Multi-location dashboards | Phase 2. |
| AI image generation | Quality unreliable for V1. |
| Analytics/reporting | Phase 1.5. |
| Mobile app | Web-first. Responsive design suffices. |
| Team/staff accounts | Single-user per bar for V1. |
| Content scheduling | V1 is generate-now. Scheduling is Phase 1.5. |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                             │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Landing   │  │ Dashboard    │  │ History  │  │ Settings      │  │
│  │ Page      │  │ (Generate)   │  │ Page     │  │ (Bar Profile) │  │
│  └──────────┘  └──────┬───────┘  └──────────┘  └───────────────┘  │
│                       │                                             │
│                       │ POST /api/generate                          │
└───────────────────────┼─────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────────┐
│                  NEXT.JS SERVER (Vercel)                             │
│                       │                                             │
│  ┌────────────────────┼────────────────────────────────────┐       │
│  │              API Routes (Route Handlers)                 │       │
│  │                    │                                     │       │
│  │  /api/generate ────┤──→ Validate input                  │       │
│  │                    │──→ Check subscription (Supabase)    │       │
│  │                    │──→ Rate limit check                 │       │
│  │                    │──→ Build platform-specific prompts  │       │
│  │                    │──→ Call OpenAI API                   │       │
│  │                    │──→ Parse + format response           │       │
│  │                    │──→ Store in content_history          │       │
│  │                    └──→ Return 3 platform posts           │       │
│  │                                                          │       │
│  │  /api/bar-profile ──→ CRUD bar settings                  │       │
│  │  /api/stripe/checkout ──→ Create Stripe session          │       │
│  │  /api/stripe/webhook ──→ Handle payment events           │       │
│  │  /api/history ──→ List past generations                  │       │
│  └──────────────────────────────────────────────────────────┘       │
│                       │                    │                         │
└───────────────────────┼────────────────────┼────────────────────────┘
                        │                    │
            ┌───────────┘                    └───────────┐
            ▼                                            ▼
┌───────────────────────┐                  ┌──────────────────────────┐
│     OPENAI API        │                  │       SUPABASE           │
│                       │                  │                          │
│  GPT-4o-mini          │                  │  ┌─────────────────┐    │
│  - IG caption gen     │                  │  │ Auth (email/pw)  │    │
│  - FB post gen        │                  │  ├─────────────────┤    │
│  - Google update gen  │                  │  │ Postgres DB      │    │
│                       │                  │  │  - users         │    │
│  ~$0.001-0.003/gen    │                  │  │  - bar_profiles  │    │
│                       │                  │  │  - generations   │    │
│                       │                  │  │  - subscriptions │    │
│                       │                  │  ├─────────────────┤    │
│                       │                  │  │ Row Level Sec.   │    │
│                       │                  │  └─────────────────┘    │
└───────────────────────┘                  └──────────────────────────┘
                                                         │
                                           ┌─────────────┘
                                           ▼
                                ┌──────────────────────┐
                                │      STRIPE          │
                                │                      │
                                │  Checkout Sessions   │
                                │  Customer Portal     │
                                │  Webhooks            │
                                │  $99/mo subscription  │
                                └──────────────────────┘
```

---

## Data Flow — Generate Specials Content

### Happy Path

```
User types specials ──→ POST /api/generate
                              │
                              ├─ 1. Validate: specials text present? ✅
                              ├─ 2. Auth: Supabase session valid? ✅
                              ├─ 3. Subscription: active? ✅
                              ├─ 4. Rate limit: <50 gens/day? ✅
                              ├─ 5. Fetch bar_profile (name, voice, hashtags)
                              ├─ 6. Build prompts (3 platform-specific)
                              ├─ 7. OpenAI API call (single call, structured output)
                              ├─ 8. Parse response → { instagram, facebook, google }
                              ├─ 9. INSERT into generations table
                              └─ 10. Return JSON → UI renders 3 preview cards
```

### Shadow Paths (nil, empty, error)

```
                              ┌─ specials_text is nil/empty
                              │  → 400 { error: "Please enter tonight's specials" }
                              │
                              ├─ No auth session / expired token
                              │  → 401 { error: "Please sign in" }
                              │  → Redirect to /login
                              │
                              ├─ No active subscription
                              │  → 403 { error: "subscription_required" }
                              │  → UI shows upgrade CTA
                              │
                              ├─ Rate limit exceeded (>50/day)
                              │  → 429 { error: "Daily limit reached", reset_at: ISO }
                              │
                              ├─ bar_profile not found (user hasn't set up)
                              │  → Use defaults: generic bar name, casual voice
                              │  → Response includes warning: "Set up your bar profile for better results"
                              │
                              ├─ bar_profile exists but name/voice is empty string
                              │  → Treat as nil, use defaults
                              │  → Same warning as above
                              │
                              ├─ OpenAI API timeout (>15s)
                              │  → 504 { error: "Content generation timed out. Please try again." }
                              │  → No row inserted in generations
                              │
                              ├─ OpenAI API 429 (rate limited)
                              │  → 503 { error: "Service busy. Please try again in a moment." }
                              │  → Log for monitoring
                              │
                              ├─ OpenAI API 500/503 (service down)
                              │  → 503 { error: "Content service temporarily unavailable." }
                              │  → Log + alert
                              │
                              ├─ OpenAI returns malformed JSON / missing fields
                              │  → Attempt partial parse: return whichever platforms succeeded
                              │  → If all 3 fail: 500 { error: "Content generation failed. Please try again." }
                              │  → Log raw response for debugging
                              │
                              ├─ OpenAI returns empty content for one platform
                              │  → Return other 2 + warning for empty one
                              │  → UI shows "Couldn't generate [platform] content. Try regenerating."
                              │
                              ├─ Supabase INSERT fails (DB down)
                              │  → Still return generated content to user (don't block on history save)
                              │  → Log error, content is lost from history but user has it in UI
                              │
                              └─ specials_text > 2000 chars
                                 → 400 { error: "Specials text too long (max 2000 chars)" }
```

---

## Tech Stack Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14+ (App Router) | Standard for overnight builds. SSR for landing page SEO. API routes built-in. Vercel deployment in minutes. |
| **Language** | TypeScript | Type safety prevents shadow path bugs. Worth the 5% overhead. |
| **Database** | Supabase (Postgres) | Auth + DB + RLS in one service. Free tier handles MVP traffic. Row Level Security means we don't write auth middleware for every query. |
| **AI** | OpenAI GPT-4o-mini | Fast, cheap ($0.15/1M input tokens), good enough for social media copy. GPT-4o as fallback for quality issues. |
| **Payments** | Stripe Checkout | Hosted checkout = no PCI concerns. Customer Portal for self-serve cancellation. Webhook for subscription events. |
| **Styling** | Tailwind CSS + shadcn/ui | Fast to build, consistent. shadcn/ui gives us pre-built form components, cards, buttons. |
| **Deployment** | Vercel | Git push = deploy. Free tier handles MVP. Auto-SSL, edge functions, analytics. |
| **Email** | Supabase Auth emails (built-in) | Magic link / confirmation emails. No SendGrid/Resend needed for V1. |

### Why NOT these alternatives:
- **Remix/SvelteKit** — Less ecosystem support, slower to prototype with
- **Firebase** — Equivalent to Supabase but less SQL-native, harder to do complex queries later
- **Claude API** — OpenAI structured outputs are more reliable for JSON formatting
- **Paddle** — Stripe has better docs and wider adoption
- **Railway/Fly.io** — Vercel is simpler for Next.js specifically

---

## Database Schema

```sql
-- Users are managed by Supabase Auth (auth.users table)
-- We extend with our own tables

-- =============================================
-- BAR PROFILES
-- =============================================
CREATE TABLE bar_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_name TEXT NOT NULL DEFAULT '',
  brand_voice TEXT NOT NULL DEFAULT 'casual',
    -- ENUM-like: 'casual', 'upscale', 'fun', 'edgy', 'classic'
  default_hashtags TEXT[] DEFAULT '{}',
    -- e.g., {'#happyhour', '#downtown', '#cocktails'}
  social_handles JSONB DEFAULT '{}',
    -- { instagram: '@mybar', facebook: 'mybar', google_place_id: '...' }
  logo_url TEXT,
  location_city TEXT,
  location_state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bar_profiles_user_id_unique UNIQUE(user_id)
  -- V1: one bar per user. Multi-location is Phase 2.
);

-- =============================================
-- GENERATIONS (content history)
-- =============================================
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_profile_id UUID REFERENCES bar_profiles(id) ON DELETE SET NULL,

  -- Input
  specials_text TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'daily_special',
    -- 'daily_special', 'happy_hour', 'live_music', 'sports_night',
    -- 'themed_event', 'weekend_brunch', 'late_night'

  -- Generated output (one column per platform)
  instagram_caption TEXT,
  instagram_hashtags TEXT[],
  facebook_post TEXT,
  google_update TEXT,

  -- Metadata
  model_used TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  generation_time_ms INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user's history page (most recent first)
CREATE INDEX idx_generations_user_created
  ON generations(user_id, created_at DESC);

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
    -- 'active', 'past_due', 'canceled', 'trialing', 'inactive'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_user_id_unique UNIQUE(user_id)
);

-- =============================================
-- RATE LIMITING (simple, DB-based)
-- =============================================
CREATE TABLE rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (user_id, date)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE bar_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users access own bar_profiles"
  ON bar_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users access own generations"
  ON generations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
  -- Writes to subscriptions happen via webhook (service role key)

CREATE POLICY "Users access own rate_limits"
  ON rate_limits FOR ALL
  USING (auth.uid() = user_id);
```

### Schema Notes
- **One bar per user (V1).** `bar_profiles.user_id` is UNIQUE. Multi-location requires schema change (remove unique, add bar selector).
- **Generations are immutable.** No UPDATE policy. Users generate new content, never edit old rows.
- **Subscriptions are webhook-managed.** Only the Stripe webhook (using service role key) writes to subscriptions. Users can only read their own.
- **Rate limits use compound PK.** `(user_id, date)` auto-resets daily. `UPSERT` on each generation.
- **Soft delete not needed.** User deletes cascade. No compliance requirement to retain data (V1).

---

## API Endpoints / Pages

### API Routes

```
POST   /api/generate
  Body: { specials_text: string, template_type: string }
  Auth: Required (Supabase session)
  Sub:  Required (active subscription)
  Rate: 50/day
  Returns: {
    instagram: { caption: string, hashtags: string[] },
    facebook: { post: string },
    google: { update: string },
    generation_id: string,
    warnings: string[]
  }

GET    /api/history
  Auth: Required
  Query: ?page=1&limit=20
  Returns: { generations: Generation[], total: number }

GET    /api/bar-profile
  Auth: Required
  Returns: BarProfile | null

PUT    /api/bar-profile
  Auth: Required
  Body: { bar_name, brand_voice, default_hashtags, social_handles, logo_url, location_city, location_state }
  Returns: BarProfile

POST   /api/stripe/create-checkout
  Auth: Required
  Returns: { checkout_url: string }

POST   /api/stripe/webhook
  Auth: Stripe signature verification
  Handles: checkout.session.completed, invoice.paid, invoice.payment_failed,
           customer.subscription.updated, customer.subscription.deleted

GET    /api/stripe/portal
  Auth: Required
  Returns: { portal_url: string }
```

### Pages

```
/                   Landing page (public)
                    - Hero: "Type tonight's specials. Post in 30 seconds."
                    - Demo video/GIF
                    - Pricing ($99/mo)
                    - Testimonials (placeholder for V1)
                    - CTA → /signup

/login              Email/password login
/signup             Registration + redirect to /onboarding
/onboarding         Bar profile setup (first-time flow)

/dashboard          Main generate page (protected)
                    - Specials textarea
                    - Template type selector
                    - Generate button
                    - Preview cards (IG / FB / Google)
                    - Copy-to-clipboard per card

/history            Past generations list (protected)
                    - Date, specials text, expand to see generated content
                    - Re-copy button

/settings           Bar profile + subscription management (protected)
                    - Edit bar name, voice, hashtags, handles
                    - Manage subscription (→ Stripe Portal)

/pricing            Pricing page (public, linked from landing)
```

### Page → API mapping

```
/dashboard      → POST /api/generate
                → GET  /api/bar-profile (for preview context)
/history        → GET  /api/history
/settings       → GET  /api/bar-profile
                → PUT  /api/bar-profile
                → GET  /api/stripe/portal
/signup         → Supabase Auth signUp()
/login          → Supabase Auth signInWithPassword()
/onboarding     → PUT  /api/bar-profile
/pricing        → POST /api/stripe/create-checkout
```

---

## Component Hierarchy

```
<RootLayout>
├── <LandingPage />                    ← /
│   ├── <Hero />
│   ├── <HowItWorks />
│   ├── <PricingCard />
│   └── <Footer />
│
├── <AuthLayout>                       ← /login, /signup
│   ├── <LoginForm />
│   └── <SignupForm />
│
└── <DashboardLayout>                  ← /dashboard, /history, /settings
    ├── <Sidebar />
    │   ├── <NavLink to="/dashboard" />
    │   ├── <NavLink to="/history" />
    │   └── <NavLink to="/settings" />
    │
    ├── <DashboardPage />              ← /dashboard
    │   ├── <SpecialsForm />
    │   │   ├── <Textarea />           (specials input)
    │   │   ├── <TemplateSelector />   (happy_hour, live_music, etc.)
    │   │   └── <GenerateButton />
    │   │
    │   └── <ContentPreview />
    │       ├── <PlatformCard platform="instagram" />
    │       │   ├── <ContentText />
    │       │   ├── <HashtagList />
    │       │   └── <CopyButton />
    │       ├── <PlatformCard platform="facebook" />
    │       │   ├── <ContentText />
    │       │   └── <CopyButton />
    │       └── <PlatformCard platform="google" />
    │           ├── <ContentText />
    │           └── <CopyButton />
    │
    ├── <HistoryPage />                ← /history
    │   └── <GenerationList />
    │       └── <GenerationCard />     (expandable)
    │
    └── <SettingsPage />               ← /settings
        ├── <BarProfileForm />
        └── <SubscriptionManager />
```

---

## AI Prompt Architecture

### Strategy: Single API call with structured output

One call to GPT-4o-mini with structured output (JSON mode) generating all 3 platforms. This is cheaper and faster than 3 separate calls.

```
System prompt:
  "You are a social media expert for bars and restaurants.
   Generate content for tonight's specials.
   Match the brand voice: {voice}.
   Bar name: {bar_name}.
   Include relevant emojis.
   NEVER mention competitor bars.
   Keep Instagram captions under 2200 chars.
   Keep Facebook posts under 500 chars.
   Keep Google updates under 1500 chars."

User prompt:
  "Template: {template_type}
   Tonight's specials: {specials_text}
   Default hashtags to include: {hashtags}
   Social handles: {handles}

   Generate JSON:
   {
     instagram: { caption: string, hashtags: string[] },
     facebook: { post: string },
     google: { update: string }
   }"
```

### Template-specific prompt additions

| Template | Additional prompt context |
|----------|--------------------------|
| `happy_hour` | "Focus on time-limited deals, urgency, FOMO. Mention start/end times if provided." |
| `live_music` | "Lead with the performer/genre. Build excitement. Mention cover charge if provided." |
| `sports_night` | "Reference the game/sport if mentioned. Focus on watch party vibe, food/drink deals during the game." |
| `themed_event` | "Play up the theme. Be creative with language matching the theme (e.g., St. Paddy's = Irish puns)." |
| `daily_special` | "Straightforward. Lead with the deal. Make it appetizing." |
| `weekend_brunch` | "Relaxed vibe. Focus on brunch cocktails (mimosas, bloody marys) and food." |
| `late_night` | "Night owl energy. Focus on late-night bites and drinks. Mention hours." |

---

## Failure Modes

| Failure | Probability | User Impact | Handling |
|---------|-------------|-------------|----------|
| **OpenAI API down** | Low (99.9% uptime) | Can't generate content | Show error, suggest trying again in 1 min. Log alert. |
| **OpenAI returns garbage/refusal** | Low-Med | Gets unusable content | Detect via JSON parse failure. Retry once with slightly modified prompt. If still fails, show error. |
| **Supabase DB down** | Very Low | Can't auth, can't save history | Auth failure → show maintenance page. History save failure → still return content to user (degrade gracefully). |
| **Stripe webhook missed** | Low | Sub status out of sync | Cron job (daily) to reconcile via Stripe API. |
| **User submits XSS in specials text** | Certain (attempted) | Potential XSS if rendered raw | Sanitize all user input. React's JSX auto-escapes. Never use `dangerouslySetInnerHTML`. |
| **User submits prompt injection** | Medium | AI generates unexpected content | Specials text goes in user prompt (not system). System prompt is hardcoded. Output is text-only, never executed. Low risk. |
| **Rate limit race condition** | Low | User gets extra generations | `UPSERT ... SET count = count + 1` is atomic in Postgres. No race. |
| **Expired Supabase JWT** | Medium | 401 on API calls | Client-side: Supabase auto-refreshes tokens. If refresh fails, redirect to /login. |
| **Vercel cold start** | Medium | First request slow (~1-3s) | Acceptable for V1. Not user-facing since OpenAI call takes 2-5s anyway. |
| **User has no bar profile** | Common (new users) | Generic content quality | Use defaults + show warning. Redirect to /onboarding on first login. |
| **Copy-to-clipboard fails (HTTP)** | Low | Button doesn't work | Clipboard API requires HTTPS (Vercel provides this). Fallback: select-all text in a textarea. |
| **Stripe checkout abandoned** | Common | User signs up but doesn't pay | Allow limited free generations (3/day) without subscription. Nudge to upgrade. |

### Critical Gaps (no test + no handling + silent failure)

| Gap | Status |
|-----|--------|
| Stripe webhook signature verification fails silently | **MUST TEST** — if webhook processing fails, subscription status never updates. User pays but shows as inactive. Add logging + alert. |
| OpenAI response missing one platform field | **MUST HANDLE** — partial success should still return working platforms. Current design handles this (see shadow paths). |

---

## Edge Cases

1. **Specials text is just emoji:** "🍺🍕🎵" → AI should still generate reasonable content. Test this.
2. **Specials text is in Spanish/other language:** AI should generate content in the same language. Add to system prompt: "Match the language of the input."
3. **Bar name contains special characters:** "O'Malley's Bar & Grill" — ensure no SQL injection (parameterized queries via Supabase client) and proper display.
4. **User generates 50 times in rapid succession:** Rate limit handles count. But what about concurrent requests? Use DB-level atomic increment.
5. **User on free tier (no subscription yet):** Allow 3 free generations to demonstrate value. Track via rate_limits table (check subscription status in /api/generate).
6. **Very long specials text (2000 chars):** Valid input but expensive token-wise. Cap at 2000 chars client-side AND server-side.
7. **User copies content, then navigates away, then wants it again:** History page covers this.
8. **Two browser tabs, same user, generate simultaneously:** Both succeed. Both save to history. No conflict (separate generation rows).
9. **Hashtags contain # prefix vs. not:** Normalize: strip leading # on save, add # on display.
10. **User hasn't verified email:** Supabase Auth handles this. Block dashboard access until verified.

---

## Security Considerations

### Authentication & Authorization
- **Supabase Auth** handles JWT issuance, refresh, and validation
- **Row Level Security (RLS)** on all tables — users can ONLY access their own data
- **Service role key** used ONLY server-side (API routes, webhook handler). NEVER exposed to client.
- **Supabase anon key** is safe to expose client-side (it only works with RLS policies)

### Input Validation
- Server-side validation on ALL API routes (never trust client)
- `specials_text`: required, string, max 2000 chars, trimmed
- `template_type`: must be one of enum values
- `bar_name`: max 200 chars
- `brand_voice`: must be one of enum values
- `default_hashtags`: array of strings, max 30 items, max 100 chars each

### API Security
- **Stripe webhooks:** Verify signature using `stripe.webhooks.constructEvent()` with webhook secret
- **OpenAI API key:** Server-side only, environment variable, never exposed to client
- **Rate limiting:** DB-based per-user daily limit (50 gens/day). Prevents abuse and controls OpenAI costs.
- **CORS:** Next.js API routes are same-origin by default. No CORS headers needed.

### Content Security
- React JSX auto-escapes all rendered text (XSS protection)
- Never use `dangerouslySetInnerHTML` with user or AI-generated content
- AI prompt injection: low risk since output is display-only text, never executed as code
- CSP headers via `next.config.js`: restrict script sources

### Data Privacy
- No PII beyond email and bar name
- No credit card data stored (Stripe handles everything)
- User deletion cascades all data (GDPR-ready by design)
- No third-party analytics for V1 (add privacy-respecting analytics later)

### Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-only
OPENAI_API_KEY=sk-...                      # Server-only
STRIPE_SECRET_KEY=sk_live_...              # Server-only
STRIPE_WEBHOOK_SECRET=whsec_...            # Server-only
STRIPE_PRICE_ID=price_...                  # The $99/mo price ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...  # Client-safe
```

---

## Deployment Plan

### Infrastructure Setup (30 minutes)

1. **Supabase project** — Create project, run schema SQL, enable RLS, configure Auth (email/password + magic link)
2. **Stripe setup** — Create product ($99/mo), get price ID, configure webhook endpoint URL, set webhook secret
3. **Vercel project** — Connect to GitHub repo, set environment variables, deploy
4. **Domain** — Optional for V1. Use `on-special.vercel.app` or buy `onspecial.app`

### Deployment Steps

```
1. Create GitHub repo: wholeinsoul/on-special
2. Initialize Next.js project with TypeScript + Tailwind + shadcn/ui
3. Set up Supabase:
   - Create project on supabase.com
   - Run schema migration (tables + RLS policies)
   - Get anon key + service role key
4. Set up Stripe:
   - Create product: "On Special Pro" at $99/month
   - Create webhook endpoint pointing to /api/stripe/webhook
   - Events to listen: checkout.session.completed, invoice.paid,
     invoice.payment_failed, customer.subscription.updated,
     customer.subscription.deleted
5. Deploy to Vercel:
   - Connect GitHub repo
   - Set all environment variables
   - Deploy
6. Verify:
   - Sign up flow works
   - Bar profile save works
   - Content generation works
   - Stripe checkout works
   - Webhook processes payment
   - Rate limiting works
```

### Cost Estimates (Monthly at 100 users)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby (free) → Pro ($20/mo) | $0-20 |
| Supabase | Free tier (500MB, 50K auth) | $0 |
| OpenAI | ~100 users × 5 gens/day × 30 days = 15K calls × $0.002 = $30 | $30 |
| Stripe | 2.9% + $0.30 per transaction | ~$300 (on $9,900 MRR) |
| Domain | .app domain | $14/year |
| **Total** | | **~$50-350/mo** |

Revenue at 100 users: $9,900/mo. Margin: >95%.

---

## Implementation Order (Build Sequence)

```
Phase 1: Foundation (45 min)
  ├── Next.js project setup + Tailwind + shadcn/ui
  ├── Supabase client setup
  ├── Auth pages (login, signup)
  └── Dashboard layout + sidebar

Phase 2: Core Feature (60 min)
  ├── Bar profile form + API route
  ├── Specials input form
  ├── /api/generate route (OpenAI integration)
  ├── Content preview cards (IG/FB/Google)
  └── Copy-to-clipboard buttons

Phase 3: Payments (30 min)
  ├── Stripe checkout API route
  ├── Stripe webhook handler
  ├── Subscription gate on /api/generate
  └── Pricing page / upgrade CTA

Phase 4: Polish (30 min)
  ├── Landing page
  ├── History page
  ├── Onboarding flow (first-time bar profile setup)
  ├── Loading states + error handling
  └── Rate limiting

Phase 5: Deploy (15 min)
  ├── GitHub push
  ├── Vercel deploy
  ├── Environment variables
  └── Smoke test all flows
```

**Total estimated build time: ~3 hours**

---

## Completion Summary

- **Scope:** Greenfield MVP — 15-20 files, 4 DB tables, 6 API routes, 7 pages
- **Architecture:** Next.js App Router → Supabase (Auth + DB) + OpenAI + Stripe
- **Key design decisions:**
  - Single OpenAI call with structured JSON output (not 3 separate calls)
  - DB-based rate limiting (atomic UPSERT, no Redis needed for V1)
  - RLS for all data access (no custom auth middleware per query)
  - Copy-to-clipboard V1 (auto-posting deferred to Phase 1.5)
  - 3 free generations for non-subscribers (conversion funnel)
- **Critical gaps identified:** 2 (Stripe webhook failure handling, partial OpenAI response)
- **Edge cases mapped:** 10
- **Failure modes mapped:** 11
- **Estimated build time:** ~3 hours
