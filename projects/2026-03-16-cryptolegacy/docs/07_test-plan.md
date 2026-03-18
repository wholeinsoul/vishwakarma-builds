# Test Plan — CryptoLegacy
**Date:** 2026-03-16 | **Project:** Crypto inheritance dead man's switch

---

## 1. Unit Tests

### 1.1 Crypto Service (Client-Side)

| Function | Input | Expected Output | Edge Cases | Priority |
|----------|-------|-----------------|------------|----------|
| `encrypt()` | plaintext guide JSON, passphrase | Returns { ciphertext, iv, salt } (AES-256-GCM) | Empty plaintext, very long guide (>1MB), Unicode passphrase, passphrase with emojis | P0 |
| `decrypt()` | ciphertext, iv, salt, passphrase | Returns original plaintext JSON | Wrong passphrase → throws DecryptionError, corrupted ciphertext, tampered iv | P0 |
| `deriveKey()` | passphrase, salt | Returns CryptoKey via PBKDF2 (100K iterations) | Empty passphrase, 1-char passphrase, 1000-char passphrase | P0 |
| `generateSalt()` | none | Returns 16-byte random Uint8Array | Cryptographic randomness (not Math.random) | P0 |
| `serializeForStorage()` | { ciphertext, iv, salt } | Returns base64 string suitable for DB storage | Large payloads (>500KB), binary safety | P1 |
| `deserializeFromStorage()` | base64 string | Returns { ciphertext, iv, salt } | Corrupted base64, truncated string | P1 |

### 1.2 Guide Builder

| Function | Test | Priority |
|----------|------|----------|
| `validateStep()` | Step 1: At least 1 platform selected | P0 |
| `validateStep()` | Step 2: Each platform has wallet type + access method filled | P0 |
| `validateStep()` | Step 3: At least 1 beneficiary with email | P0 |
| `validateStep()` | Step 4: Passphrase ≥12 chars, confirmation matches | P0 |
| `validateStep()` | Step 5: Check-in interval selected (30/60/90 days) | P0 |
| `buildGuideJSON()` | All steps completed | Returns structured guide object with all platform details | P0 |
| `buildGuideJSON()` | Missing optional fields | Returns guide with nulls for optional fields, no crash | P1 |

### 1.3 Dead Man's Switch

| Function | Test | Priority |
|----------|------|----------|
| `checkIn()` | user_id | Resets switch timer, creates check_in record | P0 |
| `checkIn()` | Non-existent user_id | Returns 404 | P1 |
| `isOverdue()` | user_id, current_time | Returns true if last_check_in + interval < now | P0 |
| `isOverdue()` | User who never checked in | Uses account creation date as baseline | P1 |
| `triggerSwitch()` | user_id | Sends encrypted guide links to all beneficiaries | P0 |
| `triggerSwitch()` | User with 0 beneficiaries | Logs warning, does not send emails, does not crash | P0 |
| `triggerSwitch()` | User with 5 beneficiaries | Sends 5 emails, all with unique decrypt links | P0 |
| `getGracePeriodStatus()` | user_id | Returns days until trigger, warning level (green/yellow/red) | P1 |

### 1.4 Services

| Module | Function | Input | Expected | Edge Cases | Priority |
|--------|----------|-------|----------|------------|----------|
| `BeneficiaryService` | `addBeneficiary()` | user_id, name, email, relationship | Creates beneficiary record | Duplicate email for same user, max 10 beneficiaries, self as beneficiary | P0 |
| `BeneficiaryService` | `removeBeneficiary()` | beneficiary_id, user_id | Deletes record | Non-existent id, wrong user's beneficiary | P0 |
| `BeneficiaryService` | `listBeneficiaries()` | user_id | Returns array | 0 beneficiaries, 10 beneficiaries | P1 |
| `EmailService` | `sendCheckInReminder()` | user_email, days_remaining | Sends reminder email | Bounced email, unsubscribed user | P1 |
| `EmailService` | `sendBeneficiaryNotification()` | beneficiary_email, decrypt_url, grantor_name | Sends "access your inheritance guide" email | Invalid email, long grantor name | P0 |
| `StripeService` | `createCheckout()` | user_id, plan (free/pro/family) | Returns Stripe checkout URL | Already subscribed, invalid plan | P1 |
| `StripeService` | `handleWebhook()` | Stripe event | Updates user plan | Duplicate event, subscription cancelled | P1 |
| `CronService` | `scanOverdueSwitches()` | none | Returns list of overdue user_ids | 0 overdue, 100 overdue, user who disabled switch | P0 |

### 1.5 Components

