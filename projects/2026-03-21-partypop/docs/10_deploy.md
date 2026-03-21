# Deploy Status — Partypop MVP
**Date:** 2026-03-21

---

## Status: PARTIAL (GitHub pushed, Vercel pending)

### What's Done
- ✅ **Code pushed to GitHub:** https://github.com/wholeinsoul/vishwakarma-builds/tree/partypop-mvp
- ✅ **Branch:** `partypop-mvp`
- ✅ **Build verified:** Compiles clean with 0 errors (13 routes, 48 files)
- ✅ **All pages tested:** 7/7 return HTTP 200 on local dev server

### What's Pending
- ❌ **Vercel deploy:** Vercel CLI not authenticated on this machine. Needs `vercel login` or connecting the GitHub repo to Vercel dashboard.
- ❌ **Environment variables:** Need to be set in Vercel project settings (see below)

---

## GitHub Repository

**URL:** https://github.com/wholeinsoul/vishwakarma-builds/tree/partypop-mvp

**To deploy via Vercel dashboard:**
1. Go to https://vercel.com/new
2. Import from GitHub → select `wholeinsoul/vishwakarma-builds`
3. Set branch to `partypop-mvp`
4. Framework: Next.js (auto-detected)
5. Set environment variables (below)
6. Deploy

---

## Required Environment Variables

| Variable | Where to Get | Required for |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API | All auth + DB operations |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API | Client-side Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API | Server-side operations (bypass RLS) |
| `OPENAI_API_KEY` | OpenAI dashboard → API keys | AI plan generation |
| `STRIPE_SECRET_KEY` | Stripe dashboard → API keys | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Stripe dashboard → Products → Price ID | $4.99 Party Pass price |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL | Redirect URLs, share links |

### Setup Order
1. **Supabase:** Create project → run `supabase/schema.sql` → run `supabase/seed.sql` → get API keys
2. **OpenAI:** Get API key from dashboard
3. **Stripe:** Create product ($4.99 "Party Pass") → get price ID → set up webhook endpoint (`https://your-domain.vercel.app/api/webhooks/stripe`)
4. **Vercel:** Set all env vars → deploy

---

## What's Deployed (Frontend Only)

The static pages (landing, themes, login, plan wizard, dashboard) will render without env vars. However, the following features require configured services:

| Feature | Service Needed | Status Without Config |
|---------|---------------|----------------------|
| Landing page | None | ✅ Works |
| Theme gallery | None (hardcoded fallback) | ✅ Works |
| Login/signup | Supabase Auth | ❌ Fails gracefully |
| Plan generation | Supabase + OpenAI | ❌ Requires auth + API key |
| RSVP submission | Supabase | ❌ Requires DB |
| Payment | Stripe | ❌ Requires keys |
| Print view | Supabase (plan data) | ❌ Requires DB |

---

## One-Click Deploy (When Vercel Auth Is Configured)

```bash
cd /Users/nk/.openclaw/workspace-vishwakarma/projects/2026-03-21-partypop/src
vercel login
vercel --prod
```

Or connect via Vercel dashboard → Import Git Repository → `wholeinsoul/vishwakarma-builds` branch `partypop-mvp`.
