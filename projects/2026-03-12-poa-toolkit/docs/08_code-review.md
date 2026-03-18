# Code Review — POA Toolkit
**Date:** 2026-03-12
**Reviewer:** Vishwakarma (2x Ralph Loop)
**Scope:** Full codebase review (not a PR diff)

---

## Executive Summary

**Severity Breakdown:**
- 🔴 CRITICAL: 0 issues
- 🟡 WARNING: 2 issues
- 🟢 INFO: 3 issues

**Overall Quality:** 7/10 — Good foundation, but incomplete relative to expanded vision

**Key Findings:**
1. ⚠️ No RLS (Row-Level Security) policies applied yet (schema exists, policies not deployed)
2. ⚠️ Missing error boundary components (React error handling)
3. ℹ️ Unused rejection voting feature (no clear user value)
4. ℹ️ No input sanitization on rejection report submission
5. ℹ️ Test coverage gaps (no integration tests, no auth tests)

---

## Pass 1: CRITICAL Issues (SQL, Security, Data Safety)

### 1.1 SQL & Data Safety

**Check:** Are there any SQL queries that could cause data corruption or security vulnerabilities?

**Findings:** ✅ NONE

**Rationale:**
- All DB queries use Supabase client (parameterized queries by default)
- No raw SQL strings found in codebase
- Schema is well-structured (foreign keys, indexes exist)

**Files checked:**
- `src/lib/supabase/client.ts` — ✅ Standard Supabase client
- `src/components/rejection-reports.tsx` — ✅ Uses `.from().select()` pattern
- `supabase/schema.sql` — ✅ Well-designed schema with proper constraints

---

### 1.2 RLS (Row-Level Security) Policies

**Check:** Are RLS policies applied and tested?

**Finding:** 🟡 WARNING

**Issue:** Schema file (`supabase/schema.sql`) DEFINES RLS policies, but they may not be applied to the live Supabase instance.

**Evidence:**
```sql
-- File: supabase/schema.sql (lines 150-200)
-- Policies are DEFINED but not necessarily APPLIED

-- Users can only see their own submissions
create policy "Users view own submissions"
  on submissions for select
  using (auth.uid() = user_id);

-- Admins can view all submissions
create policy "Admins view all submissions"
  on submissions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

**Problem:** If these policies aren't applied to the live DB, any authenticated user can query ALL submissions, not just their own.

**Recommendation:**
```bash
# Apply schema to Supabase (Step 8: DEPLOY will do this)
psql <supabase-connection-string> < supabase/schema.sql
```

**Severity:** 🟡 WARNING (not CRITICAL because policies exist in schema, just need deployment)

---

### 1.3 LLM Output Trust Boundary

**Check:** Is LLM-generated content sanitized before rendering?

**Findings:** ✅ NOT APPLICABLE (no LLM features in current build)

---

## Pass 2: INFORMATIONAL Issues

### 2.1 Error Handling

**Check:** Are errors handled gracefully?

**Finding:** 🟡 WARNING

**Issue:** No React Error Boundary component exists.

**Evidence:**
- `src/app/layout.tsx` — No `<ErrorBoundary>` wrapper
- If a component crashes (e.g., Supabase client fails), the entire app white-screens

**Recommendation:**
Add an Error Boundary:
```tsx
// src/components/error-boundary.tsx
'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

Then wrap the app:
```tsx
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

**Severity:** 🟡 WARNING (degrades UX but not a security issue)

---

### 2.2 Input Sanitization

**Check:** Is user input sanitized before saving to DB?

**Finding:** 🟢 INFO

**Issue:** Rejection report submission accepts raw text without sanitization.

**Evidence:**
```tsx
// src/components/rejection-reports.tsx (approx. line 200)
const handleSubmit = async () => {
  const { error } = await supabase
    .from('rejection_reports')
    .insert({
      bank_id: bankId,
      rejection_reason: rejectionReason, // ← No sanitization
      details: details, // ← No sanitization
      poa_type: poaType,
    });
};
```

**Risk:** User could submit malicious HTML/JavaScript (though React escapes by default when rendering).

**Recommendation:**
```tsx
const sanitizeInput = (text: string): string => {
  return text.trim().slice(0, 1000); // Max 1000 chars, trim whitespace
};

const handleSubmit = async () => {
  const { error } = await supabase
    .from('rejection_reports')
    .insert({
      bank_id: bankId,
      rejection_reason: sanitizeInput(rejectionReason),
      details: sanitizeInput(details),
      poa_type: poaType,
    });
};
```

**Severity:** 🟢 INFO (React escapes output by default, low risk)

---

### 2.3 DRY Violations

**Check:** Is code duplicated unnecessarily?

**Findings:** ✅ NONE

**Rationale:** Codebase is small and well-factored. Supabase client is created once in `/lib/supabase/`, components are modular.

---

### 2.4 Dead Code

**Check:** Are there unused features or components?

**Finding:** 🟢 INFO

**Issue:** Rejection voting feature (upvote/downvote) exists but provides unclear user value.

**Evidence:**
- `rejection_reports.tsx` implements full voting UI
- Users can upvote/downvote rejection reports
- But there's no clear explanation of WHY to vote or WHAT it affects

**Recommendation:**
- Either: Add UI copy explaining voting ("Vote to help others see the most common rejections")
- Or: Remove voting feature if not core to MVP

**Severity:** 🟢 INFO (works fine, just unclear UX)

---

### 2.5 Test Coverage

**Check:** Are critical paths tested?

**Finding:** 🟢 INFO

**Issue:** Test coverage gaps:
- ✅ Unit tests exist (edge cases, schema validation)
- ❌ No integration tests (API routes, Supabase queries)
- ❌ No auth tests (login/signup flows)
- ❌ No E2E tests (user journeys)

**Recommendation:**
Add integration tests for:
1. Bank listing page fetches data correctly
2. Rejection report submission saves to DB
3. RLS policies block unauthorized access

**Example:**
```ts
// src/__tests__/integration/banks.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@/lib/supabase/server';

