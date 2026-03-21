# Test Plan — Partypop MVP
## AI Kids' Party Plan Generator + RSVP Tracker
**Date:** 2026-03-21

---

## Coverage Targets

| Type | Target | Priority |
|------|--------|----------|
| Unit | 70% | P0 core logic, P1 utilities |
| Integration | API routes all covered | P0 |
| E2E | 3 critical user journeys | P0 |
| Performance | < 3s page loads, < 10s plan generation | P1 |
| Security | Auth, injection, rate limits | P0 |

---

## Unit Tests

### 1. Validation (`lib/validation.ts`)
| Test | Input | Expected | Priority |
|------|-------|----------|----------|
| Valid plan input passes | `{child_name: "Jake", child_age: 7, theme: "dinosaurs", headcount: 15, venue_type: "backyard"}` | Pass validation | P0 |
| Missing child_name fails | `{child_age: 7, theme: "dinosaurs", headcount: 15}` | Zod error: child_name required | P0 |
| Age out of range (0) fails | `{child_age: 0, ...rest}` | Zod error: age between 1-18 | P0 |
| Age out of range (19) fails | `{child_age: 19, ...rest}` | Zod error: age between 1-18 | P0 |
| Headcount 0 fails | `{headcount: 0, ...rest}` | Zod error: headcount between 1-100 | P0 |
| Headcount 101 fails | `{headcount: 101, ...rest}` | Zod error: headcount > 100 | P1 |
| Invalid venue_type fails | `{venue_type: "moon", ...rest}` | Zod error: invalid enum | P1 |
| Empty theme fails | `{theme: "", ...rest}` | Zod error: theme required | P0 |
| Valid RSVP input passes | `{guest_name: "Jane", attending: "yes", party_id: "uuid"}` | Pass | P0 |
| RSVP missing guest_name fails | `{attending: "yes"}` | Zod error | P0 |
| RSVP invalid attending value fails | `{guest_name: "Jane", attending: "yolo"}` | Zod error: must be yes/no/maybe/pending | P0 |
| Budget negative fails | `{budget: -100, ...rest}` | Zod error | P1 |

### 2. AI Plan Generation (`lib/openai.ts`)
| Test | Scenario | Expected | Priority |
|------|----------|----------|----------|
| Parse valid AI JSON | Well-formed JSON with all fields | Returns PlanData object | P0 |
| Handle malformed JSON | `{broken json` | Throws ParseError, triggers retry | P0 |
| Handle empty response | `""` | Throws EmptyResponseError | P0 |
| Handle partial JSON | JSON missing `shopping_list` key | Returns plan with empty shopping_list default | P1 |
| Prompt includes theme context | Theme "dinosaurs" | System prompt includes dinosaur-specific context | P1 |
| Prompt includes dietary notes | `dietary_notes: "2 kids nut-free"` | User prompt includes dietary text | P1 |
| Budget scaling | Budget $50 vs $500 | AI prompt adjusts budget context | P2 |

### 3. Slug Generation (`lib/slug.ts`)
| Test | Scenario | Expected | Priority |
|------|----------|----------|----------|
| Generates 8-char slug | Default call | Returns string of length 8 | P1 |
| Slug is URL-safe | Generated slug | Matches /^[a-zA-Z0-9_-]+$/ | P1 |
| Slugs are unique | Generate 1000 slugs | No duplicates | P2 |

### 4. Theme Config (`lib/themes.ts`)
| Test | Scenario | Expected | Priority |
|------|----------|----------|----------|
| All 10 themes have required fields | Iterate themes | Each has slug, name, emoji, prompt_context, color_primary | P1 |
| Theme lookup by slug | `getTheme("dinosaurs")` | Returns dinosaur theme object | P1 |
| Invalid theme slug returns null | `getTheme("nonexistent")` | Returns null/undefined | P1 |

### 5. Rate Limiting (`lib/rate-limit.ts`)
| Test | Scenario | Expected | Priority |
|------|----------|----------|----------|
| Under limit passes | 5 requests from same IP | All pass | P1 |
| Over limit blocks | 11 requests from same IP within 1 hour | 11th returns 429 | P0 |
| Different IPs independent | 10 from IP-A, 10 from IP-B | All pass | P1 |

