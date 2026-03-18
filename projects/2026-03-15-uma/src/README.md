# 🏥 Uma — Unfailing Medication Assistant

**"You can't always be there. Uma is."**

WhatsApp-native prescription reader + medication reminder for Indian elderly.

---

## What It Does

1. **SCAN** — Parent sends photo of handwritten prescription to Uma's WhatsApp number
2. **READ** — AI (GPT-4o Vision) reads the prescription, validates against Indian drug database
3. **INFOGRAPHIC** — Returns a beautiful Hindi + English infographic with medication schedule
4. **CONFIRM** — User confirms each medication before reminders activate
5. **REMIND** — Sends daily reminders at scheduled times via WhatsApp
6. **TRACK** — User taps YES/NO to confirm they took the medication
7. **ALERT** — If missed, alerts the caretaker (son/daughter) via WhatsApp

## Origin Story

My mother in India sent me her handwritten prescriptions. She couldn't read the doctor's handwriting. Going back to the pharmacy just to ask about dosages was painful. I fed the prescription to ChatGPT, created a Hindi infographic with dosage instructions, and sent it back on WhatsApp. She said it was the most useful thing anyone had done for her health.

That moment — solving my mother's daily struggle with one photo and one AI call — is exactly what Uma productizes for 150 million elderly parents in India.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Fastify |
| Database | PostgreSQL (Supabase) |
| WhatsApp | Meta Cloud API (direct, no BSP) |
| AI Vision | OpenAI GPT-4o |
| Infographic | Satori + @resvg/resvg-js |
| Scheduling | node-cron + PostgreSQL |
| Payments | Razorpay (planned) |
| Voice TTS | Google Cloud TTS (planned) |

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Run database migration
# (apply supabase/migrations/001_initial.sql to your Supabase project)

# Build
npm run build

# Run
npm start

# Test
npm test
```

## Project Structure

```
src/
├── config.ts                    # Environment variables
├── index.ts                     # Fastify server entry point
├── conversation/
│   ├── engine.ts                # State machine engine
│   ├── states.ts                # State definitions + transitions
│   └── handlers/
│       ├── onboarding.ts        # New user onboarding flow
│       ├── prescription.ts      # Prescription scan + confirmation
│       └── reminder.ts          # Reminder response handling
├── services/
│   ├── whatsapp-client.ts       # Meta Cloud API abstraction
│   ├── prescription-reader.ts   # GPT-4o Vision integration
│   ├── drug-validator.ts        # Indian drug DB validation
│   ├── infographic.ts           # Satori-based image generation
│   ├── reminder-scheduler.ts    # Cron-based reminder scheduling
│   ├── adherence.ts             # Tracking + caretaker alerts
│   └── voice.ts                 # TTS stub (planned)
├── db/
│   ├── client.ts                # Supabase client
│   └── queries.ts               # Database queries
├── data/
│   └── indian-drugs.json        # 33 drugs, 9 categories, Hindi names
└── utils/
    ├── hindi.ts                 # Hindi text utilities
    └── phone.ts                 # E.164 phone validation
```

## Pipeline Documentation

Full business analysis and engineering review in `docs/pipeline/`:

| Document | Description |
|---|---|
| [idea-data.md](docs/pipeline/idea-data.md) | Problem statement, market data, competitor analysis |
| [ceo-review.md](docs/pipeline/ceo-review.md) | CEO-level review (3x Ralph Loop) — BUILD decision at 8.2/10 |
| [analysis.md](docs/pipeline/analysis.md) | Business analysis, TAM/SAM/SOM, unit economics |
| [pitch-60s.md](docs/pipeline/pitch-60s.md) | 60-second investor pitch |
| [eng-review.md](docs/pipeline/eng-review.md) | Engineering review (3x Ralph Loop) — architecture, costs, feasibility |

## Pricing

| Tier | Price | Features |
|---|---|---|
| Basic | ₹199/month | Prescription scan + infographic + text reminders |
| Premium | ₹499-799/month | + voice reminders + caretaker photo + adherence alerts |
| NRI Premium | $10-15/month | Premium features + priority support |

## Key Numbers

- **Monthly MVP cost:** ₹5,000-10,000 ($60-$120)
- **Break-even:** 30-50 Basic subscribers
- **Gross margin at 10K users:** 92-94%
- **TAM:** 40-60 million elderly WhatsApp users on chronic medication in India

## License

Private. All rights reserved.
