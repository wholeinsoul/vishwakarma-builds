# Code Review — Pumpline MVP

**Date:** 2026-03-13
**Reviewer:** Vishwakarma (automated)
**Files reviewed:** 37 source files (excluding node_modules, .next, .git)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| WARNING  | 0 |
| INFO     | 0 |

All 5 critical issues were **fixed in-place** during review.

---

## Critical Issues (Fixed)

### 1. CRITICAL — Reviews API: Invalid Column Reference
- **File:** `src/app/api/reviews/route.ts`
- **Issue:** Query uses `is_active` column which doesn't exist in schema. Should be `status = 'active'`.
- **Fix:** Updated to use correct column filter.

### 2. CRITICAL — Claim API: TOCTOU Race Condition
- **File:** `src/app/api/claim/route.ts`
- **Issue:** Check-then-update pattern allows two simultaneous claims to both succeed.
- **Fix:** Replaced with atomic UPDATE ... WHERE clause (single query, no race).

### 3. CRITICAL — JsonLd: XSS via Script Injection
- **File:** `src/components/JsonLd.tsx`
- **Issue:** `dangerouslySetInnerHTML` with `JSON.stringify` allows `</script>` breakout if provider data contains malicious content.
- **Fix:** Added `.replace(/</g, '\\u003c')` sanitization before injection.

### 4. CRITICAL — Leads Table: Missing UNIQUE Constraint
- **File:** `supabase/schema.sql`
- **Issue:** No UNIQUE constraint on `leads.email` — duplicate detection in API code (`ON CONFLICT`) would fail silently or error.
- **Fix:** Added `UNIQUE(email)` constraint to leads table.

### 5. CRITICAL — Admin Panel: RLS Blocks Admin Operations
- **File:** `supabase/schema.sql` + admin pages
- **Issue:** Admin pages use anon Supabase client but RLS policies only allow anon SELECT. All admin mutations (approve review, edit provider) would be blocked.
- **Fix:** Added admin RLS policies with service role or admin role check.

---

## Build Verification

Post-fix build: **✅ Compiles clean, 18 routes, 0 errors**
