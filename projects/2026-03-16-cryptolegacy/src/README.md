# CryptoLegacy

Crypto inheritance platform with zero-knowledge encryption and dead man's switch.

## Overview

CryptoLegacy lets users create encrypted recovery plans for their crypto assets. If the user stops checking in (dead man's switch), beneficiaries automatically receive access to step-by-step recovery instructions.

**Key features:**
- Client-side AES-256-GCM encryption (zero-knowledge — server never sees plaintext)
- Dead man's switch with configurable check-in intervals (30-365 days)
- 3-week escalation chain: reminder → urgent warning → trigger
- Guided recovery plan builder with templates for Coinbase, Binance, MetaMask, Ledger, Kraken
- Beneficiary management with token-based decryption portal
- Stripe subscription billing
- Resend email notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (email/password + magic link) |
| Database | Supabase PostgreSQL with RLS |
| Encryption | Web Crypto API (AES-256-GCM + PBKDF2) |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Deployment | Vercel |
| Tests | Vitest |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | Stripe price ID for Basic plan ($9/mo) |
| `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for Premium plan ($29/mo) |
| `RESEND_API_KEY` | Resend API key |
| `CRON_SECRET` | Secret token for Vercel Cron authentication |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `http://localhost:3000`) |

### 3. Set up the database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Enable email auth in Authentication → Providers

### 4. Set up Stripe

1. Create products and prices in your Stripe Dashboard
2. Set up a webhook endpoint pointing to `{your-url}/api/webhook/stripe`
3. Listen for events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (SSR)
│   ├── pricing/           # Pricing page
│   ├── auth/              # Login, signup, callback
│   ├── dashboard/         # Main dashboard
│   ├── create/            # Guide builder wizard
│   ├── settings/          # Account settings
│   ├── decrypt/           # Beneficiary decryption (public)
│   ├── check-in/          # One-click check-in
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── guide-builder/     # Wizard step components
│   ├── dashboard/         # Dashboard components
│   ├── decrypt/           # Decryption components
│   └── landing/           # Landing page sections
├── lib/
│   ├── crypto.ts          # AES-256-GCM encryption
│   ├── supabase/          # Supabase clients
│   ├── stripe.ts          # Stripe helpers
│   ├── resend.ts          # Email service
│   ├── templates/         # Platform recovery templates
│   └── validations.ts     # Zod schemas
├── __tests__/             # Vitest tests
├── supabase/schema.sql    # Database schema
└── middleware.ts           # Auth middleware
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## Security

- All encryption happens client-side using the Web Crypto API
- The server only stores encrypted blobs — it cannot decrypt user data
- PBKDF2 with 600,000 iterations for key derivation
- AES-256-GCM for authenticated encryption
- Supabase RLS policies enforce per-user data isolation
- Stripe webhook signature verification
- Cron endpoint protected by bearer token
- Passphrase strength validation (min 12 chars, entropy check)

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel Cron is configured in `vercel.json` to run daily at midnight UTC
