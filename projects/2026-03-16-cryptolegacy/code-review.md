# Code Review — CryptoLegacy

**Reviewed:** 2026-03-16
**Reviewer:** Vishwakarma (automated)
**Files:** 52 source files, ~6,400 lines (excluding shadcn/ui, tests)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| WARNING | 4 |
| INFO | 5 |

Overall: **Clean build.** 68/68 tests pass. Build compiles. The architecture follows the eng-review spec faithfully. One critical issue around rate limiting on the decrypt endpoint.

---

## CRITICAL

### C1: No rate limiting on decrypt endpoint
- **File:** `app/api/decrypt/route.ts`
- **Line:** 1-72
- **Issue:** The decrypt endpoint is public (token-based, no auth). There's no rate limiting. An attacker who obtains a notify_token could hammer this endpoint. While the encrypted blob is useless without the passphrase, the endpoint could be abused for enumeration or DDoS.
- **Fix:** Add rate limiting middleware. For MVP: use in-memory rate limiter or Vercel Edge Config. Minimum: 10 requests per minute per token. **FIXED: Added X-RateLimit headers and in-memory token bucket in the route.**

---

## WARNING

### W1: Check-in GET endpoint lacks CSRF protection
- **File:** `app/api/check-in/route.ts`
- **Line:** 96-167
- **Issue:** The GET endpoint for one-click check-in from email redirects after performing a write operation (inserting check_in, updating plan). While it checks Supabase auth, a CSRF attack could trigger unwanted check-ins if the user is logged in.
- **Fix:** For MVP: acceptable risk since check-ins are beneficial (reset timer = good). For v2: use POST with a one-time token instead of GET.

### W2: Plan creation doesn't check subscription status
- **File:** `app/api/plans/route.ts`
- **Line:** 63-140
- **Issue:** The POST endpoint creates plans without verifying the user has an active subscription. Free users could create unlimited plans.
- **Fix:** Add subscription check before plan creation. Query the subscriptions table for an active subscription for the user. Return 402 if none found.

### W3: Beneficiary insert is not atomic with plan creation
- **File:** `app/api/plans/route.ts`
- **Line:** 116-134
- **Issue:** Plan is inserted first, then beneficiaries. If beneficiary insert fails, the plan exists without beneficiaries. The code logs this but the user might not notice.
- **Fix:** For MVP: acceptable (user can add beneficiaries later from dashboard). For v2: wrap in a Supabase RPC function for atomicity.

### W4: Stripe webhook doesn't verify plan_type from checkout session
- **File:** `app/api/webhook/stripe/route.ts`
- **Line:** 102-140
- **Issue:** When handling `checkout.session.completed`, the code doesn't set `plan_type` from the Stripe session metadata. It defaults to 'basic' always.
- **Fix:** Add `planType` to Stripe checkout session metadata, read it in the webhook handler.

---

## INFO

### I1: No error boundary components
- **File:** Various page components
- **Issue:** No React error boundaries. If a component throws, the whole page crashes.
- **Fix:** Add error.tsx files in app directory for graceful error handling.

### I2: Passphrase entropy check could be stronger
- **File:** `lib/validations.ts`
- **Issue:** Passphrase validation checks length (12+) but could benefit from checking against common passwords or requiring character diversity.
- **Fix:** Add zxcvbn or similar password strength library for v2.

### I3: No loading states on some pages
- **File:** `app/dashboard/page.tsx`, `app/create/page.tsx`
- **Issue:** Some pages fetch data in useEffect without skeleton loading states, causing flash of empty content.
- **Fix:** Add loading.tsx files or Suspense boundaries.

### I4: Email templates are plain text
- **File:** `lib/resend.ts`
- **Issue:** Email templates are functional but not styled. For a product handling sensitive crypto recovery, professional-looking emails build trust.
- **Fix:** Use React Email components for styled HTML emails in v2.

### I5: No favicon or OG image
- **File:** `app/layout.tsx`
- **Issue:** Missing favicon and Open Graph images for social sharing.
- **Fix:** Add favicon.ico and og image in public/ directory.

---

## Positives

1. **Encryption is correct.** AES-256-GCM with PBKDF2 (600K iterations), random salt and IV per encryption. Client-side only. Zero-knowledge architecture as specified.
2. **Thorough test coverage.** 68 tests across crypto, validations, templates, and switch logic. All pass.
3. **Clean API design.** RESTful endpoints, consistent error handling, proper auth checks.
4. **Dead man's switch escalation chain.** Reminder (0-7 days) → Urgent (7-14 days) → Trigger (14+ days). Exactly as specified.
5. **Stripe webhook handling is comprehensive.** Handles checkout, subscription update, deletion, and payment failure.
6. **RLS enabled on all tables.** Multi-tenant security via Supabase Row Level Security.
7. **Platform templates are well-structured.** Each template exports fields, steps, and metadata consistently.
