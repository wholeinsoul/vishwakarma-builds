# Test Plan — POA Autopilot (POA Toolkit)
**Date:** 2026-03-12 | **Project:** ConcretePOA — Bank-compliant POA concierge service

---

## 1. Unit Tests

### 1.1 Services

| Module | Function | Input | Expected Output | Edge Cases | Priority |
|--------|----------|-------|-----------------|------------|----------|
| `IntakeService` | `validateIntakeForm()` | Form data with parent info, bank list, notary pref | Returns validated object or throws `ValidationError` | Empty bank list, >5 banks selected, missing parent DOB, future DOB | P0 |
| `IntakeService` | `saveIntake()` | Validated form + user_id | Creates `intake_forms` record, returns intake_id | Duplicate submission (same user), DB connection failure | P0 |
| `PaymentService` | `createCheckoutSession()` | user_id, intake_id | Returns Stripe checkout URL | Invalid user_id, already-paid intake | P0 |
| `PaymentService` | `verifyWebhookSignature()` | Request body, Stripe signature header | Returns true/false | Missing signature header, tampered body, expired timestamp | P0 |
| `PaymentService` | `handlePaymentSuccess()` | Stripe event object | Creates `payments` record + `submissions` record | Duplicate webhook (idempotency), missing metadata | P0 |
| `DocumentService` | `uploadPOA()` | File buffer, user_id, submission_id | Returns storage URL | Non-PDF file, 0-byte file, >10MB file, invalid user_id | P1 |
| `DocumentService` | `getPOADownloadUrl()` | submission_id, user_id | Returns signed download URL | Expired URL, wrong user requesting, no file uploaded yet | P1 |
| `EmailService` | `sendStatusUpdate()` | user_email, status, submission_id | Sends email via Resend | Invalid email, Resend API down (should queue), bounced email | P1 |
| `BankService` | `listBanks()` | Optional search query | Returns array of bank objects | Empty search, no results, special characters in query | P2 |
| `BankService` | `getBankRequirements()` | bank_id | Returns requirements array | Non-existent bank_id, bank with no requirements yet | P1 |

### 1.2 Components

| Component | Test | Priority |
|-----------|------|----------|
| `IntakeWizard` | Renders all steps, validates required fields per step, navigates forward/back | P0 |
| `IntakeWizard` | Prevents submission with empty bank selection | P0 |
| `BankSelector` | Renders bank list, allows multi-select (max 5), shows search/filter | P1 |
| `PaymentForm` | Redirects to Stripe Checkout on submit, shows loading state | P0 |
| `SubmissionCard` | Displays correct status badge (preparing/submitted/approved/rejected) | P1 |
| `SubmissionCard` | Shows download button only when status=approved | P1 |
| `AdminTaskCard` | Shows task details, allows status updates, logs admin actions | P1 |

### 1.3 Utilities

| Utility | Test | Priority |
|---------|------|----------|
| Input sanitization | Strips HTML/script tags from text inputs | P0 |
| Date formatting | Handles null dates, future dates, different locales | P2 |
| File type validation | Accepts PDF only, rejects .exe/.js/.html | P0 |
| CSRF token generation/validation | Generates unique token per session, validates on API requests | P0 |

---

## 2. Integration Tests

### 2.1 API Endpoints

| Endpoint | Method | Test | Expected | Priority |
|----------|--------|------|----------|----------|
| `/api/intake` | POST | Submit valid intake form (authenticated) | 201 + intake_id | P0 |
| `/api/intake` | POST | Submit without authentication | 401 Unauthorized | P0 |
| `/api/intake` | POST | Submit with missing required fields | 400 + field-level errors | P0 |
| `/api/intake` | POST | Submit with >5 banks selected | 400 + "max 5 banks" error | P1 |
| `/api/payment` | POST | Create checkout session for valid intake | Stripe checkout URL | P0 |
| `/api/payment` | POST | Create checkout for already-paid intake | 409 Conflict | P0 |
| `/api/payment/webhook` | POST | Valid Stripe webhook (payment_intent.succeeded) | 200 + payment+submission records created | P0 |
| `/api/payment/webhook` | POST | Invalid webhook signature | 400 Rejected | P0 |
| `/api/payment/webhook` | POST | Duplicate webhook (same payment_intent_id) | 200 Idempotent (no duplicate records) | P0 |
| `/api/submissions` | GET | List own submissions (authenticated) | 200 + array of own submissions only | P0 |
| `/api/submissions` | GET | User A tries to access User B's submissions | Empty array (RLS filters) | P0 |
| `/api/submissions/:id` | GET | Get own submission details | 200 + submission object | P1 |
| `/api/submissions/:id` | GET | Get another user's submission | 404 (RLS) | P0 |
| `/api/banks` | GET | List all banks | 200 + array with id, name, requirements_count | P1 |
| `/api/admin/tasks` | GET | List all tasks (admin role) | 200 + all concierge tasks | P1 |
| `/api/admin/tasks` | GET | List tasks (non-admin user) | 403 Forbidden | P0 |
| `/api/admin/tasks/:id` | PATCH | Update task status (admin) | 200 + updated task + audit log entry | P1 |

### 2.2 Database Operations

| Operation | Test | Priority |
|-----------|------|----------|
| RLS: User sees only own `submissions` | Insert 2 users with submissions, query as User A → only User A's rows | P0 |
| RLS: Admin sees all `submissions` | Query as admin role → all rows returned | P0 |
| RLS: User cannot update `concierge_tasks` | Attempt update as regular user → permission denied | P0 |
| Cascade: Delete user → delete their submissions, intakes, payments | Verify foreign key cascades | P1 |
| Trigger: Payment record creation → submission auto-created | Verify trigger fires on payments insert | P0 |
| Index: Bank search by name | Full-text search returns results in <50ms | P2 |