---

## Integration Tests (API Routes)

### 1. POST `/api/plans/generate`
| Test | Setup | Request | Expected | Priority |
|------|-------|---------|----------|----------|
| Successful plan generation | Auth'd user, valid input | POST with plan data | 200 + PlanData JSON | P0 |
| Unauthenticated | No auth header | POST with plan data | 401 | P0 |
| Invalid input | Auth'd, missing fields | POST with incomplete data | 400 + validation errors | P0 |
| Free plan limit (1st plan) | Auth'd, 0 existing plans | POST | 200 (free plan) | P0 |
| Free plan limit (2nd plan, not paid) | Auth'd, 1 existing plan, no payment | POST | 402 redirect to checkout | P0 |
| Paid user (2nd plan) | Auth'd, is_premium on party | POST | 200 | P1 |
| OpenAI timeout | Mock OpenAI 30s+ | POST | 504 with friendly message | P1 |
| OpenAI rate limit | Mock OpenAI 429 | POST | 503 with retry message | P1 |

### 2. POST `/api/rsvp`
| Test | Setup | Request | Expected | Priority |
|------|-------|---------|----------|----------|
| Valid RSVP submission | Party exists, RSVP enabled | POST guest data | 201 + RSVP created | P0 |
| Party not found | Invalid party_id | POST | 404 | P0 |
| RSVP disabled | Party with rsvp_enabled=false | POST | 404 or 403 | P0 |
| Past RSVP deadline | Party with past rsvp_deadline | POST | 400 "RSVPs closed" | P1 |
| Duplicate email upsert | Same email, same party | POST twice | First 201, second 200 (updated) | P0 |
| Rate limited | 11 POSTs from same IP | 11th POST | 429 | P1 |
| XSS in guest_name | `<script>alert('xss')</script>` | POST | 201 but name is sanitized | P0 |

### 3. POST `/api/checkout`
| Test | Setup | Request | Expected | Priority |
|------|-------|---------|----------|----------|
| Create Stripe session | Auth'd, valid party_id | POST | 200 + checkout URL | P0 |
| Unauthenticated | No auth | POST | 401 | P0 |
| Party not found | Invalid party_id | POST | 404 | P1 |
| Not party owner | Auth'd as different user | POST | 403 | P1 |

