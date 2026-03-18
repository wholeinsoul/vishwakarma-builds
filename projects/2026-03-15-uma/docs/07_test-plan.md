# Test Plan — Uma
**Date:** 2026-03-15 | **Project:** WhatsApp-based medicine reminder for elderly parents (India)

---

## 1. Unit Tests

### 1.1 Services

| Module | Function | Input | Expected Output | Edge Cases | Priority |
|--------|----------|-------|-----------------|------------|----------|
| `WhatsAppClient` | `sendText()` | phone, message | Returns message_id from Meta API | Invalid phone format, API rate limit, message >4096 chars | P0 |
| `WhatsAppClient` | `sendImage()` | phone, image_url, caption | Returns message_id | Invalid URL, image >16MB, unreachable URL | P0 |
| `WhatsAppClient` | `sendVoice()` | phone, audio_url | Returns message_id | Audio >16MB, unsupported format | P1 |
| `WhatsAppClient` | `sendButtons()` | phone, text, buttons[] | Returns message_id | >3 buttons (Meta limit), empty button text | P0 |
| `WhatsAppClient` | `sendTemplate()` | phone, template_name, params | Returns message_id | Unapproved template, missing params, wrong param count | P0 |
| `ConversationRouter` | `routeMessage()` | incoming WhatsApp message | Routes to correct handler (photo→OCR, text→intent, button→action) | Unknown message type, empty message, sticker, location | P0 |
| `ConversationRouter` | `detectIntent()` | text message (Hindi/English) | Returns intent enum (add_medicine, check_schedule, help, unknown) | Mixed Hindi-English, typos, voice-to-text artifacts | P1 |
| `OCRService` | `extractPrescription()` | image buffer (prescription photo) | Returns { medicines: [{name, dosage, frequency, duration}] } | Blurry image, handwritten Hindi, multiple medicines, empty image | P0 |
| `OCRService` | `validateExtraction()` | extracted medicine data | Returns validated + flagged items | Unknown medicine name, dangerous dosage, missing frequency | P0 |
| `ReminderScheduler` | `scheduleReminder()` | user_id, medicine_id, time, frequency | Creates BullMQ job | Past time, midnight crossing, timezone edge (IST), duplicate schedule | P0 |
| `ReminderScheduler` | `cancelReminder()` | job_id | Removes BullMQ job | Non-existent job, already-fired job | P1 |
| `ReminderScheduler` | `handleMissedReminder()` | user_id, medicine_id | Sends follow-up after 30min, alerts caretaker after 2 missed | First miss vs repeated miss, caretaker not configured | P0 |
| `InfographicService` | `generateScheduleImage()` | medicines[], language | Returns PNG buffer | 0 medicines, 10+ medicines (layout overflow), Hindi text rendering | P1 |
| `TTSService` | `textToSpeech()` | text (Hindi), voice_id | Returns audio buffer (OGG) | Empty text, text >5000 chars, API quota exceeded | P1 |
| `UserService` | `registerUser()` | phone, name, language_pref | Creates user record | Duplicate phone, invalid phone format, unsupported language | P0 |
| `UserService` | `addCaretaker()` | user_id, caretaker_phone | Links caretaker to user | Same phone as user, duplicate caretaker, max caretakers reached | P1 |

### 1.2 Webhook Processing

| Function | Test | Priority |
|----------|------|----------|
| `verifyWebhookSignature()` | Valid Meta signature → true, tampered → false | P0 |
| `parseWebhookPayload()` | Text message, image message, button callback, status update | P0 |
| `parseWebhookPayload()` | Malformed JSON, missing fields, unexpected message types | P0 |
| `deduplicateMessage()` | Same message_id within 5min → skip, different → process | P0 |

### 1.3 Utilities

| Utility | Test | Priority |
|---------|------|----------|
| Phone normalizer | `+91-98765-43210` → `919876543210`, `09876543210` → `919876543210` | P0 |
| Hindi text sanitizer | Strips invisible chars, normalizes Unicode | P1 |
| Time parser (natural language) | "सुबह 8 बजे" → 08:00 IST, "रात 10" → 22:00 IST | P1 |
| Dosage parser | "1 tablet 2 times daily" → {qty: 1, unit: "tablet", frequency: "twice_daily"} | P1 |

