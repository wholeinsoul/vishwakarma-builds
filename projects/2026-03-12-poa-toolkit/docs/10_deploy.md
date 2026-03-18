# Deployment Guide — POA Toolkit
**Date:** 2026-03-12
**Status:** 📋 Documented (manual execution required)

---

## Overview

This document outlines the deployment process for the POA Toolkit MVP.

**Target Environment:**
- **Frontend + API:** Vercel
- **Database:** Supabase Cloud
- **Domain:** TBD (e.g., `poa-toolkit.vercel.app` or custom domain)

---

## Step 1: Apply Database Schema to Supabase ✅

### Prerequisites
- Supabase project created
- Connection string available

### Connection Details
```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.rptejtlnpscsimhpqwlt
Password: oioA50tB6wf563OQ (from .env.db)

Full connection string:
postgresql://postgres.rptejtlnpscsimhpqwlt:oioA50tB6wf563OQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Apply Schema

**Option A: Using psql CLI**
```bash
# Install psql (if not already installed)
brew install libpq

# Apply schema
$(brew --prefix libpq)/bin/psql \
  "postgresql://postgres.rptejtlnpscsimhpqwlt:oioA50tB6wf563OQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  < supabase/schema.sql

# Apply seed data
$(brew --prefix libpq)/bin/psql \
  "postgresql://postgres.rptejtlnpscsimhpqwlt:oioA50tB6wf563OQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  < supabase/seed.sql
```

**Option B: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Paste contents of `supabase/schema.sql`
4. Run
5. Repeat for `supabase/seed.sql`

### Verify Schema Application
```sql
-- Check that tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- - banks
-- - bank_requirements
-- - profiles
-- - submissions
-- - submission_checklist
-- - rejection_reports
-- - rejection_votes

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All tables should have rowsecurity = true

-- Check that policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
-- Should see policies like "Users view own submissions", "Admins view all submissions", etc.
```

**Status:** ⚠️ Manual execution required (credentials exist, schema ready)

---

## Step 2: Configure Environment Variables

### Local (.env.local)
Already configured in `src/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rptejtlnpscsimhpqwlt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel (Production)
Set these in Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://rptejtlnpscsimhpqwlt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<service role key> (if needed for admin operations)
```

---

## Step 3: Deploy to Vercel

### Prerequisites
- Vercel CLI installed: `npm install -g vercel`
- Vercel account connected: `vercel login`

### Deploy Command
```bash
cd /Users/nk/.openclaw/workspace-vishwakarma/projects/2026-03-12-poa-toolkit/src

# First deployment (creates project)
npx vercel --yes

# Set environment variables (if not done via dashboard)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Subsequent deployments
npx vercel --prod
```

### Expected Output
```
🔍  Inspect: https://vercel.com/wholeinsoul/poa-toolkit/<deployment-id>
✅  Production: https://poa-toolkit.vercel.app
```

**Status:** ⚠️ Manual execution required (Vercel account needed)

---

## Step 4: Post-Deployment Verification

### Checklist

1. **Database Connection** ✅
   - [ ] Visit `https://poa-toolkit.vercel.app` (or live URL)
   - [ ] Open browser DevTools → Console
   - [ ] No Supabase connection errors

2. **Pages Load** ✅
   - [ ] `/` (landing page)
   - [ ] `/banks` (bank list)
   - [ ] `/banks/chase` (bank detail — replace 'chase' with actual slug)
   - [ ] `/dashboard` (user dashboard — requires auth)

3. **Auth Flow** ✅
   - [ ] Signup works (creates profile in `profiles` table)
   - [ ] Login works (returns session token)
   - [ ] Logout works (clears session)

4. **RLS Policies** ✅
   - [ ] User A cannot see User B's submissions
   - [ ] Admin can see all submissions
   - [ ] Unauthenticated users see public data only (banks, requirements)

5. **Data Writes** ✅
   - [ ] Rejection report submission saves to `rejection_reports` table
   - [ ] Vote submission saves to `rejection_votes` table

### Health Check Endpoint (Future)
Add `/api/health` for monitoring:
```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('banks').select('count');
    
    if (error) throw error;
    
    return Response.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
```

