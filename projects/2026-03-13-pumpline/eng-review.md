# Engineering Review — Pumpline MVP
## Septic Provider Directory for Rural Homeowners
**Date:** 2026-03-13 | **Mode:** SCOPE REDUCTION (overnight build)

---

## Step 0: Scope Challenge

### What We're Building (and NOT Building)

**BUILD (MVP):**
1. County-level landing pages optimized for SEO
2. Provider profile pages with details + reviews
3. Homeowner review submission (no auth required)
4. Provider claim/premium listing flow
5. Lead magnet (Septic Maintenance Checklist) with email capture
6. Admin dashboard for review moderation

**NOT BUILDING (deferred):**
| Deferred Item | Rationale |
|--------------|-----------|
| Homeowner accounts/auth | Low-frequency use, unnecessary friction |
| Homeowner subscription tier | CEO review killed this — nobody pays $10/mo for 3-year service |
| Maintenance tracking/scheduling | Phase 2+ feature, not MVP |
| Property-level service records | Requires years of data to be valuable |
| IoT integration | Fantasy for overnight build |
| Data sales infrastructure | Years away from being viable |
| Provider messaging/chat | Phone calls are the UX for this audience |
| Mobile app | Responsive web is sufficient |
| Payment processing | Use Stripe Checkout link or manual invoicing for V1 |
| Real-time availability/dispatch | Requires provider buy-in at scale |

### Complexity Check
- **Pages:** 5 page types (Home, County listing, Provider profile, Submit review, Admin)
- **Database tables:** 5 (counties, providers, reviews, leads, admin_users)
- **API routes:** ~10 endpoints
- **New files:** ~25-30 (within acceptable range for a full app)

This is a content-heavy, CRUD-light application. The complexity is in SEO optimization and data seeding, not in application logic.

---

## Tech Stack Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSG for SEO (county/provider pages must be static HTML for Google), React for interactive bits (review form, search), Vercel deploy in one click |
| **Database** | Supabase (PostgreSQL) | Free tier, real-time not needed but nice-to-have for admin, built-in auth for admin panel, RLS for security |
| **Styling** | Tailwind CSS | Fast to build, responsive out of the box, no design system needed |
| **ORM** | Prisma | Type-safe queries, clean schema migrations, works great with Next.js |
| **Hosting** | Vercel | Free tier handles our traffic, automatic SSL, edge caching for static pages, zero-config deploy |
| **Email** | Resend (free tier) | Lead magnet delivery, 100 emails/day free, simple API |
| **Search** | Built-in PostgreSQL full-text search | No need for Algolia/Elasticsearch at this scale |
| **Analytics** | Plausible or Vercel Analytics | Privacy-friendly, no cookie banner needed |

**Why NOT:**
- ❌ Astro/Hugo (static site generators) — Need server-side functionality for review submission, admin panel, email capture
- ❌ WordPress — Slower, more attack surface, harder to deploy cleanly
- ❌ SvelteKit — Good option, but Next.js has better Vercel integration and larger ecosystem
- ❌ Separate backend API — Overkill; Next.js API routes handle everything we need

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
│   Homeowner (Google Search)    Provider (Direct Link)    Admin       │
└─────────┬──────────────────────────┬─────────────────────┬──────────┘
          │                          │                     │
          ▼                          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Static Pages  │  │  API Routes  │  │  Admin Pages (protected) │  │
