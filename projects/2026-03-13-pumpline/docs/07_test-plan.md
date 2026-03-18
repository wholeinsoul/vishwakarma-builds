# Test Plan — PumpLine
**Date:** 2026-03-13 | **Project:** Septic provider directory for rural homeowners

---

## 1. Unit Tests

### 1.1 Services

| Module | Function | Input | Expected Output | Edge Cases | Priority |
|--------|----------|-------|-----------------|------------|----------|
| `ProviderService` | `getProvidersByCounty()` | county_slug | Array of providers with avg_rating, review_count | County with 0 providers, non-existent county, county with 100+ providers (pagination) | P0 |
| `ProviderService` | `getProviderProfile()` | provider_slug | Full provider object with reviews, services, hours | Non-existent provider, provider with 0 reviews, deactivated provider | P0 |
| `ProviderService` | `claimProvider()` | provider_id, email, business_proof | Creates claim request | Already-claimed provider, invalid email, duplicate claim | P1 |
| `ReviewService` | `submitReview()` | provider_id, rating, text, author_name | Creates review (status: pending) | Rating outside 1-5 range, empty text, text >5000 chars, profanity | P0 |
| `ReviewService` | `moderateReview()` | review_id, action (approve/reject), admin_id | Updates review status | Non-existent review, already-moderated review | P1 |
| `ReviewService` | `computeProviderRating()` | provider_id | Returns { avg_rating, review_count } | 0 reviews (null handling), 1 review, rounding precision | P0 |
| `LeadService` | `captureEmail()` | email, county_slug, source | Creates lead record, triggers checklist email | Invalid email, duplicate email, Resend API failure | P1 |
| `SearchService` | `searchProviders()` | query, county_slug? | Ranked provider results | Empty query, special characters, very long query, SQL injection attempt | P0 |
| `CountyService` | `listCounties()` | state_slug? | Array of counties with provider_count | State with 0 counties, all states | P1 |
| `CountyService` | `getCountyBySlug()` | county_slug | County with metadata + SEO fields | Non-existent slug, slug with special chars | P1 |

### 1.2 Components

| Component | Test | Priority |
|-----------|------|----------|
| `ReviewForm` | Renders star rating, text input, author name. Validates required fields. | P0 |
| `ReviewForm` | Prevents submission without rating selected | P0 |
| `ReviewForm` | Shows success message after submission, clears form | P1 |
| `ProviderCard` | Displays name, rating stars, review count, phone, service area | P0 |
| `ProviderCard` | Handles 0 reviews gracefully (shows "No reviews yet") | P1 |
| `CountyList` | Renders alphabetical county list grouped by state | P1 |
| `SearchBar` | Debounces input (300ms), shows loading spinner, displays results | P1 |
| `LeadMagnetForm` | Captures email, shows checklist preview, validates email format | P1 |

### 1.3 Utilities

| Utility | Test | Priority |
|---------|------|----------|
| Slug generation | `"Travis County, TX"` → `"travis-county-tx"` | P1 |
| Rating formatter | 4.666 → "4.7", null → "N/A" | P1 |
| Phone formatter | `"5125551234"` → `"(512) 555-1234"` | P2 |
| SEO meta generator | County/provider data → title, description, structured data (JSON-LD) | P1 |
| Profanity filter | Flags reviews with profanity for manual moderation | P2 |

---

## 2. Integration Tests

### 2.1 API Endpoints

| Endpoint | Method | Test | Expected | Priority |
|----------|--------|------|----------|----------|
| `/api/reviews` | POST | Submit valid review (no auth required) | 201 + review_id, status=pending | P0 |
| `/api/reviews` | POST | Submit with rating=0 or rating=6 | 400 validation error | P0 |
| `/api/reviews` | POST | Submit with XSS in text field | 201 but text is sanitized | P0 |
| `/api/reviews` | POST | Rapid-fire 10 reviews in 60s from same IP | Rate limited after 3 | P1 |
| `/api/leads` | POST | Submit valid email | 201 + triggers email | P1 |
| `/api/leads` | POST | Submit duplicate email | 200 idempotent (no duplicate) | P1 |
| `/api/leads` | POST | Submit invalid email format | 400 validation error | P1 |
| `/api/providers/search` | GET | Search "septic" in Travis County | 200 + ranked results | P1 |
| `/api/providers/search` | GET | Search with empty query | 200 + all providers (default) | P2 |
| `/api/admin/reviews` | GET | List pending reviews (admin) | 200 + pending reviews array | P1 |
| `/api/admin/reviews` | GET | List pending reviews (non-admin) | 403 Forbidden | P0 |
| `/api/admin/reviews/:id` | PATCH | Approve/reject review (admin) | 200 + updated review + recalc rating | P1 |
| `/api/providers/claim` | POST | Submit claim with proof | 201 + claim_request created | P1 |

### 2.2 SSG/ISR Pages