Then monitor via UptimeRobot (https://uptimerobot.com) — free tier, ping every 5 minutes.

---

## Step 5: Custom Domain (Optional)

### If Using Custom Domain

1. **Buy domain** (e.g., `poaautopilot.com` via Namecheap — ~$12/year)
2. **Add to Vercel:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add `poaautopilot.com`
3. **Update DNS:**
   - Add CNAME record: `poaautopilot.com` → `cname.vercel-dns.com`
4. **Wait for SSL** (Vercel auto-provisions Let's Encrypt SSL — 5-10 minutes)

**Status:** ⚠️ Optional (can use `poa-toolkit.vercel.app` for MVP)

---

## Deployment Costs

| Service | Plan | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Supabase** | Free tier | $0 | 500MB DB, 1GB storage, 50K auth users |
| **Vercel** | Hobby | $0 | 100GB bandwidth, unlimited deployments |
| **Domain** (optional) | — | $1/month | ~$12/year |
| **Total** | — | **$0-1/month** | Phase 0 MVP fits free tiers |

**Upgrade thresholds:**
- Supabase Pro ($25/mo) — When DB exceeds 500MB or >50K users
- Vercel Pro ($20/mo) — When bandwidth exceeds 100GB/month

---

## Rollback Plan

### If Deployment Breaks

**Option A: Rollback via Vercel Dashboard**
1. Go to https://vercel.com/wholeinsoul/poa-toolkit
2. Click "Deployments"
3. Find last working deployment
4. Click "⋯" → "Promote to Production"

**Option B: Rollback via CLI**
```bash
vercel rollback
```

**Option C: Redeploy from Git**
```bash
git checkout <last-good-commit>
vercel --prod
```

### If Database Schema Breaks

**No easy rollback** — migrations are one-way. If schema breaks:
1. Fix SQL in `supabase/schema.sql`
2. Run corrected SQL via Supabase SQL Editor
3. Test locally first with `supabase start` (if using Supabase CLI)

**Mitigation:** Always test schema changes locally before applying to production.

---

## Monitoring & Alerts

### Recommended Setup (Phase 1)

1. **Uptime Monitoring:** UptimeRobot (free)
   - Ping `/api/health` every 5 minutes
   - Alert via email if down >2 checks (10 minutes)

2. **Error Tracking:** Sentry (optional — $26/mo)
   - Catch frontend + API errors
   - Alert on >10 errors/hour

3. **Database Monitoring:** Supabase Dashboard
   - Check "Database" → "Table Editor" for data integrity
   - Check "Auth" → "Users" for signup rate

4. **Vercel Analytics:** Built-in (free)
   - Track page views, p95 latency
   - View in Vercel Dashboard → Analytics

---

## Deployment Checklist

### Pre-Deploy ✅
- [x] All tests pass (`npm test`)
- [x] Build succeeds (`npm run build`)
- [x] Environment variables documented
- [x] Database schema ready (`supabase/schema.sql`)
- [x] Seed data ready (`supabase/seed.sql`)

### Deploy ✅
- [ ] Apply schema to Supabase (manual — credentials available)
- [ ] Deploy to Vercel (manual — `npx vercel --prod`)
- [ ] Set environment variables in Vercel
- [ ] Verify live URL works

### Post-Deploy ✅
- [ ] Test all pages (/, /banks, /banks/:slug, /dashboard)
- [ ] Test auth flow (signup, login, logout)
- [ ] Test data writes (rejection report submission)
- [ ] Verify RLS policies (user isolation)
- [ ] Set up uptime monitoring (UptimeRobot)

---

## Live URL

**Status:** ⚠️ Not deployed yet (manual execution required)

**Expected URL:** `https://poa-toolkit.vercel.app` (or custom domain if configured)

**When deployed, update this section with:**
```
✅ Live URL: https://poa-toolkit.vercel.app
✅ Deployed: 2026-03-12 15:45 PDT
✅ Deployment ID: abc123xyz
✅ Health check: https://poa-toolkit.vercel.app/api/health (TODO: add endpoint)
```

---

## Conclusion

**Deployment readiness:** ✅ READY

**What's needed:**
1. Manual execution of schema application (credentials exist, SQL ready)
2. Manual execution of Vercel deployment (one command: `npx vercel --prod`)
3. Post-deployment verification (5-10 minutes of manual testing)

**Estimated time:** 15-20 minutes for full deployment + verification.

---

**Next Step:** Move to Step 9 (PUSH TO GITHUB).
