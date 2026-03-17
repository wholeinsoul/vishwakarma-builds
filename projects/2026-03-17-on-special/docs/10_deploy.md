# Deployment — On Special

## Status: Ready for Deployment (Not Yet Live)

Vercel CLI token not configured on this machine. The app is build-verified and ready for one-click deployment.

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push to GitHub (done — see below)
2. Go to https://vercel.com/new
3. Import `wholeinsoul/vishwakarma-builds` → select `projects/2026-03-17-on-special/src` as root
4. Set environment variables (see below)
5. Deploy

### Option 2: Local `vercel` CLI
```bash
cd projects/2026-03-17-on-special/src
npx vercel login
npx vercel --yes
```

## Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_PRICE_ID=price_your-price-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key

# App
NEXT_PUBLIC_APP_URL=https://your-deployed-url.vercel.app
```

## Database Setup (Supabase)
1. Create project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Enable Email auth in Authentication settings

## Pre-deployment Checklist
- [x] Build passes (`npm run build` — ✅)
- [x] TypeScript compiles (no errors)
- [x] Security review completed (3 critical fixed)
- [x] Schema SQL ready
- [x] .env.example documented
- [ ] Supabase project created
- [ ] Stripe product/price created
- [ ] Environment variables set in Vercel
- [ ] Vercel deployment triggered

## GitHub
Repository: https://github.com/wholeinsoul/vishwakarma-builds
Path: `projects/2026-03-17-on-special/`