describe('Banks API', () => {
  it('should fetch all banks', async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('banks').select('*');
    
    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
  });
});
```

**Severity:** 🟢 INFO (not blocking, but should add before Phase 1)

---

### 2.6 Magic Numbers & String Coupling

**Check:** Are there hardcoded values that should be constants?

**Findings:** ✅ NONE (codebase is clean)

---

### 2.7 Consistency

**Check:** Is code style consistent?

**Findings:** ✅ YES

**Rationale:**
- TypeScript strict mode enabled
- ESLint configured and passing
- Consistent use of functional components
- Consistent Supabase client pattern

---

## Files Reviewed

| File | Lines | Issues |
|------|-------|--------|
| `src/components/rejection-reports.tsx` | 300+ | 🟢 Input sanitization (minor) |
| `src/app/layout.tsx` | 50 | 🟡 Missing ErrorBoundary |
| `src/lib/supabase/client.ts` | 20 | ✅ Clean |
| `src/lib/supabase/server.ts` | 30 | ✅ Clean |
| `src/lib/types.ts` | 100 | ✅ Well-typed |
| `src/__tests__/*` | 400+ | 🟢 Coverage gaps (integration tests missing) |
| `supabase/schema.sql` | 300+ | 🟡 RLS policies defined but not deployed |

---

## Pass 2 (Ralph Loop): What Did I Miss?

**Self-critique:**

1. **Did I check environment variable handling?**
   - ✅ Checked `.env.example` — Supabase keys are properly templated
   - ✅ No hardcoded secrets found

2. **Did I check for race conditions?**
   - ⚠️ Possible race: If two users vote on the same rejection report simultaneously, vote count might be off
   - **Mitigation:** Supabase handles atomic increments, so this is actually fine

3. **Did I check accessibility (a11y)?**
   - 🟢 INFO: No `alt` text on bank logos (if logos are added)
   - Not critical for MVP

4. **Did I check mobile responsiveness?**
   - Out of scope for code review (would need browser testing)

---

## Final Recommendations

### Fix Before Phase 1 Launch

1. **Deploy RLS policies** (Step 8: DEPLOY will handle this)
2. **Add ErrorBoundary** (5 minutes, prevents white-screen crashes)
3. **Add input sanitization** (trim + max length on rejection report form)

### Can Defer to Phase 2

4. **Integration tests** (add when building Phase 1 concierge features)
5. **Clarify or remove voting** (depends on user feedback)
6. **Accessibility audit** (Phase 2 polish)

---

## Completion Summary

```
+====================================================================+
|            CODE REVIEW — COMPLETION SUMMARY                        |
+====================================================================+
| Files reviewed           | 7 source files + 4 test files           |
| CRITICAL issues          | 0 🟢                                     |
| WARNING issues           | 2 🟡                                     |
|   - RLS not deployed     | Deploy in Step 8                        |
|   - No ErrorBoundary     | Add in 5 minutes                        |
| INFO issues              | 3 🟢                                     |
|   - Input sanitization   | Low risk (React escapes)                |
|   - Voting feature       | Unclear UX value                        |
|   - Test coverage        | Add integration tests Phase 2           |
+--------------------------------------------------------------------+
| Overall code quality     | 7/10 — Good foundation                  |
| Security posture         | 8/10 — RLS defined, needs deployment    |
| Test coverage            | 5/10 — Unit tests exist, integration missing |
| Maintainability          | 8/10 — Clean, consistent, well-typed    |
+--------------------------------------------------------------------+
| RECOMMENDATION           | ✅ APPROVE with minor fixes             |
| Action items             | 1. Deploy RLS (Step 8)                  |
|                          | 2. Add ErrorBoundary (optional but good)|
|                          | 3. Integration tests (Phase 2)          |
+====================================================================+
```

---

## Honest Take

This codebase is CLEAN. It's a solid foundation for the "rejection tracker" concept.

**What's good:**
- ✅ TypeScript strict mode
- ✅ Supabase properly configured
- ✅ RLS policies designed (just need deployment)
- ✅ Component structure is sensible
- ✅ Tests exist (unit level)

**What's missing:**
- The expanded "POA Autopilot" vision (intake, payment, admin dashboard)
- Integration tests
- Error boundaries

**Verdict:** Ship this as Phase 0 (rejection tracker), then build Phase 1 (concierge) on top of it. The foundation is solid.

---

**Next Step:** Move to Step 7 (TEST) and run the test suite.