| Page | Test | Priority |
|------|------|----------|
| `/county/[slug]` | Static generation with correct provider list | P0 |
| `/county/[slug]` | ISR revalidation after new review approved | P1 |
| `/provider/[slug]` | Static generation with reviews, contact info, structured data | P0 |
| `/` | Homepage renders with county counts, recent reviews | P1 |
| `/sitemap.xml` | Contains all county + provider URLs | P1 |

### 2.3 Database Operations

| Operation | Test | Priority |
|-----------|------|----------|
| Full-text search on providers | Query "septic pumping" returns relevant results in <50ms | P1 |
| Rating recompute trigger | Approve review → provider avg_rating updates automatically | P0 |
| Index performance | 1000 providers, 10000 reviews → county listing <100ms | P2 |

---

## 3. E2E Tests

### 3.1 Happy Path — Homeowner

1. Google search → land on `/county/travis-county-tx`
2. See list of providers with ratings
3. Click provider → see profile with reviews, phone, services
4. Submit a review (5 stars, "Great service") → see "Pending approval" message
5. Navigate to lead magnet → enter email → receive checklist

### 3.2 Happy Path — Provider Claim

1. Navigate to own provider profile
2. Click "Claim this business"
3. Fill claim form (email, business proof)
4. Receive confirmation email

### 3.3 Happy Path — Admin

1. Login to /admin
2. See pending reviews list
3. Approve a review → see rating update on provider profile
4. Reject a review with reason → review removed from public

### 3.4 Error Paths

| Scenario | Expected | Priority |
|----------|----------|----------|
| Visit non-existent county | 404 page with helpful "Browse all counties" link | P1 |
| Submit review with only stars (no text) | Validation error on text field | P0 |
| Submit review then immediately submit another | Rate limit message | P1 |
| Visit provider with 0 reviews | "Be the first to review" CTA | P1 |

---

## 4. Performance Tests

| Target | Threshold | Method | Priority |
|--------|-----------|--------|----------|
| County page TTFB (SSG) | < 100ms | Lighthouse CI (static page) | P0 |
| Provider page TTFB (SSG) | < 100ms | Lighthouse CI | P0 |
| Review submission response | < 300ms | k6 | P1 |
| Search API (1000 providers) | < 200ms | Benchmark | P1 |
| Lighthouse SEO score | > 95 | Lighthouse CI | P0 |
| Core Web Vitals (LCP) | < 2.5s | Lighthouse CI | P1 |
| Concurrent reviews (20/min) | No 5xx | k6 stress test | P2 |

---

## 5. Security Tests

| Test | Method | Expected | Priority |
|------|--------|----------|----------|
| SQL injection in search | `'; DROP TABLE providers; --` | Parameterized query, no effect | P0 |
| XSS in review text | `<script>alert('xss')</script>` | Escaped in rendering | P0 |
| XSS in author name | `<img onerror=alert(1) src=x>` | Sanitized, no execution | P0 |
| Review spam (rate limit) | 50 POSTs in 60s from same IP | Blocked after 3 per minute | P0 |
| Admin endpoint without auth | GET /api/admin/reviews unauthenticated | 401 | P0 |
| Admin endpoint as regular user | GET /api/admin/reviews with non-admin token | 403 | P0 |
| Path traversal | `/county/../admin` | 404, no admin access | P1 |
| Email injection in lead capture | `attacker@evil.com%0Abcc:victim@gmail.com` | Sanitized, no header injection | P1 |

---

## 6. Test Matrix Summary

| Area | What | How | Expected | Priority |
|------|------|-----|----------|----------|
| SEO | County page rendered as static HTML | Lighthouse CI | Score > 95 | P0 |
| SEO | JSON-LD structured data present | Playwright assertion | Valid LocalBusiness schema | P0 |
| Reviews | Submit valid review | API test | 201, pending status | P0 |
| Reviews | Rating out of range | API test | 400 validation error | P0 |
| Reviews | XSS in text | API + render test | Sanitized output | P0 |
| Reviews | Rate limiting | k6 rapid-fire | Blocked after threshold | P0 |
| Search | Full-text query | API test | Ranked results < 200ms | P1 |
| Admin | Auth gate | API test | 403 for non-admin | P0 |
| Admin | Approve review | API + DB test | Rating recalculated | P1 |
| Leads | Email capture | API test | 201 + email queued | P1 |
| Perf | Static pages | Lighthouse | TTFB < 100ms | P0 |
| E2E | Homeowner journey | Playwright | Browse → review → lead | P0 |
| E2E | Admin moderation | Playwright | Login → approve → verify | P1 |

---

## 7. Coverage Targets

| Type | Minimum | Stretch |
|------|---------|---------|
| Unit tests | 75% line coverage | 90% |
| Integration tests (API) | 100% of endpoints | 100% with error paths |
| E2E tests | Homeowner happy path + 2 error paths | All user flows |
| SEO tests | All page types have structured data | Lighthouse CI in pipeline |

**Test Framework:** Vitest (unit + integration) + Playwright (E2E) + Lighthouse CI (SEO/Perf)
**CI:** GitHub Actions — run on every PR
