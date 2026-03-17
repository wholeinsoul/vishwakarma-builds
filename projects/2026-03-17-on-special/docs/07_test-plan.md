# Test Plan — On Special

## Unit Tests

| Module | Function | Input | Expected Output | Priority |
|--------|----------|-------|-----------------|----------|
| `lib/generate` | `buildPrompt` | specials text + bar profile | Platform-specific prompt string | P0 |
| `lib/generate` | `buildPrompt` | empty specials | Throws validation error | P0 |
| `lib/generate` | `buildPrompt` | specials > 2000 chars | Throws validation error | P1 |
| `lib/generate` | `parseAIResponse` | Valid JSON with 3 platforms | Parsed content object | P0 |
| `lib/generate` | `parseAIResponse` | Malformed JSON | Partial parse or error | P0 |
| `lib/generate` | `parseAIResponse` | Missing platform field | Returns available + warning | P1 |
| `lib/rate-limit` | `checkRateLimit` | User under limit | `{ allowed: true }` | P0 |
| `lib/rate-limit` | `checkRateLimit` | User at 50/day | `{ allowed: false, reset_at }` | P0 |
| `lib/stripe` | `createCheckoutSession` | Valid user ID | Stripe session URL | P1 |
| `lib/validators` | `validateSpecialsInput` | Valid text + categories | `{ valid: true }` | P0 |
| `lib/validators` | `validateSpecialsInput` | Empty string | `{ valid: false, error }` | P0 |
| `lib/validators` | `validateBarProfile` | Valid profile data | `{ valid: true }` | P1 |

## Integration Tests

| Endpoint | Method | Test | Expected | Priority |
|----------|--------|------|----------|----------|
| `/api/generate` | POST | Valid request with auth | 200 + 3 platform contents | P0 |
| `/api/generate` | POST | No auth header | 401 | P0 |
| `/api/generate` | POST | Expired subscription | 403 | P0 |
| `/api/generate` | POST | Empty specials_text | 400 | P0 |
| `/api/generate` | POST | Rate limit exceeded | 429 | P1 |
| `/api/bar-profile` | GET | Authenticated user | 200 + profile data | P1 |
| `/api/bar-profile` | PUT | Valid profile update | 200 + updated profile | P1 |
| `/api/bar-profile` | PUT | No auth | 401 | P1 |
| `/api/history` | GET | User with generations | 200 + paginated list | P1 |
| `/api/history` | GET | User with no generations | 200 + empty list | P2 |
| `/api/stripe/webhook` | POST | Valid subscription.created | Update DB, 200 | P0 |
| `/api/stripe/webhook` | POST | Invalid signature | 400 | P0 |

## E2E Tests (User Journeys)

### Happy Path
1. Visit landing page → See hero + CTA
2. Click "Get Started" → Redirect to signup
3. Sign up with email/password → Email confirmation
4. Login → Dashboard
5. Type specials → Click Generate → See 3 content cards
6. Click Copy on Instagram card → Clipboard populated
7. Visit History → See past generation
8. Visit Settings → Update bar name/voice → Save

### Error Paths
1. Login with wrong password → Error message, stay on login
2. Generate without subscription → Paywall CTA shown
3. Generate with empty text → Inline validation error
4. Generate when OpenAI is down → Friendly error, retry button
5. Try to access dashboard without login → Redirect to /auth/login

## Performance Tests

| Metric | Target | Method |
|--------|--------|--------|
| Landing page TTFB | < 200ms | Lighthouse |
| Generate API response | < 5s (AI latency) | curl timing |
| Dashboard initial load | < 2s | Lighthouse |
| History page (100 items) | < 1.5s | Load test |

## Security Tests

| Test | Method | Expected | Priority |
|------|--------|----------|----------|
| SQL injection in specials_text | Inject `'; DROP TABLE` | Parameterized query blocks it | P0 |
| XSS in generated content | Inject `<script>` in specials | Content escaped in render | P0 |
| Auth bypass on /api/generate | Request without token | 401 | P0 |
| CSRF on profile update | Cross-origin PUT | Blocked by SameSite cookies | P1 |
| Rate limit bypass | Rapid requests | 429 after limit | P1 |
| Stripe webhook spoofing | Fake webhook payload | Signature verification fails, 400 | P0 |
| RLS bypass | Direct Supabase query for other user's data | Empty result (RLS blocks) | P0 |

## Test Matrix Summary

| Category | P0 | P1 | P2 | Total |
|----------|----|----|----|----|
| Unit | 6 | 4 | 0 | 10 |
| Integration | 5 | 5 | 1 | 11 |
| E2E | 5 | 3 | 0 | 8 |
| Security | 4 | 2 | 0 | 6 |
| Performance | 2 | 2 | 0 | 4 |
| **Total** | **22** | **16** | **1** | **39** |

## Coverage Targets

| Type | Target |
|------|--------|
| Unit tests | 80% line coverage on lib/ |
| Integration | All P0 endpoints tested |
| E2E | Happy path + 3 error paths |