### 2.3 Auth Flows

| Flow | Test | Priority |
|------|------|----------|
| Sign up with email/password | Creates profile, redirects to /intake | P0 |
| Sign in with existing credentials | Authenticates, redirects to /dashboard | P0 |
| Sign up with duplicate email | Shows "email already registered" error | P0 |
| Password reset flow | Sends reset email, allows password change | P1 |
| Session expiry | After token expires, redirects to /login | P1 |
| Admin login + role check | Admin user gets admin role, can access /admin | P0 |

---

## 3. E2E Tests

### 3.1 Happy Path — Complete User Journey

1. Land on `/` → see value prop + "Get Started" CTA
2. Click "Get Started" → redirected to `/signup`
3. Sign up with email/password → redirected to `/intake`
4. Fill intake form (parent info, select 2 banks, notary preference) → submit
5. Redirected to Stripe Checkout → complete payment ($399)
6. Redirected to `/dashboard` → see submission with status "Preparing"
7. Receive confirmation email

### 3.2 Error Paths

| Scenario | Steps | Expected Outcome | Priority |
|----------|-------|-------------------|----------|
| Incomplete intake | Fill form but skip bank selection → submit | Validation error, form stays on current step | P0 |
| Payment failure | Complete intake → Stripe checkout → card declined | Return to payment page with error, intake preserved | P0 |
| Payment abandonment | Complete intake → go to Stripe → close tab | On return, show "Payment incomplete" with retry | P1 |
| Unauthorized dashboard | Not logged in → navigate to /dashboard | Redirect to /login | P0 |
| Unauthorized admin | Regular user → navigate to /admin | 403 page or redirect | P0 |

---

## 4. Performance Tests

| Target | Threshold | Method | Priority |
|--------|-----------|--------|----------|
| Landing page TTFB | < 200ms | Lighthouse CI | P1 |
| Intake form submission | < 500ms response | k6 load test | P1 |
| Bank list API | < 100ms for 50 banks | Benchmark with 50+ seed banks | P2 |
| Dashboard load (10 submissions) | < 1s total page load | Puppeteer timing | P2 |
| Concurrent users (50 simultaneous) | No 5xx errors | k6 stress test | P2 |
| Stripe webhook processing | < 2s end-to-end | Stripe CLI test events | P1 |

---

## 5. Security Tests

| Test | Method | Expected | Priority |
|------|--------|----------|----------|
| SQL injection in intake form | Enter `'; DROP TABLE submissions; --` in notes field | Query parameterized, no effect | P0 |
| XSS in intake form | Enter `<script>alert('xss')</script>` in parent name | Escaped in rendering, no script execution | P0 |
| CSRF on /api/intake | POST from external origin without CSRF token | 403 Rejected | P0 |
| Stripe webhook spoofing | POST to /api/payment/webhook without valid signature | 400 Rejected | P0 |
| Horizontal privilege escalation | User A's token → GET /api/submissions/{user_B_submission_id} | 404 (RLS blocks) | P0 |
| File upload abuse | Upload .exe file to POA upload endpoint | 400 "PDF only" error | P0 |
| Admin role escalation | Regular user modifies JWT to include admin role | Supabase verifies server-side, denied | P0 |
| Rate limiting on auth endpoints | 20 login attempts in 60s | Rate limited after 10 attempts | P1 |

---

## 6. Test Matrix Summary

| Area | What | How | Expected Result | Priority |
|------|------|-----|-----------------|----------|
| Auth | Sign up | Supabase Auth + Vitest | Profile created, session returned | P0 |
| Auth | Duplicate email | Supabase Auth + Vitest | Error: email exists | P0 |
| Intake | Valid submission | API test | 201 + intake_id | P0 |
| Intake | Missing fields | API test | 400 + validation errors | P0 |
| Intake | >5 banks | API test | 400 + max banks error | P1 |
| Payment | Webhook success | Stripe CLI + API test | Payment + submission created | P0 |
| Payment | Webhook duplicate | API test | Idempotent (no duplicate) | P0 |
| Payment | Spoofed webhook | API test | 400 rejected | P0 |
| RLS | User isolation | DB test | User sees only own data | P0 |
| RLS | Admin access | DB test | Admin sees all data | P0 |
| Security | SQL injection | API test | No effect (parameterized) | P0 |
| Security | XSS | Component test | Tags escaped | P0 |
| Security | CSRF | API test | 403 without token | P0 |
| File | PDF upload | API test | 200 + storage URL | P1 |
| File | Non-PDF upload | API test | 400 rejected | P0 |
| Perf | Landing TTFB | Lighthouse | < 200ms | P1 |
| Perf | API response | k6 | < 500ms | P1 |
| E2E | Full journey | Playwright | Signup → pay → dashboard | P0 |
| E2E | Payment failure | Playwright | Error handling, retry option | P0 |

---

## 7. Coverage Targets

| Type | Minimum | Stretch |
|------|---------|---------|
| Unit tests | 80% line coverage | 90% |
| Integration tests (API) | 100% of endpoints | 100% with error paths |
| E2E tests | Happy path + 3 error paths | All error paths |
| Security tests | All P0 items | All P0 + P1 |

**Test Framework:** Vitest (unit + integration) + Playwright (E2E)
**CI:** GitHub Actions — run on every PR, block merge on failure
