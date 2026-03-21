# Code Review — Partypop MVP
**Date:** 2026-03-21 | **Reviewer:** Vishwakarma

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 2 |
| 🟡 WARNING | 4 |
| 🔵 INFO | 3 |

**Overall Verdict:** PASS WITH ISSUES — 2 critical security issues found and documented below. Both are fixable but need attention before production traffic.

---

## 🔴 CRITICAL Issues

### CRITICAL-1: Overly Broad RLS Policy on `parties` Table
- **File:** `supabase/schema.sql`, line ~82
- **Issue:** The policy `"Public can read party by rsvp_slug"` allows ANY unauthenticated user to read ALL columns of ALL parties where `rsvp_enabled = true`. This exposes `plan_data`, `budget`, `dietary_notes`, `stripe_session`, and `user_id` for every party with RSVP enabled — not just the party the guest is looking at.
- **Impact:** Data leak. Anyone can query all RSVP-enabled parties and see full plan data, budgets, dietary info.
- **Fix:** Scope the policy to only expose necessary columns via a Postgres VIEW, or use the service role client for RSVP page lookups instead of the anon client. For MVP, the service role approach is simpler since the RSVP API already uses it.
- **Recommended SQL:**
```sql
-- Replace the overly broad policy with a restricted one
DROP POLICY "Public can read party by rsvp_slug" ON parties;
-- Use service role for RSVP page lookups instead (already available)
-- If a public policy is needed, create a VIEW with limited columns
CREATE VIEW public_party_rsvp AS
  SELECT id, title, child_name, theme, party_date, rsvp_slug, rsvp_deadline, headcount
  FROM parties
  WHERE rsvp_enabled = true AND rsvp_slug IS NOT NULL;
```

### CRITICAL-2: RSVP Count Policy Leaks All RSVP Data
- **File:** `supabase/schema.sql`, line ~115
- **Issue:** The policy `"Public can read RSVP counts"` allows reading ALL columns of ALL RSVPs for any party with `rsvp_enabled = true`. This exposes guest names, emails, dietary needs, and notes to anyone who knows the party ID.
- **Impact:** Privacy violation — guest personal data exposed to other guests.
- **Fix:** Remove this policy and use the service role client (already used in the RSVP API) to fetch counts. Or create a restricted VIEW.

---

## 🟡 WARNING Issues

### WARNING-1: In-Memory Rate Limiting Won't Survive Restarts or Scale
- **File:** `src/lib/rate-limit.ts`
- **Issue:** Rate limiting uses an in-memory Map. In serverless (Vercel), each function invocation may have a fresh memory context. Rate limits won't persist across cold starts or multiple instances.
- **Impact:** Rate limiting is effectively non-functional on Vercel's serverless functions.
- **Fix:** Use Upstash Redis (as mentioned in eng-review) for persistent rate limiting. For MVP with low traffic, this is acceptable but should be noted.

### WARNING-2: Free Plan Limit Logic Has a Gap
- **File:** `src/app/api/plans/generate/route.ts`, line ~54
- **Issue:** The free plan check counts ALL generated plans for the user. But a user could create a party, not generate a plan, then generate it later — the count would still work. However, if the generation fails mid-way (plan saved but `plan_generated` not set), the user loses their free plan.
- **Impact:** Edge case — user loses free plan on transient failure.
- **Fix:** Use a transaction: set `plan_generated = true` only after successful AI response, within the same operation (current code does this correctly, actually — `plan_generated: true` is set on insert along with `plan_data`). Downgrading to INFO on re-review.

### WARNING-3: Auth Approach Inconsistent Across API Routes
- **File:** Multiple API routes
- **Issue:** Some routes create a Supabase client with `Cookie` header, others with `Authorization` header, the plan generation route supports both. This inconsistency could lead to auth bypass if a route misses one.
- **Impact:** Potential auth inconsistency. Not currently exploitable.
- **Fix:** Create a shared `getAuthUser(request)` helper that handles both cookie and bearer token auth consistently.

### WARNING-4: No Input Sanitization on Text Fields
- **File:** `src/app/api/rsvp/route.ts`
- **Issue:** Guest names, dietary needs, and notes are stored as-is. While React auto-escapes JSX output, if any raw HTML rendering is used (or plan data is exported), XSS is possible.
- **Impact:** Low risk since React escapes, but defense-in-depth is missing.
- **Fix:** Add a `sanitize()` utility that strips HTML tags from all text inputs before storage.

---

## 🔵 INFO Issues

### INFO-1: No Loading/Error Boundaries
- **Files:** Page components
- **Issue:** No React error boundaries or Suspense fallbacks. If a component crashes, the entire page goes blank.
- **Fix:** Add `error.tsx` and `loading.tsx` files in route directories.

### INFO-2: No Retry Logic for OpenAI Calls
- **File:** `src/lib/openai.ts`
- **Issue:** If OpenAI returns malformed JSON or times out, there's no automatic retry. The eng-review spec calls for "retry once, then fallback template."
- **Fix:** Add retry with exponential backoff (1 retry) and a static fallback plan template per theme.

### INFO-3: Theme Data Duplicated (DB + Code)
- **File:** `src/lib/themes.ts` + `supabase/seed.sql`
- **Issue:** Theme data exists in both the TypeScript themes config AND the database seed. If one is updated without the other, they'll drift.
- **Fix:** Single source of truth — either DB-only (fetch themes via API) or code-only (skip the themes table). For MVP, code-only is simpler.

---

## Files Reviewed

| Directory | Files | Notes |
|-----------|-------|-------|
| `supabase/` | 2 | schema.sql, seed.sql — 2 CRITICAL RLS issues |
| `src/app/api/` | 5 routes | Auth, validation, error handling reviewed |
| `src/lib/` | 8 files | Core logic reviewed |
| `src/components/` | 12 files | UI components spot-checked |
| `src/app/` pages | 13 pages | Route structure verified |
| Config files | 5 | package.json, tailwind, tsconfig, next.config, .env.example |

**Total files reviewed:** 45+ (excluding node_modules, .next)

---

## Security Checklist

| Check | Status |
|-------|--------|
| No hardcoded secrets | ✅ All in env vars |
| SQL injection protection | ✅ Supabase client parameterizes queries |
| XSS protection | ⚠️ React auto-escapes, but no input sanitization |
| CSRF protection | ✅ SameSite cookies via Supabase auth |
| Auth on protected routes | ✅ All auth routes check user session |
| RLS policies | 🔴 Overly broad public policies (CRITICAL-1, CRITICAL-2) |
| Stripe webhook verification | ✅ Signature verified |
| Rate limiting | ⚠️ In-memory only, won't work on serverless |
| Error messages | ✅ No stack traces or internal details exposed |

---

## Recommendation

**Ship for demo/MVP purposes** with the understanding that CRITICAL-1 and CRITICAL-2 must be fixed before any real user data enters the system. The RLS policies should be tightened or replaced with service-role-only access for public pages. For the overnight build, the code is solid — clean architecture, proper error handling, good separation of concerns.