### 4. POST `/api/webhooks/stripe`
| Test | Setup | Request | Expected | Priority |
|------|-------|---------|----------|----------|
| Valid webhook | Correct Stripe signature | POST checkout.session.completed | 200, party.is_premium = true | P0 |
| Invalid signature | Wrong/missing signature | POST | 400 | P0 |
| Party not found in metadata | Valid sig, bad party_id | POST | 200 (log warning, don't crash) | P1 |

### 5. GET `/api/themes`
| Test | Setup | Request | Expected | Priority |
|------|-------|---------|----------|----------|
| List all active themes | 10 seeded themes | GET | 200 + array of 10 themes | P1 |
| Inactive themes excluded | 1 theme set inactive | GET | 200 + array of 9 themes | P2 |

---

## E2E Tests (User Journeys)

### Journey 1: First-Time Parent Creates Free Plan (P0)
```
1. Visit / → Landing page loads, hero visible
2. Click "Plan a Party" CTA → Redirect to /login
3. Sign up with email (magic link or test credentials)
4. Redirect to /plan/new → Wizard step 1 visible
5. Fill wizard: theme=dinosaurs, child_name="Jake", age=7, headcount=15, venue=backyard, budget=$200
6. Click "Generate Plan" → Loading state shown
7. Plan generated → Redirect to /plan/[id]
8. Verify plan sections: timeline, activities, food menu, decorations, shopping list
9. Click "Print" → /plan/[id]/print loads with print-friendly layout
10. Click "Share RSVP" → RSVP link generated
```

### Journey 2: Guest Submits RSVP (P0)
```
1. Visit /rsvp/[slug] → RSVP form loads with party details
2. Fill form: name="Jane Smith", attending="yes", num_children=2, dietary_needs="nut allergy"
3. Submit → Redirect to /rsvp/[slug]/confirmed
4. Confirmation page shows "You're in! See you at Jake's Dinosaur Adventure!"
5. Parent visits /plan/[id]/rsvp → Dashboard shows Jane's RSVP
6. RSVP count: 1 attending, 2 children
```

### Journey 3: Returning Parent Creates Premium Plan (P1)
```
1. Log in → /dashboard shows previous party
2. Click "Plan New Party" → /plan/new
3. Fill wizard with new party details
4. Click "Generate" → Paywall shown ("Upgrade to Party Pass — $4.99")
5. Click "Upgrade" → Stripe Checkout loads
6. Complete payment → Redirect back to /plan/[id]?upgraded=true
7. Plan is now generated with premium features
8. Dashboard shows 2 parties
```

---

## Performance Tests

| Test | Target | Method | Priority |
|------|--------|--------|----------|
| Landing page load | < 1.5s (SSG) | Lighthouse / curl timing | P1 |
| Wizard page load | < 2s | Browser timing | P1 |
| Plan generation API | < 10s (AI response) | API timing | P0 |
| RSVP page load | < 1.5s | curl timing | P1 |
| RSVP submission | < 500ms | API timing | P1 |
| Theme gallery load | < 1.5s (SSG) | Lighthouse | P2 |
| 50 concurrent RSVP submissions | All succeed, < 2s each | Load test (k6 or similar) | P2 |

---

## Security Tests

| Test | Vector | Expected | Priority |
|------|--------|----------|----------|
| XSS via RSVP guest_name | `<script>alert(1)</script>` in name field | Escaped in HTML output, no script execution | P0 |
| XSS via RSVP notes | `<img onerror=alert(1) src=x>` in notes | Escaped | P0 |
| SQL injection via RSVP | `'; DROP TABLE rsvps;--` in guest_name | Parameterized query, no injection | P0 |
| Auth bypass on /api/plans/generate | No auth token, valid payload | 401 Unauthorized | P0 |
| Auth bypass on /dashboard | Direct URL without session | Redirect to /login | P0 |
| RSVP slug enumeration | Try sequential slugs | Random nanoid slugs, not enumerable | P1 |
| Stripe webhook forgery | POST without valid signature | 400 rejection | P0 |
| Rate limit bypass | Vary User-Agent, same IP | Still rate-limited (IP-based) | P1 |
| CSRF on RSVP submission | Cross-origin POST | SameSite cookies + origin check | P1 |
| AI prompt injection | `Ignore all instructions` in dietary_notes | Input goes to data field only, AI output unchanged | P1 |

---

## Test Matrix Summary

| Area | P0 | P1 | P2 | Total |
|------|----|----|----|----|
| Unit — Validation | 8 | 3 | 0 | 11 |
| Unit — AI/OpenAI | 3 | 3 | 1 | 7 |
| Unit — Slug/Theme/Rate | 1 | 5 | 2 | 8 |
| Integration — Plan API | 4 | 4 | 0 | 8 |
| Integration — RSVP API | 4 | 2 | 0 | 6 |
| Integration — Checkout | 2 | 2 | 0 | 4 |
| Integration — Webhook | 2 | 1 | 0 | 3 |
| Integration — Themes | 0 | 1 | 1 | 2 |
| E2E — Journeys | 2 | 1 | 0 | 3 |
| Performance | 1 | 4 | 2 | 7 |
| Security | 5 | 4 | 0 | 9 |
| **Total** | **32** | **30** | **6** | **68** |

**P0 tests (32)** must all pass before deploy.
**P1 tests (30)** should pass, document any failures.
**P2 tests (6)** nice-to-have for MVP.

---

## Test Tooling

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit + integration tests (fast, native ESM, TypeScript) |
| **@testing-library/react** | Component rendering tests |
| **MSW (Mock Service Worker)** | Mock OpenAI, Stripe APIs in tests |
| **Playwright** | E2E browser tests (if time permits) |
| **Lighthouse CI** | Performance audits |

### Test Commands
```bash
npm test              # Run all vitest tests
npm run test:unit     # Unit tests only
npm run test:int      # Integration tests only
npm run test:e2e      # Playwright E2E (if configured)
npm run test:coverage # Coverage report
```