| Component | Test | Priority |
|-----------|------|----------|
| `GuideWizard` | Renders all 5 steps, validates before advancing | P0 |
| `GuideWizard` | Back button preserves entered data | P1 |
| `PlatformSelector` | Shows common platforms (Coinbase, Binance, Metamask, Ledger, etc.) | P1 |
| `PlatformSelector` | Allows custom platform entry | P1 |
| `PassphraseInput` | Shows strength meter, enforces minimum 12 chars | P0 |
| `PassphraseInput` | Confirmation field must match | P0 |
| `CheckInButton` | Click → API call → shows "Checked in!" with next due date | P0 |
| `CheckInButton` | Disabled state during API call (prevent double-click) | P1 |
| `SwitchStatusCard` | Shows green/yellow/red based on days until trigger | P1 |
| `BeneficiaryList` | CRUD operations, shows email + relationship | P1 |
| `DecryptPage` | Enter passphrase → decrypt → display guide | P0 |
| `DecryptPage` | Wrong passphrase → clear error message, retry | P0 |

---

## 2. Integration Tests

### 2.1 API Endpoints

| Endpoint | Method | Test | Expected | Priority |
|----------|--------|------|----------|----------|
| `/api/check-in` | POST | Valid check-in (authenticated) | 200 + check_in record + timer reset | P0 |
| `/api/check-in` | POST | Unauthenticated | 401 | P0 |
| `/api/beneficiaries` | GET | List own beneficiaries | 200 + array (own only) | P0 |
| `/api/beneficiaries` | POST | Add beneficiary | 201 + beneficiary_id | P0 |
| `/api/beneficiaries` | POST | Add >10 beneficiaries | 400 "max 10 beneficiaries" | P1 |
| `/api/beneficiaries` | DELETE | Remove own beneficiary | 204 | P0 |
| `/api/beneficiaries` | DELETE | Remove another user's beneficiary | 404 (RLS) | P0 |
| `/api/guides` | POST | Save encrypted guide (ciphertext) | 201 + guide_id | P0 |
| `/api/guides` | POST | Save guide >5MB | 400 "too large" | P1 |
| `/api/guides/:id` | GET | Get own encrypted guide | 200 + ciphertext | P0 |
| `/api/guides/:id` | GET | Get another user's guide | 404 (RLS) | P0 |
| `/api/decrypt/:token` | GET | Valid beneficiary token after switch triggered | 200 + encrypted guide data | P0 |
| `/api/decrypt/:token` | GET | Valid token but switch not triggered | 403 "switch not yet triggered" | P0 |
| `/api/decrypt/:token` | GET | Invalid/expired token | 404 | P0 |
| `/api/cron/check-switches` | POST | Cron: scan overdue switches | 200 + triggered count | P0 |
| `/api/cron/check-switches` | POST | Without cron secret | 403 | P0 |
| `/api/webhook/stripe` | POST | Valid subscription event | 200 + plan updated | P1 |
| `/api/webhook/stripe` | POST | Invalid signature | 400 | P1 |

### 2.2 Database Operations

| Operation | Test | Priority |
|-----------|------|----------|
| RLS: User sees only own guides | Insert 2 users with guides, query as User A → only A's guide | P0 |
| RLS: User sees only own beneficiaries | Same pattern | P0 |
| RLS: Beneficiary can read guide via token (after trigger) | Beneficiary token → grants read on specific guide | P0 |
| Cascade: Delete user → cascade guides, beneficiaries, check_ins, switches | Verify no orphan records | P1 |
| Switch trigger transaction | Update switch status + create beneficiary tokens + queue emails = atomic | P0 |

### 2.3 Auth Flows

| Flow | Test | Priority |
|------|------|----------|
| Sign up with email/password | Creates profile, redirects to /dashboard | P0 |
| Magic link login | Sends email, clicking link authenticates | P1 |
| Session persistence | Refresh page → still authenticated | P0 |
| Logout | Clears session, redirects to / | P1 |

---

## 3. E2E Tests

### 3.1 Happy Path — Complete Setup

