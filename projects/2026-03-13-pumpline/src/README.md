# Pumpline

Septic provider directory for rural homeowners. Find, compare, and review local septic service companies by county.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with SSG/ISR for SEO
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Email:** Resend (lead magnet delivery, provider claim notifications)
- **Rate Limiting:** Upstash Redis
- **Validation:** Zod

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) [Resend](https://resend.com) account for email
- (Optional) [Upstash](https://upstash.com) Redis for rate limiting

### Installation

```bash
git clone <repo-url>
cd pumpline
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (optional for dev)
RESEND_API_KEY=re_your-key

# Upstash Redis (optional for dev)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
IP_HASH_SALT=any-random-string
```

### Database Setup

1. Open the Supabase SQL Editor for your project.
2. Run `supabase/schema.sql` to create tables, indexes, triggers, and RLS policies.
3. Run `supabase/seed.sql` to populate 3 counties with 10 sample providers.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  app/
    page.tsx                  # Homepage
    layout.tsx                # Root layout (nav, footer)
    county/[slug]/page.tsx    # County landing page (SSG)
    provider/[slug]/page.tsx  # Provider profile page (SSG)
    admin/                    # Admin dashboard (protected)
    api/
      reviews/route.ts        # Review submission endpoint
      leads/route.ts          # Email capture endpoint
      search/route.ts         # Provider search endpoint
      claim/route.ts          # Provider claim endpoint
  components/
    ProviderCard.tsx           # Provider listing card
    ReviewForm.tsx             # Review submission form
    ReviewList.tsx             # Review display list
    SearchBar.tsx              # County/provider search
    EmailCapture.tsx           # Lead magnet form
    Breadcrumbs.tsx            # SEO breadcrumbs
    JsonLd.tsx                 # Structured data component
    StarRating.tsx             # Star rating display
  lib/
    supabase.ts                # Supabase client (server + browser)
    validation.ts              # Zod schemas for all inputs
    seo.ts                     # SEO helpers (metadata, JSON-LD)
    ip-hash.ts                 # IP hashing utility
  types/
    index.ts                   # TypeScript type definitions
supabase/
  schema.sql                   # Database schema (tables, indexes, RLS)
  seed.sql                     # Seed data (3 counties, 10 providers)
```

## Deployment

This project is designed for one-click deployment on [Vercel](https://vercel.com):

1. Push your repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables in the Vercel dashboard.
4. Deploy. Vercel handles builds, SSL, and edge caching automatically.

Static county and provider pages use ISR (Incremental Static Regeneration) so they are served from the edge cache and revalidated periodically without redeploying.