---

## 2. Integration Tests

### 2.1 API/Webhook Endpoints

| Endpoint | Method | Test | Expected | Priority |
|----------|--------|------|----------|----------|
| `/webhook` | POST | Valid text message from Meta | 200 + message processed | P0 |
| `/webhook` | POST | Valid image message (prescription photo) | 200 + OCR triggered, medicines extracted | P0 |
| `/webhook` | POST | Button callback (confirm/snooze/skip) | 200 + action recorded | P0 |
| `/webhook` | POST | Invalid signature | 403 rejected | P0 |
| `/webhook` | POST | Duplicate message_id | 200 idempotent (no double processing) | P0 |
| `/webhook` | GET | Meta verification challenge | Returns challenge token | P0 |
| `/api/health` | GET | Health check | 200 + DB connected + Redis connected + Meta API reachable | P1 |
| `/api/admin/users` | GET | List all users (admin auth) | 200 + user array | P1 |
| `/api/admin/users/:id/reminders` | GET | Get user's reminder schedule | 200 + schedule array | P1 |

### 2.2 Database Operations

| Operation | Test | Priority |
|-----------|------|----------|
| Create user + medicines + schedule in transaction | All or nothing — partial failure rolls back | P0 |
| Query upcoming reminders (next 5 min window) | Returns correct set, handles timezone (IST) | P0 |
| Record acknowledgment (button press) | Updates reminder_log, stops escalation | P0 |
| Record missed reminder | Creates missed_reminder entry, triggers escalation check | P0 |
| Caretaker alert threshold | 2 consecutive misses → caretaker notified | P0 |

### 2.3 External Service Integration

| Service | Test | Priority |
|---------|------|----------|
| Meta Cloud API → send message | Send text to test number, verify delivery | P0 |
| OpenAI GPT-4o Vision → OCR | Send sample prescription image, verify extraction | P0 |
| Google Cloud TTS → Hindi audio | Generate "दवाई लेने का समय" audio, verify playback | P1 |
| Razorpay → payment link generation | Create ₹99/month subscription link | P2 |
| BullMQ → scheduled job fires at correct time | Schedule job for +5s, verify fires within 1s tolerance | P0 |
| BullMQ → job retry on failure | Simulate WhatsApp API failure, verify 3 retries with backoff | P1 |

---

## 3. E2E Tests

### 3.1 Happy Path — New User Onboarding

1. User sends "Hi" to WhatsApp number
2. Uma responds with welcome message (Hindi) + "Send a photo of your prescription"
3. User sends prescription photo
4. Uma extracts medicines, sends back list: "I found: Metformin 500mg, Amlodipine 5mg. Is this correct?"
5. User taps "Yes, correct" button
6. Uma asks: "When should I remind you? Morning (8am), Afternoon (2pm), Night (10pm)?"
7. User taps "Morning" + "Night"
8. Uma confirms: "I'll remind you at 8am and 10pm daily. Starting tomorrow!"
9. Schedule card (infographic PNG) sent

### 3.2 Happy Path — Reminder Flow

1. 8:00 AM IST: Uma sends "दवाई लेने का समय! Metformin 500mg लें" + voice note
2. User taps "✅ Taken" button
3. Uma responds "Great! 👍" — logged as taken
4. No escalation triggered

### 3.3 Missed Reminder Flow

1. 8:00 AM: Reminder sent
2. 8:30 AM: No response → follow-up: "अभी तक दवाई नहीं ली? कृपया लें"
3. 9:00 AM: Still no response → second follow-up
4. 10:00 AM: 2 consecutive misses → caretaker alerted: "[Parent] missed 2 medicine reminders today"

### 3.4 Error Paths