│  │ (ISR/SSG)    │  │  /api/*      │  │  /admin/* (Supabase Auth)│  │
│  │              │  │              │  │                          │  │
│  │ /            │  │ POST review  │  │ Review moderation        │  │
│  │ /county/[s]  │  │ POST lead   │  │ Provider management      │  │
│  │ /provider/[s]│  │ GET search   │  │ Analytics dashboard      │  │
│  │ /blog/[s]    │  │ POST claim   │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                 │
└─────────┼─────────────────┼────────────────────────┼─────────────────┘
          │                 │                        │
          ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────┐ ┌───────────┐ │
│  │ counties  │ │ providers │ │  reviews   │ │leads │ │admin_users│ │
│  │           │ │           │ │            │ │      │ │           │ │
│  │ id        │ │ id        │ │ id         │ │ id   │ │ id        │ │
│  │ name      │◄┤ county_id │◄┤ provider_id│ │email │ │ email     │ │
│  │ state     │ │ name      │ │ author     │ │name  │ │ role      │ │
│  │ slug      │ │ slug      │ │ rating     │ │src   │ │           │ │
│  │ meta_*    │ │ services  │ │ body       │ │      │ │           │ │
│  └───────────┘ │ pricing   │ │ status     │ └──────┘ └───────────┘ │
│                │ phone     │ │ created_at │                         │
│                │ is_premium│ └────────────┘                         │
│                │ status    │                                        │
│                └───────────┘                                        │
│                                                                     │
│  Row Level Security (RLS) enabled on all tables                     │
│  Admin auth via Supabase Auth (email/password)                      │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   RESEND (Email)    │
│  Lead magnet PDF    │
│  Provider claim     │
│  notification       │
└─────────────────────┘
```

---

## Database Schema

### Table: `counties`
```sql
CREATE TABLE counties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,                    -- "Travis County"
  state       TEXT NOT NULL,                    -- "TX"
  state_full  TEXT NOT NULL,                    -- "Texas"
  slug        TEXT NOT NULL UNIQUE,             -- "travis-county-tx"
  description TEXT,                             -- SEO meta description
  population  INTEGER,                          -- For display/sorting
  septic_pct  DECIMAL(5,2),                    -- % households on septic
  meta_title  TEXT,                             -- Custom SEO title
  meta_desc   TEXT,                             -- Custom meta description
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_counties_slug ON counties(slug);
CREATE INDEX idx_counties_state ON counties(state);
CREATE INDEX idx_counties_active ON counties(is_active) WHERE is_active = true;
```

### Table: `providers`
```sql
CREATE TABLE providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id       UUID NOT NULL REFERENCES counties(id),
  name            TEXT NOT NULL,                  -- "Johnson Septic Services"
  slug            TEXT NOT NULL UNIQUE,            -- "johnson-septic-services-travis-tx"
  phone           TEXT,                            -- "(512) 555-0123"
  email           TEXT,                            -- Contact email
  website         TEXT,                            -- External website URL
  address         TEXT,                            -- Street address
  city            TEXT,
  state           TEXT NOT NULL,
  zip             TEXT,
  description     TEXT,                            -- Provider bio/about
  services        TEXT[] NOT NULL DEFAULT '{}',    -- {"pumping","repair","installation","inspection"}
  service_area    TEXT,                            -- "Travis County and surrounding areas"
  pricing_range   TEXT,                            -- "$250-$500 for standard pumping"
  response_time   TEXT,                            -- "Same-day available" / "24-48 hours"
  years_in_biz    INTEGER,                         -- Years in business
  license_number  TEXT,                            -- State license #
  is_verified     BOOLEAN NOT NULL DEFAULT false,  -- Manually verified by admin
  is_premium      BOOLEAN NOT NULL DEFAULT false,  -- Paying subscriber
  is_claimed      BOOLEAN NOT NULL DEFAULT false,  -- Provider has claimed listing
  claim_email     TEXT,                            -- Email used to claim
  photo_urls      TEXT[] DEFAULT '{}',             -- Array of image URLs
  avg_rating      DECIMAL(3,2) DEFAULT 0,          -- Computed average
  review_count    INTEGER NOT NULL DEFAULT 0,      -- Computed count
  sort_order      INTEGER NOT NULL DEFAULT 100,    -- Premium providers get lower = higher
  status          TEXT NOT NULL DEFAULT 'active'    -- active|pending|suspended
    CHECK (status IN ('active','pending','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_county ON providers(county_id);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_status ON providers(status) WHERE status = 'active';
CREATE INDEX idx_providers_premium ON providers(is_premium) WHERE is_premium = true;
CREATE INDEX idx_providers_sort ON providers(county_id, sort_order, avg_rating DESC);
```

### Table: `reviews`
```sql
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES providers(id),
  author_name   TEXT NOT NULL,                    -- "Sarah M."
  author_city   TEXT,                             -- "Round Rock, TX"
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,                             -- Review headline
  body          TEXT NOT NULL,                    -- Review text (min 20 chars)
  service_type  TEXT,                             -- "pumping" / "repair" / etc
  service_date  DATE,                             -- When was the service performed
  is_verified   BOOLEAN NOT NULL DEFAULT false,   -- Admin verified
  status        TEXT NOT NULL DEFAULT 'pending'   -- pending|approved|rejected|flagged
    CHECK (status IN ('pending','approved','rejected','flagged')),
  ip_hash       TEXT,                             -- Hashed IP for spam detection
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_pending ON reviews(status) WHERE status = 'pending';
CREATE INDEX idx_reviews_approved ON reviews(provider_id, created_at DESC) WHERE status = 'approved';
```

### Table: `leads`
```sql
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  name        TEXT,
  source      TEXT NOT NULL DEFAULT 'checklist',  -- checklist|newsletter|claim
  county_slug TEXT,                               -- Which county page they came from
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
```

### Table: `admin_users`
```sql
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'moderator'
    CHECK (role IN ('moderator','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Computed Fields (Triggers)
```sql
-- Update provider avg_rating and review_count when reviews change
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
```

---

## Page Map & Routes

### Public Pages (SSG/ISR — SEO-critical)

| Route | Page | Data Source | Cache |
|-------|------|------------|-------|
| `/` | Homepage | Top counties + stats | ISR 1hr |
| `/counties` | All counties listing | All active counties | ISR 1hr |
| `/county/[slug]` | County page (provider list) | County + active providers | ISR 30min |
| `/provider/[slug]` | Provider profile | Provider + approved reviews | ISR 30min |
| `/blog` | SEO blog index | Static MDX files | SSG |
| `/blog/[slug]` | Blog post | Static MDX | SSG |
| `/checklist` | Lead magnet landing page | Static | SSG |
| `/about` | About Pumpline | Static | SSG |
| `/for-providers` | Provider marketing page | Static | SSG |
| `/sitemap.xml` | Dynamic sitemap | All counties + providers | ISR 6hr |

### API Routes

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/search` | Search providers by county/name/zip | None |
| `POST` | `/api/reviews` | Submit a new review | None (rate-limited) |
| `POST` | `/api/leads` | Email capture for checklist | None (rate-limited) |
| `POST` | `/api/claim` | Provider claims their listing | None (sends verification email) |
| `GET` | `/api/counties` | List counties (for search autocomplete) | None |
| `GET` | `/api/providers/[id]/reviews` | Paginated reviews for provider | None |

### Admin Pages (Protected — Supabase Auth)

| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | Dashboard | Stats overview (providers, reviews, leads) |
| `/admin/reviews` | Review queue | Approve/reject pending reviews |
| `/admin/providers` | Provider management | Edit/verify/suspend providers |
| `/admin/leads` | Lead list | View + export email leads |
| `/admin/login` | Login | Supabase Auth email/password |

---

## Data Flow Diagrams

### Flow 1: Homeowner Finds Provider (Primary SEO Flow)

```
  Google Search: "septic pumping travis county tx"
       │
       ▼
  /county/travis-county-tx (Static HTML, cached at edge)
       │
       ├── [HAPPY] Page loads with 5-10 provider cards
       │         │
       │         ▼
       │    Homeowner clicks provider → /provider/johnson-septic-travis-tx
       │         │
       │         ├── [HAPPY] Profile loads with details + reviews
       │         │         │
       │         │         ▼
       │         │    Homeowner calls phone number (conversion!)
       │         │
       │         ├── [EMPTY] Provider has no reviews yet
       │         │    → Show "Be the first to review" CTA
       │         │    → Still show provider details (phone, services, area)
       │         │
       │         └── [ERROR] Provider page not found (slug changed/deleted)
       │              → Next.js notFound() → custom 404 with county search
       │
       ├── [EMPTY] County has no providers
       │    → Show "We're expanding to [county]" message
       │    → Email capture: "Get notified when we add providers here"
       │    → Suggest nearby counties
       │
       └── [ERROR] County slug not found
            → Next.js notFound() → custom 404 with search
```

### Flow 2: Review Submission

```
  Homeowner on /provider/[slug] clicks "Write a Review"
       │
       ▼
  Review form renders (inline on provider page)
       │
       ├── INPUT VALIDATION (client-side)
       │    ├── name: required, 2-50 chars, trimmed
       │    ├── rating: required, 1-5 stars
       │    ├── body: required, 20-2000 chars
       │    ├── service_type: optional select
       │    └── service_date: optional, must be ≤ today
       │
       ▼
  POST /api/reviews
       │
       ├── SERVER VALIDATION
       │    ├── [NIL] Missing required fields → 400 + field errors
       │    ├── [EMPTY] Body < 20 chars → 400 "Review too short"
       │    ├── [INVALID] Rating not 1-5 → 400 "Invalid rating"
       │    ├── [SPAM] Rate limit: max 3 reviews/IP/day → 429
       │    ├── [SPAM] Duplicate body text from same IP → 409
       │    └── [ERROR] Provider not found → 404
       │
       ├── PERSIST
       │    ├── [HAPPY] Insert review with status='pending' → 201
       │    ├── [ERROR] DB connection failed → 500 + log
       │    └── [ERROR] Constraint violation → 400 + log
       │
       ▼
  Response to client
       │
       ├── [HAPPY] "Thank you! Your review will appear after moderation."
       └── [ERROR] Show inline error message, preserve form data
```

### Flow 3: Email Lead Capture

```
  Homeowner on /checklist or any county page
       │
       ▼
  Email capture form (name optional, email required)
       │
       ▼
  POST /api/leads
       │
       ├── VALIDATION
       │    ├── [NIL] No email → 400
       │    ├── [INVALID] Bad email format → 400
       │    ├── [DUPLICATE] Email already exists → 200 (silent, don't reveal)
       │    └── [SPAM] Rate limit: 5/IP/hour → 429
       │
       ├── PERSIST
       │    ├── [HAPPY] Insert lead → send checklist PDF via Resend → 201
       │    └── [ERROR] Resend API fails → Still save lead, log error
       │         (lead saved even if email delivery fails — we can retry)
       │
       ▼
  "Check your email for the Septic Maintenance Checklist!"
```

### Flow 4: Provider Claim

```
  Provider visits /for-providers or sees "Claim this listing" on their profile
       │
       ▼
  POST /api/claim { provider_id, email, name, phone }
       │
       ├── VALIDATION
       │    ├── [NIL] Missing email → 400
       │    ├── [ALREADY CLAIMED] Provider already claimed → 409
       │    └── [NOT FOUND] Provider doesn't exist → 404
       │
       ├── [HAPPY] Send verification email via Resend with claim token
       │    └── Admin gets notification to review claim
       │
       └── [ERROR] Email send fails → 500, log, don't save claim
```

---

## SEO Architecture (Critical for This Product)

SEO is the #1 growth channel. The architecture must support it natively.

### Page Structure for Google
```
/                                    → "Find Trusted Septic Services Near You"
/county/travis-county-tx             → "Septic Services in Travis County, TX | Pumpline"
/county/wake-county-nc               → "Septic Services in Wake County, NC | Pumpline"
/provider/johnson-septic-travis-tx   → "Johnson Septic Services - Travis County, TX | Reviews & Pricing"
/blog/septic-maintenance-guide       → "Complete Guide to Septic System Maintenance (2026)"
```

### Required SEO Elements Per Page
- `<title>` — Unique, keyword-rich, <60 chars
- `<meta name="description">` — Unique, compelling, <160 chars
- `<h1>` — One per page, includes primary keyword
- Structured data (JSON-LD):
  - **County pages:** `LocalBusiness` collection
  - **Provider pages:** `LocalBusiness` + `AggregateRating` + `Review`
  - **Blog posts:** `Article`
- `<link rel="canonical">` — Self-referencing canonical on every page
- Internal linking: County pages link to providers, providers link back to county
- Breadcrumbs: Home > State > County > Provider (with `BreadcrumbList` schema)

### Sitemap Strategy
```xml
<!-- Dynamic sitemap.xml -->
<url>
  <loc>https://pumpline.com/county/travis-county-tx</loc>
  <lastmod>2026-03-13</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<!-- One entry per county page + provider page -->
```

---

## Security Considerations

### Input Validation & Sanitization
| Input | Threat | Mitigation |
|-------|--------|-----------|
| Review body text | XSS injection | Sanitize HTML (DOMPurify), escape on render, CSP headers |
| Review author name | XSS, SQL injection | Max 50 chars, alphanumeric + spaces only, parameterized queries (Prisma) |
| Email fields | Header injection | Validate email format, use Resend SDK (not raw SMTP) |
| Search queries | SQL injection | Prisma parameterized queries (safe by default) |
| Provider slug in URL | Path traversal | Validate against `[a-z0-9-]+` pattern |
| Claim token | Token forgery | Cryptographically random UUID, expire after 48 hours |

### Rate Limiting
| Endpoint | Limit | Window | Action on Exceed |
|----------|-------|--------|-----------------|
| `POST /api/reviews` | 3 per IP | 24 hours | 429 "Please try again tomorrow" |
| `POST /api/leads` | 5 per IP | 1 hour | 429 (silent) |
| `POST /api/claim` | 2 per IP | 24 hours | 429 |
| `GET /api/search` | 30 per IP | 1 minute | 429 |

**Implementation:** Use Vercel Edge Middleware with `@upstash/ratelimit` (Redis-based, free tier).

### Authentication & Authorization
- **Public pages:** No auth. All directory content is public.
- **Admin panel:** Supabase Auth (email/password), checked via middleware on `/admin/*` routes.
- **RLS policies:** All tables have RLS enabled.
  - Public: SELECT on active counties, active providers, approved reviews
  - Admin: Full CRUD on all tables
  - API routes: INSERT on reviews (pending status only), INSERT on leads

### Data Privacy
- IP addresses: **Hashed** (SHA-256 + salt) before storage. Used only for rate limiting and spam detection. Never displayed.
- Email addresses in leads: Stored for marketing. Must include unsubscribe mechanism.
- No cookies except Supabase auth cookie for admin panel.
- No third-party trackers (use privacy-friendly analytics).

### Headers (Vercel `next.config.js`)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

## Failure Modes Registry

```
CODEPATH              | FAILURE MODE              | HANDLED? | TESTED? | USER SEES           | LOGGED?
──────────────────────|───────────────────────────|──────────|─────────|─────────────────────|────────
County page load      | County not in DB          | Y        | Y       | Custom 404          | N (expected)
County page load      | DB connection timeout     | Y        | Y       | Vercel error page   | Y (auto)
Provider page load    | Provider not in DB        | Y        | Y       | Custom 404          | N (expected)
Provider page load    | Provider suspended        | Y        | Y       | Custom 404          | N
Review submission     | Validation fails          | Y        | Y       | Inline field errors | N
Review submission     | Rate limited              | Y        | Y       | "Try again tomorrow"| Y
Review submission     | DB write fails            | Y        | Y       | "Error, try again"  | Y
Review submission     | Duplicate review (same IP)| Y        | Y       | "Already reviewed"  | Y
Lead capture          | Invalid email             | Y        | Y       | Inline error        | N
Lead capture          | Resend API down           | Y        | Y       | "Check your email"* | Y
                      | *Lead saved, email queued for retry                                    |
Lead capture          | Duplicate email           | Y        | Y       | "Check your email"  | N (silent)
Provider claim        | Already claimed           | Y        | Y       | "Already claimed"   | N
Provider claim        | Email send fails          | Y        | Y       | "Error, try again"  | Y
Search                | Empty results             | Y        | Y       | "No results" + suggest| N
Search                | Malformed query           | Y        | Y       | Empty results       | N
Admin login           | Wrong credentials         | Y        | Y       | "Invalid login"     | Y
Admin login           | Supabase Auth down        | N ← GAP  | N       | Vercel error page   | Y (auto)
ISR revalidation      | Stale data served         | Y        | N       | Slightly old data   | N (acceptable)
Trigger: review stats | Trigger fails on review   | N ← GAP  | N       | Silent (stale avg)  | N ← CRITICAL
```

**CRITICAL GAP:** The `update_provider_review_stats` trigger failing would silently leave `avg_rating` and `review_count` stale. **Fix:** Add a nightly cron job or admin action to recompute all provider stats as a safety net. Also wrap trigger in exception handler that logs to a `trigger_errors` table.

**MINOR GAP:** Supabase Auth outage blocks admin access. Acceptable risk for MVP — Supabase has 99.9% uptime SLA.

---

## Edge Cases

### Review System
| Edge Case | Handling |
|-----------|---------|
| Same person reviews same provider twice | Allow it (different visits). Deduplicate by IP+provider only within 24h window. |
| Review with only 1-star, no text beyond minimum | Accept. 20-char minimum prevents drive-by one-word reviews. |
| Review contains profanity | Flag for moderation (all reviews start as pending anyway). |
| Provider has 100+ reviews | Paginate reviews (20 per page). Show newest first. |
| Review submitted for suspended provider | Reject with "Provider not available" message. |

### Search
| Edge Case | Handling |
|-----------|---------|
| Search for county not in our DB | "We don't cover [county] yet. Sign up to get notified." + email capture. |
| Search by ZIP code | Map ZIP to county using a static lookup table (included in seed data). |
| Empty search query | Show all counties grouped by state. |
| Very long search query (>200 chars) | Truncate to 200 chars server-side. |

### Provider Profiles
| Edge Case | Handling |
|-----------|---------|
| Provider has no phone number | Show "Contact via website" or "Visit [website]". Never show empty phone field. |
| Provider has no reviews | Show "No reviews yet. Be the first!" CTA prominently. |
| Provider photo URL returns 404 | Use placeholder image. `<img>` `onerror` handler swaps to default. |
| Provider claimed by wrong person | Admin review step before claim is confirmed. Manual verification. |

---

## Deployment Plan

### Infrastructure
```
GitHub (source) → Vercel (build + deploy) → Vercel Edge (serve)
                                          ↓
                                    Supabase (DB)
                                          ↓
                                    Resend (email)
                                          ↓
                                    Upstash Redis (rate limiting)
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-side only, never exposed

# Resend
RESEND_API_KEY=re_xxx

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# App
NEXT_PUBLIC_SITE_URL=https://pumpline.com
ADMIN_EMAIL=ocsarathi@gmail.com         # For claim notifications
IP_HASH_SALT=xxx                        # Random string for IP hashing
```

### Deploy Sequence
1. Create Supabase project → Run schema migrations → Seed initial data
2. Create Upstash Redis instance (free tier)
3. Set up Resend account + verify domain
4. Push to GitHub → Connect to Vercel → Set env vars → Deploy
5. Verify: homepage loads, county page loads, review form submits, admin panel accessible
6. Register domain `pumpline.com` (or similar) → Point DNS to Vercel
7. Submit sitemap to Google Search Console

### Seed Data Strategy
For MVP, pre-populate 3 counties:
1. **Travis County, TX** — Austin metro, high septic density in surrounding areas
2. **Wake County, NC** — Raleigh metro, significant rural septic usage
3. **Polk County, FL** — Central FL, heavy septic area

For each county:
- Scrape 5-10 providers from Google Business Profiles + state licensing DB
- Create provider profiles with: name, phone, address, services, pricing range (estimated from Google/Yelp)
- Mark as `is_verified: false` until provider claims listing
- DO NOT fabricate reviews. Start with zero reviews — they'll come organically.

### Rollback Plan
1. Vercel keeps all deployments. Instant rollback to previous deploy via Vercel dashboard.
2. Supabase migrations are versioned. Can roll back schema via `prisma migrate` or manual SQL.
3. Seed data is idempotent — can re-run safely.

---

## File Structure

```
projects/2026-03-13-pumpline/src/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Auto-generated
│   └── seed.ts                    # County + provider seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (nav, footer, meta)
│   │   ├── page.tsx               # Homepage
│   │   ├── county/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # County landing page (SSG)
│   │   ├── provider/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Provider profile page (SSG)
│   │   ├── checklist/
│   │   │   └── page.tsx           # Lead magnet page
│   │   ├── for-providers/
│   │   │   └── page.tsx           # Provider marketing page
│   │   ├── about/
│   │   │   └── page.tsx           # About page
│   │   ├── blog/
│   │   │   ├── page.tsx           # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Blog post
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin layout with auth guard
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx       # Review moderation
│   │   │   ├── providers/
│   │   │   │   └── page.tsx       # Provider management
│   │   │   ├── leads/
│   │   │   │   └── page.tsx       # Lead list
│   │   │   └── login/
│   │   │       └── page.tsx       # Login page
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts       # Search endpoint
│   │   │   ├── reviews/
│   │   │   │   └── route.ts       # Review submission
│   │   │   ├── leads/
│   │   │   │   └── route.ts       # Email capture
│   │   │   └── claim/
│   │   │       └── route.ts       # Provider claim
│   │   ├── not-found.tsx          # Custom 404
│   │   └── sitemap.ts             # Dynamic sitemap
│   ├── components/
│   │   ├── ui/                    # Generic UI (Button, Card, Input, StarRating)
│   │   ├── ProviderCard.tsx       # Provider listing card
│   │   ├── ReviewForm.tsx         # Review submission form
│   │   ├── ReviewList.tsx         # Review display list
│   │   ├── SearchBar.tsx          # County/provider search
│   │   ├── EmailCapture.tsx       # Lead magnet form
│   │   ├── Breadcrumbs.tsx        # SEO breadcrumbs
│   │   └── JsonLd.tsx             # Structured data component
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client (server + browser)
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── resend.ts              # Email client
│   │   ├── rate-limit.ts          # Upstash rate limiter
│   │   ├── validation.ts          # Zod schemas for all inputs
│   │   ├── seo.ts                 # SEO helpers (generateMetadata, JSON-LD)
│   │   └── ip-hash.ts             # IP hashing utility
│   └── types/
│       └── index.ts               # TypeScript types
├── public/
│   ├── septic-checklist.pdf       # Lead magnet PDF
│   ├── og-image.png               # Default social sharing image
│   └── favicon.ico
├── __tests__/
│   ├── api/
│   │   ├── reviews.test.ts        # Review API tests
│   │   ├── leads.test.ts          # Lead capture tests
│   │   ├── search.test.ts         # Search API tests
│   │   └── claim.test.ts          # Claim flow tests
│   ├── components/
│   │   ├── ReviewForm.test.tsx    # Form validation tests
│   │   ├── ProviderCard.test.tsx  # Card rendering tests
│   │   └── SearchBar.test.tsx     # Search UI tests
│   └── lib/
│       ├── validation.test.ts     # Zod schema tests
│       └── rate-limit.test.ts     # Rate limiter tests
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**File count:** ~35 files. Acceptable for a full Next.js application with admin panel.

---

## Test Plan

### Unit Tests (Vitest)
| Test File | What It Covers | Priority |
|-----------|---------------|----------|
| `validation.test.ts` | All Zod schemas: valid inputs, boundary values, invalid inputs, XSS attempts | P0 |
| `rate-limit.test.ts` | Rate limit logic: under limit, at limit, over limit, window reset | P0 |
| `ip-hash.test.ts` | Consistent hashing, salt usage, no plaintext leaks | P1 |
| `seo.test.ts` | Metadata generation, JSON-LD output, canonical URLs | P1 |

### API Integration Tests (Vitest + supertest or similar)
| Test File | What It Covers | Priority |
|-----------|---------------|----------|
| `reviews.test.ts` | Happy path, validation errors, rate limiting, duplicate detection, provider-not-found | P0 |
| `leads.test.ts` | Happy path, invalid email, duplicate email (silent success), Resend failure (still saves) | P0 |
| `search.test.ts` | By county, by name, empty query, no results, long query truncation | P1 |
| `claim.test.ts` | Happy path, already claimed, not found | P1 |

### Component Tests (Vitest + React Testing Library)
| Test File | What It Covers | Priority |
|-----------|---------------|----------|
| `ReviewForm.test.tsx` | Validation UI, submission, error display, success state | P0 |
| `ProviderCard.test.tsx` | Renders with full data, missing phone, no reviews, premium badge | P1 |
| `SearchBar.test.tsx` | Input, autocomplete, empty state | P1 |

### E2E Tests (Playwright — if time allows)
| Flow | Priority |
|------|----------|
| Search county → view providers → view provider profile → submit review | P1 |
| Email capture on checklist page | P2 |
| Admin login → moderate review → approve | P2 |

---

## Performance Considerations

### Static Generation (ISR)
- County and provider pages are generated at build time and revalidated every 30 minutes via ISR
- This means: zero database queries for page loads (served from Vercel edge cache)
- Only API routes hit the database (review submission, search, lead capture)

### Database
- All queries use indexes (defined above)
- Provider listing on county page: single query with `WHERE county_id = X AND status = 'active' ORDER BY sort_order, avg_rating DESC`
- Review list: single query with `WHERE provider_id = X AND status = 'approved' ORDER BY created_at DESC LIMIT 20 OFFSET Y`
- No N+1 risk — pages are statically generated, not server-rendered with multiple queries

### Caching
- ISR handles page caching
- Search API: consider adding 60-second `Cache-Control` header for identical queries
- No need for Redis caching beyond rate limiting at this scale

### Expected Load
- Month 1: <100 daily visits (negligible)
- Month 6: 500-1000 daily visits (well within Vercel free tier)
- Month 12: 2000-5000 daily visits (may need Vercel Pro at $20/mo)
- Static pages mean even 100K/day would be fine on Vercel

---

## Completion Summary

```
+====================================================================+
|            ENG REVIEW — COMPLETION SUMMARY                          |
+====================================================================+
| Mode selected        | SCOPE REDUCTION (overnight MVP)              |
| Step 0               | Scope stripped to directory + reviews +       |
|                      | lead capture + admin. 10 items deferred.      |
| Tech Stack           | Next.js 14 + Supabase + Prisma + Tailwind    |
|                      | + Vercel + Resend + Upstash                   |
| Database             | 5 tables, 12 indexes, 1 trigger              |
| Pages                | 10 public routes + 5 admin routes             |
| API Endpoints        | 6 routes                                      |
| Architecture         | Diagram produced (static-first + API)         |
| Data Flows           | 4 flows mapped with shadow paths              |
| SEO                  | JSON-LD, sitemaps, breadcrumbs, meta planned  |
| Security             | RLS, rate limiting, input validation,          |
|                      | IP hashing, CSP headers mapped                |
| Failure Modes        | 17 mapped, 1 CRITICAL GAP (trigger failure)   |
| Edge Cases           | 15 identified with handling                   |
| File Structure       | ~35 files (acceptable for full app)            |
| Test Plan            | 4 unit + 4 API + 3 component + 3 E2E suites   |
| Deployment           | Vercel + Supabase + seed 3 counties            |
| Performance          | ISR (static pages), indexed queries, edge cache |
+====================================================================+
```
