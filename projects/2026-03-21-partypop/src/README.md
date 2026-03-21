# Partypop - AI Kids' Birthday Party Planner

AI-powered party planning with themed templates, RSVP tracking, and shopping lists.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** OpenAI GPT-4o-mini
- **Payments:** Stripe Checkout ($4.99/party)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Stripe Price ID for $4.99 Party Pass |
| `NEXT_PUBLIC_SITE_URL` | Your app URL (e.g., http://localhost:3000) |

### 3. Database setup

1. Create a [Supabase](https://supabase.com) project
2. Go to SQL Editor and run:
   - `supabase/schema.sql` — creates tables, indexes, RLS policies, triggers
   - `supabase/seed.sql` — inserts 10 theme templates

### 4. Stripe setup

1. Create a [Stripe](https://stripe.com) account
2. Create a product "Party Pass" with a $4.99 one-time price
3. Copy the Price ID to `NEXT_PUBLIC_STRIPE_PRICE_ID`
4. Set up a webhook endpoint at `https://yourdomain.com/api/webhooks/stripe`
   - Listen for `checkout.session.completed` events
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Magic link auth
│   ├── dashboard/            # My parties list
│   ├── plan/
│   │   ├── new/              # Multi-step plan wizard
│   │   └── [id]/             # View generated plan
│   │       ├── rsvp/         # RSVP management dashboard
│   │       ├── print/        # Print-friendly view
│   │       └── share/        # Shareable plan
│   ├── rsvp/
│   │   └── [slug]/           # Public RSVP form (no auth)
│   │       └── confirmed/    # RSVP confirmation
│   ├── themes/               # Theme gallery
│   └── api/
│       ├── plans/generate/   # AI plan generation
│       ├── rsvp/             # RSVP submission
│       ├── checkout/         # Stripe session creation
│       ├── webhooks/stripe/  # Stripe webhook
│       └── themes/           # Theme templates
├── components/               # UI components
├── lib/                      # Utilities (supabase, openai, stripe, etc.)
└── types/                    # TypeScript types
supabase/
├── schema.sql                # Database schema
└── seed.sql                  # Theme template seed data
```

## Themes

10 curated party themes:
1. Dinosaur Adventure 🦕
2. Royal Princess Ball 👑
3. Superhero Training Camp 🦸
4. All-Star Sports Day ⚽
5. Magical Unicorn Party 🦄
6. Minecraft World ⛏️
7. Outer Space Explorer 🚀
8. Under the Sea 🐠
9. Construction Zone 🏗️
10. Wild Safari Adventure 🦁

## Key Features

- **AI Plan Generation:** GPT-4o-mini generates structured party plans with timeline, activities, food menu, decorations, and shopping list
- **RSVP Tracking:** Shareable links, guest attendance tracking, dietary needs summary
- **Shopping List:** Interactive checklist with cost tracking
- **Print-Friendly:** Optimized print layout with @media print styles
- **Magic Link Auth:** Passwordless authentication via Supabase
- **Stripe Payments:** $4.99 per-party premium unlock

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import in Vercel
3. Set all environment variables
4. Deploy
5. Configure Stripe webhook with production URL
