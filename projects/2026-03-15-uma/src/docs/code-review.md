# Code Review — Uma MVP

**Reviewer:** Vishwakarma
**Date:** 2026-03-15
**Files Reviewed:** 20 source files + 4 test files + 1 migration
**Build Status:** ✅ Clean (0 errors)
**Tests:** ✅ 39/39 passing

---

## 🔴 CRITICAL Issues (3)

### C1: WhatsApp signature verification uses wrong secret
**File:** `src/webhook/whatsapp.ts:47`
```typescript
const expectedSig = crypto
  .createHmac('sha256', config.whatsapp.accessToken)
  .update(rawBody)
  .digest('hex');
```
**Problem:** Meta's webhook signature uses the **App Secret**, not the Access Token. Using the access token means signature verification will ALWAYS fail in production, so either all requests get rejected (if enforced) or you're not actually verifying anything.

**Fix:** Add `WHATSAPP_APP_SECRET` to config and use it here:
```typescript
.createHmac('sha256', config.whatsapp.appSecret)
```

**Severity:** 🔴 CRITICAL — security bypass or complete webhook failure in production.

---

### C2: WhatsApp client created per-request, not singleton
**File:** `src/webhook/whatsapp.ts:107`, `src/services/reminder-scheduler.ts:34`, `src/services/adherence.ts:41`

Every incoming message and every cron tick creates a new `WhatsAppClient` instance via `createWhatsAppClient()`. Each one creates a new `axios` instance. At scale, this means:
- Hundreds of Axios instances created/garbage-collected per minute
- No connection pooling
- No rate limiting across instances

**Fix:** Create the client once at startup and inject it:
```typescript
// index.ts
const whatsapp = createWhatsAppClient();
startScheduler(whatsapp);
registerWebhookRoutes(app, whatsapp);
```

**Severity:** 🔴 CRITICAL — will cause memory pressure and miss rate limits at 1000+ users.

---

### C3: Reminder scheduler can send duplicate reminders
**File:** `src/services/reminder-scheduler.ts:18-27`

The `processReminders()` function queries for due reminders and sends them, but there's a race condition: if the cron fires, the query runs, but `updateScheduleLastSent()` hasn't completed yet, the next minute's cron tick could pick up the same reminder again.

**Fix:** Use a database-level lock or atomic UPDATE...RETURNING:
```sql
UPDATE schedules
SET last_sent_at = NOW()
WHERE is_active = true
  AND reminder_time BETWEEN $1 AND $2
  AND (last_sent_at IS NULL OR last_sent_at < CURRENT_DATE)
RETURNING *;
```
This atomically marks reminders as sent while selecting them, preventing double-sends.

**Severity:** 🔴 CRITICAL — patients could receive duplicate reminders, which is confusing and unprofessional.

---

## 🟡 IMPORTANT Issues (5)

### I1: No font files included — infographic generator will crash
**File:** `src/services/infographic.ts:30-37`

The infographic generator tries to load `fonts/NotoSansDevanagari-Regular.ttf` but no fonts are included in the repo. The `loadFont()` function returns `Buffer.alloc(0)` on failure, and then line 213 throws: `'Font files not found.'`

**Fix:** Either:
- Add a `setup.sh` script that downloads the fonts from Google Fonts
- Include fonts in the repo (Noto Sans Devanagari is ~300KB per weight, Apache 2.0 licensed)
- Add to README: "Download fonts before running"

---

### I2: Prescription image URL may expire before GPT-4o processes it
**File:** `src/webhook/whatsapp.ts:57-65`

Meta's media URLs expire after a few minutes. We fetch the URL in the webhook handler, but the actual GPT-4o call happens later in `handlePrescriptionImage()`. If there's any queue delay, the URL could expire.

**Fix:** Download the image to local storage (or Supabase Storage) immediately when received, then pass the stored URL to GPT-4o.

---

### I3: No rate limiting on prescription scans
**File:** `src/conversation/engine.ts`

A user could spam prescription photos and trigger unlimited GPT-4o calls. At $0.01-0.05 per call, a malicious user could run up significant AI costs.

**Fix:** Add a per-user daily limit check before calling `readPrescription()`:
```typescript
const scanCount = await db.countTodayScans(user.id);
if (scanCount >= 5) {
  await whatsapp.sendText(phone, "Daily scan limit reached. Try again tomorrow.");
  return;
}
```

---

### I4: Conversation state not unique-constrained
**File:** `supabase/migrations/001_initial.sql:94`

The `conversations` table has a phone column but no UNIQUE constraint. The `upsertConversation()` function in queries.ts presumably handles this, but without a DB-level constraint, concurrent messages could create duplicate conversation rows.

**Fix:** Add `UNIQUE` constraint:
```sql
CREATE TABLE conversations (
  ...
  phone VARCHAR(15) NOT NULL UNIQUE,
  ...
);
```

---

### I5: Prescription reader doesn't handle multi-page prescriptions
**File:** `src/services/prescription-reader.ts`

The GPT-4o call only accepts a single image URL. Indian prescriptions sometimes span 2 pages (front and back). The current flow has no way for the user to send multiple images for one prescription.

**Fix (future):** Add a "Send more pages? YES/NO" step after the first image. For MVP, this is acceptable — add a note in the README.

---

## 🟢 GOOD Patterns Observed

### ✅ Clean abstraction layer
The `WhatsAppClient` interface with `MetaCloudClient` implementation is exactly right. Swapping to a BSP later is a one-file change.

### ✅ Drug validation with dosage safety checks
The `drug-validator.ts` properly checks max daily dose by multiplying per-dose × frequency. The Metformin 500mg × TDS = 1500mg < 2000mg max check is correct.

### ✅ Bilingual messages throughout
Every user-facing message is Hindi + English via the `bilingual()` helper. Consistent and clean.

### ✅ Conversation FSM with valid transitions table
The state machine has a formal `VALID_TRANSITIONS` array and `isValidTransition()` function. Good for debugging.

### ✅ Medical disclaimer on every output
Both the infographic (`⚠️ यह चिकित्सा सलाह नहीं है`) and the confirmation flow include disclaimers.

### ✅ Medication confirmation is mandatory
The flow REQUIRES user to confirm each medication before activating reminders. This was a non-negotiable from the CEO review and it's properly implemented.

### ✅ Caretaker alert on missed doses
30-minute window check, then alert to caretaker. Clean implementation.

### ✅ Graceful shutdown
Server handles SIGINT/SIGTERM, stops scheduler, closes Fastify.

---

## 📊 Code Quality Metrics

| Metric | Value | Assessment |
|---|---|---|
| Total files | 24 (20 src + 4 test) | Right-sized for MVP |
| Lines of code | 6,942 | Lean |
| Test coverage | 39 tests across 4 suites | Good for MVP, needs integration tests |
| Build errors | 0 | Clean |
| Critical issues | 3 | Must fix before deploy |
| Important issues | 5 | Should fix before launch |
| Good patterns | 8 | Solid architecture |

---

## Recommendation

**Fix the 3 critical issues before deployment:**
1. WhatsApp signature verification — use App Secret, not Access Token
2. WhatsApp client singleton — create once, inject everywhere
3. Reminder deduplication — atomic UPDATE...RETURNING

**Fix I1 (fonts) and I4 (unique constraint) before first user test.**

The rest can wait for v1.1. Overall, this is a solid MVP build — clean code, good separation of concerns, proper safety patterns.