| Scenario | Expected | Priority |
|----------|----------|----------|
| Blurry prescription photo | "I couldn't read this clearly. Please send a clearer photo" | P0 |
| Non-prescription image (selfie) | "This doesn't look like a prescription. Please send a prescription photo" | P1 |
| User sends voice note (not supported yet) | "I can't process voice messages yet. Please type your message" | P1 |
| WhatsApp API rate limited | Queue messages, retry with backoff, no duplicate sends | P0 |
| Redis down (scheduler failure) | Fallback: log to DB, send alert to admin, resume when Redis recovers | P0 |

---

## 4. Performance Tests

| Target | Threshold | Method | Priority |
|--------|-----------|--------|----------|
| Webhook response time | < 200ms (acknowledge fast, process async) | k6 | P0 |
| OCR processing (prescription) | < 10s end-to-end | Benchmark | P1 |
| Reminder dispatch (1000 users) | All sent within 60s window | BullMQ benchmark | P0 |
| Infographic generation | < 3s per image | Benchmark | P2 |
| TTS generation | < 2s per clip | Benchmark | P2 |
| Concurrent webhooks (50/s) | No dropped messages | k6 stress test | P1 |
| Memory usage (idle server) | < 256MB RSS | Process monitoring | P2 |

---

## 5. Security Tests

| Test | Method | Expected | Priority |
|------|--------|----------|----------|
| Webhook signature verification | Send unsigned POST to /webhook | 403 rejected | P0 |
| Webhook replay attack | Replay valid webhook with old timestamp | Rejected (timestamp check) | P0 |
| Phone number spoofing | Manually craft webhook with different `from` | Processed normally (Meta validates sender) | P1 |
| SQL injection in user input | Send `'; DROP TABLE users; --` as text message | Parameterized, no effect | P0 |
| Prescription data at rest | Verify medicines table encrypted or access-controlled | RLS: user sees only own medicines | P0 |
| Admin API without auth | GET /api/admin/users without token | 401 | P0 |
| Rate limit on message processing | 100 messages from same user in 1 min | Throttled, respond "Please wait" | P1 |
| PII in logs | Check server logs for phone numbers/names | Masked or absent | P1 |

---

## 6. Test Matrix Summary

| Area | What | How | Expected | Priority |
|------|------|-----|----------|----------|
| Webhook | Signature validation | API test | 403 on invalid | P0 |
| Webhook | Message dedup | API test | Idempotent | P0 |
| OCR | Prescription extraction | Unit test + GPT-4o | Correct medicines list | P0 |
| OCR | Blurry image handling | Unit test | Graceful error message | P0 |
| Reminders | Schedule creation | Integration test | BullMQ job at correct time | P0 |
| Reminders | Missed escalation | Integration test | Caretaker notified after 2 misses | P0 |
| Reminders | 1000-user dispatch | Perf test | All within 60s | P0 |
| WhatsApp | Send text/image/voice/buttons | Integration test | Meta API returns message_id | P0 |
| WhatsApp | Rate limit handling | Integration test | Queue + retry, no duplicates | P0 |
| User | Registration | Integration test | User + profile created | P0 |
| Security | Webhook spoofing | API test | Rejected | P0 |
| Security | Data isolation | DB test | User sees only own data | P0 |
| E2E | Onboarding flow | Simulated WhatsApp flow | Photo → OCR → schedule → confirm | P0 |
| E2E | Reminder + ack | Simulated flow | Reminder → button → logged | P0 |
| E2E | Missed reminder | Simulated flow | Escalation to caretaker | P0 |

---

## 7. Coverage Targets

| Type | Minimum | Stretch |
|------|---------|---------|
| Unit tests | 80% line coverage | 90% |
| Integration tests | All webhook + API endpoints | + external service mocks |
| E2E tests | Onboarding + reminder + missed flows | + edge cases |
| Security tests | All P0 items | All P0 + P1 |

**Test Framework:** Vitest (unit + integration) + custom WhatsApp flow simulator (E2E)
**External Mocks:** MSW (Mock Service Worker) for Meta API, OpenAI, Google TTS
**CI:** GitHub Actions — run unit+integration on every PR, E2E nightly