1. Land on `/` → see value prop + pricing
2. Click "Get Started Free" → `/signup`
3. Sign up → redirected to `/dashboard` (empty state)
4. Click "Create Recovery Guide" → `/guide-builder`
5. Step 1: Select Coinbase + MetaMask
6. Step 2: Fill wallet details (recovery phrase location, 2FA method)
7. Step 3: Add beneficiary (spouse's email)
8. Step 4: Set passphrase ("MySecurePhrase123!")
9. Step 5: Set check-in interval (30 days)
10. Submit → guide encrypted client-side → ciphertext saved to DB
11. Redirected to `/dashboard` → see active switch, next check-in date
12. ✅ Passphrase NEVER sent to server (verify via network tab)

### 3.2 Happy Path — Check-In

1. Login → `/dashboard`
2. Click "I'm Still Here" check-in button
3. Timer resets, next check-in date updated
4. Confirmation shown

### 3.3 Happy Path — Switch Triggers

1. Set up guide + beneficiary + 1-day interval (test mode)
2. Wait for cron to fire (or manually trigger)
3. Beneficiary receives email with decrypt link
4. Beneficiary clicks link → `/decrypt/[token]`
5. Enters passphrase → guide decrypted and displayed
6. ✅ Guide shows platform details, wallet info, recovery steps

### 3.4 Error Paths

| Scenario | Expected | Priority |
|----------|----------|----------|
| Wrong passphrase on decrypt | "Incorrect passphrase. Please try again." (no data leak) | P0 |
| Expired decrypt token | "This link has expired. Contact the guide owner." | P1 |
| Guide builder with no platforms | Can't advance past Step 1 | P0 |
| Check-in when switch already triggered | "Switch already triggered. Cannot check in." | P1 |
| Add beneficiary with own email | "You cannot be your own beneficiary" | P1 |

---

## 4. Performance Tests

| Target | Threshold | Method | Priority |
|--------|-----------|--------|----------|
| Landing page TTFB | < 200ms | Lighthouse CI | P1 |
| Client-side encryption (1KB guide) | < 500ms | Browser benchmark | P0 |
| Client-side encryption (100KB guide) | < 2s | Browser benchmark | P1 |
| Client-side decryption | < 500ms | Browser benchmark | P0 |
| Check-in API | < 200ms | k6 | P1 |
| Cron scan (1000 users) | < 10s total | Benchmark | P1 |
| Guide wizard page load | < 1s | Lighthouse | P2 |

---

## 5. Security Tests

| Test | Method | Expected | Priority |
|------|--------|----------|----------|
| Zero-knowledge: passphrase never sent to server | Network traffic inspection during guide save | Only ciphertext in request body | P0 |
| Zero-knowledge: plaintext guide never sent to server | Network inspection during guide save | Only ciphertext | P0 |
| Encryption uses Web Crypto (not custom) | Code review | `crypto.subtle.encrypt()` with AES-256-GCM | P0 |
| Key derivation uses PBKDF2 with ≥100K iterations | Code review | `crypto.subtle.deriveKey()` params | P0 |
| Beneficiary token brute-force | Attempt 1000 random tokens | All return 404, rate limited after 20 | P0 |
| Decrypt token only works after switch triggered | Access token before trigger | 403 | P0 |
| RLS: User A can't read User B's guide | API test with User A's token | 404 | P0 |
| Stripe webhook signature verification | Send unsigned webhook | 400 rejected | P1 |
| Cron endpoint requires secret | Call without `x-cron-secret` header | 403 | P0 |
| XSS in guide content | Inject `<script>` in platform details → decrypt page | Escaped rendering | P0 |
| Session hijacking | Use expired/tampered JWT | 401 | P1 |

---

## 6. Test Matrix Summary

| Area | What | How | Expected | Priority |
|------|------|-----|----------|----------|
| Crypto | Encrypt/decrypt round-trip | Unit test | Identical plaintext after decrypt | P0 |
| Crypto | Wrong passphrase | Unit test | DecryptionError thrown | P0 |
| Crypto | Zero-knowledge | Network inspection | No plaintext to server | P0 |
| Crypto | PBKDF2 params | Code review | 100K+ iterations, SHA-256 | P0 |
| Switch | Check-in resets timer | Integration test | Timer updated in DB | P0 |
| Switch | Overdue detection | Integration test | Cron catches overdue users | P0 |
| Switch | Trigger sends emails | Integration test | All beneficiaries emailed | P0 |
| Switch | Trigger creates valid tokens | Integration test | Tokens work on decrypt page | P0 |
| Auth | Sign up / sign in | E2E | User authenticated | P0 |
| Auth | RLS isolation | DB test | Users see only own data | P0 |
| Beneficiary | CRUD | API test | Add, list, remove | P0 |
| Beneficiary | Max limit | API test | 400 after 10 | P1 |
| Decrypt | Valid token + correct passphrase | E2E | Guide displayed | P0 |
| Decrypt | Valid token + wrong passphrase | E2E | Error, no data leak | P0 |
| Decrypt | Token before trigger | API test | 403 | P0 |
| Payments | Stripe checkout | Integration | URL returned | P1 |
| Payments | Webhook | Integration | Plan updated | P1 |
| Perf | Client encryption speed | Browser bench | < 500ms for 1KB | P0 |
| Perf | Cron scan 1000 users | Bench | < 10s | P1 |
| Security | XSS on decrypt page | E2E | Escaped | P0 |
| Security | Brute-force tokens | k6 | Rate limited | P0 |

---

## 7. Coverage Targets

| Type | Minimum | Stretch |
|------|---------|---------|
| Unit tests (crypto) | 100% (critical path) | 100% with edge cases |
| Unit tests (services) | 80% line coverage | 90% |
| Integration tests (API) | 100% of endpoints | + all error codes |
| E2E tests | Setup + check-in + trigger + decrypt | + payment flows |
| Security tests | All P0 items | All P0 + P1 |

**Test Framework:** Vitest (unit + integration) + Playwright (E2E)
**Crypto Testing:** Use known test vectors for AES-256-GCM to verify implementation correctness
**CI:** GitHub Actions — crypto tests on every commit, full suite on PR
