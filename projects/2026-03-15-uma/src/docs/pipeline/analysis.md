# Business Analysis — Uma

## What Works (with evidence)

### 1. Founder-Market Fit
The idea came from a real, personal experience — not a market report. The founder built a manual version, tested it with a real user (his mother), and received genuine positive feedback. This is the gold standard for product validation.

### 2. WhatsApp as Distribution Channel
India has 535-600 million WhatsApp users (Backlinko, 2024). WhatsApp Business API users in India grew 130%+ since 2021 (TechCrunch, Dec 2025). For elderly Indians, WhatsApp IS the internet. Building on WhatsApp means:
- Zero download friction
- Zero onboarding learning curve
- Natural referral mechanism (forward to a friend)
- The child sets it up once, the parent never thinks about "an app"

### 3. Unit Economics
- Revenue per user: ₹199-799/month
- COGS per user: ₹15-25/month (WhatsApp API + AI + voice)
- **Gross margin: 87-97%**
- Payback period on CAC: Near-zero if viral (parent tells friend at the temple/park)

### 4. Emotional Moat
Attaching the caretaker's photo and voice to medication reminders is a genuine product innovation. It transforms a clinical reminder into an emotional touchpoint. No competitor in the medication adherence space does this. It drives:
- Higher engagement (parent opens message because they see their child's face)
- Lower churn (emotional dependency, not just functional)
- Higher willingness to pay (child feels the service is personal, not generic)

### 5. Timing Convergence
- AI vision for handwriting: mature since GPT-4V (late 2023)
- WhatsApp Business API in India: affordable since per-message billing (July 2025)
- Voice cloning/TTS: accessible and cheap (2024-2025)
- India digital health push: Ayushman Bharat Digital Mission
- Post-COVID remote health management: normalized

---

## What Doesn't Work / Pitfalls (Brutally Honest)

### 1. Prescription Accuracy Risk
AI reading handwritten prescriptions is NOT 100% reliable. Academic benchmarks show 82% on curated datasets (Medyug/MIRAGE paper, Oct 2024). Real-world accuracy will be lower — bad lighting, crumpled paper, mixed Hindi/English, doctor-specific abbreviations. **One wrong dosage could harm a patient.**

Mitigation: Mandatory confirmation step, drug database validation, pharmacist-in-the-loop for edge cases, medical disclaimer.

### 2. WhatsApp Template Approval
Healthcare is a restricted vertical in WhatsApp Business. Template messages need Meta approval. Medication names in templates may trigger reviews. Timeline: days to weeks, unpredictable.

Mitigation: Work with BSP experienced in healthcare, use generic templates ("Time for your morning medication") rather than listing specific drugs in templates. Send drug-specific info as free-form messages within the 24-hour customer service window.

### 3. Subscription Churn in India
Indian consumers are subscription-averse. Even Spotify and Netflix face high churn. ₹199/month competes with mobile recharge, grocery budgets.

Mitigation: Annual plans with discount, guilt-driven retention (child sees adherence drop), family bundle pricing.

### 4. Customer Service at Scale
Elderly users will send random messages, ask health questions, send non-prescription images, call the WhatsApp number. Handling this at scale requires conversational AI or human agents.

Mitigation: Clear conversational guardrails, FAQ auto-responses, Hindi-speaking support for edge cases.

### 5. Regulatory Ambiguity
India's Digital Personal Data Protection Act (DPDPA) classifies health data as sensitive. Prescription images are health records. Data storage, processing, and sharing need compliance.

Mitigation: Data stored in India (Supabase/AWS Mumbai), encrypted at rest, consent-based processing, clear privacy policy.

---

## Market Sizing

### TAM (Total Addressable Market)
- India elderly (60+) on chronic medication using WhatsApp: ~40-60 million
- NRI diaspora with elderly parents: ~15-20 million potential caretaker-buyers
- Internal migrant caretakers: ~30-50 million
- At ₹200-800/month average: **₹10,000-40,000 crore/year ($1.2B-$4.8B)**

### SAM (Serviceable Available Market)
- Urban + semi-urban elderly, Hindi + English speakers, smartphone WhatsApp users
- Caretakers with digital payment capability (UPI/credit card)
- **~15-25 million users**
- At average ₹300/month: **₹5,400-9,000 crore/year ($650M-$1.1B)**

### SOM (Serviceable Obtainable Market — Year 1-2)
- Organic WhatsApp viral growth + targeted Facebook/Instagram ads
- **50,000-200,000 subscribers**
- At average ₹300/month: **₹18-72 crore/year ($2.2M-$8.6M)**

---

## Competitive Landscape Matrix

| Competitor | Channel | Languages | Prescription OCR | Reminders | Emotional Layer | Price | Threat |
|---|---|---|---|---|---|---|---|
| **Uma** | WhatsApp only | Hindi + English (MVP) | AI Vision | Yes + personalized | Caretaker photo/voice | ₹199-799/mo | — |
| Karma Dost | App (Android) | Hindi, English | No (manual entry) | Yes (app-based) | No | Free | LOW |
| MyTherapy | App (iOS/Android) | English only | No | Yes (app-based) | No | Freemium | LOW |
| Medisafe | App (iOS/Android) | English | Photo scan (basic) | Yes (app-based) | Caregiver alerts (basic) | Free/$5 | LOW |
| Practo | App + Web | English, Hindi | No | Doctor appointment only | No | ₹399/mo | LOW |
| 1mg / PharmEasy | App | English, Hindi | No | Refill reminders only | No | ₹199-299/mo | LOW |

**Why all threats are LOW:** Every competitor requires downloading an app. For the target demographic (elderly Indians), this is a dealbreaker. WhatsApp-native is the entire differentiator.

---

## Business Model Evaluation

### Revenue Streams
1. **Subscription (Primary):** ₹199-799/month per subscriber
2. **Pharmacy Referrals (Phase 2):** Commission on medicine orders placed through the service
3. **Insurance Partnerships (Phase 3):** Sell anonymized adherence data to health insurers for premium discounts
4. **Doctor Reports (Phase 3):** Monthly adherence reports for doctors (₹99/patient/month from doctor)

### Pricing Tiers
| Tier | Price | Target | Features |
|---|---|---|---|
| Basic | ₹199/month or ₹1,499/year | Internal migrants | Scan + infographic + text reminders |
| Premium | ₹499/month or ₹3,999/year | Urban India + NRI | + voice reminders + caretaker photo + adherence alerts |
| Family | ₹799/month or ₹5,999/year | NRI | Premium for 2 parents + priority support |

---

## Risks & Moats

### Top 3 Risks
1. **Patient safety from OCR errors** — Mitigation: confirmation flow + drug DB validation + disclaimer
2. **WhatsApp policy/template changes** — Mitigation: diversify to SMS/voice call as fallback
3. **Subscription churn** — Mitigation: annual plans + emotional retention

### Defensibility
1. **Data moat:** Prescription history + adherence patterns for thousands of elderly Indians — no competitor has this
2. **Trust:** First service Mom used and trusted → hard to switch
3. **Emotional switching cost:** The caretaker's voice/photo is embedded in the service — leaving means losing that personal touch
4. **Network effects (weak but real):** Parent tells friends → those friends' children subscribe → community forms
5. **Language + cultural depth:** Understanding Indian prescription formats, medication brands (Indian generics), and cultural communication norms

---

## Go-to-Market Strategy

### Launch Strategy
1. **Founder's network:** Start with personal contacts — family friends, parents of colleagues
2. **NRI WhatsApp groups:** Indian diaspora WhatsApp groups (every NRI is in 10+ family/community groups)
3. **Facebook/Instagram ads:** Target NRI audiences in US/UK/Canada/Gulf with emotional ads ("When was the last time you checked if your parents took their medicines?")
4. **Reddit:** r/india, r/ABCDesis, r/NRI — organic posts about the problem
5. **Partnership with Indian pharmacies:** Small pharmacy chains put a QR code on prescription bags ("Scan for medication reminders")

### First 100 Customers Playbook
1. Founder subscribes own parents + close family (10 users, free)
2. Ask each user to refer 2 friends (20 users, free trial)
3. Post in 5 NRI WhatsApp groups (50 users, free 2-week trial)
4. Convert to paid (target: 30-40% conversion = 25-30 paying users)
5. Facebook ad test with $200 budget (target: 50-70 more paying users)
6. Hit 100 paying subscribers in 30-45 days

---

## Verdict

### Scores (1-10)

| Dimension | Score | Reasoning |
|---|---|---|
| Market Size | 9/10 | 40-60M elderly WhatsApp users on chronic meds. Massive. |
| Timing | 9/10 | AI vision + WhatsApp API + voice cloning converge in 2025-2026 |
| Feasibility | 7/10 | Core flow is buildable. Template approval + accuracy validation add time. |
| Revenue Potential | 8/10 | ₹18-72 crore Year 1-2 at scale. 90%+ margins. |
| MVP Fit | 8/10 | Core flow (scan → infographic → reminders) is one-night buildable |

### Overall: 🟢 GO — Build It

### Key Question Before Committing
**Can we achieve >95% prescription reading accuracy with GPT-4V + drug database validation + user confirmation?** If yes, this is a company. If no, we need a pharmacist-in-the-loop, which changes the cost structure and scaling dynamics.

Test this with 50 real prescriptions from different doctors before launch.
