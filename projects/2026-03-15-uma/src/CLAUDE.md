# CLAUDE.md — Uma Build Instructions

## What You're Building
Uma (Unfailing Medication Assistant) — a WhatsApp-only service where Indian elderly send prescription photos and receive:
1. AI-read medication infographic in Hindi + English
2. Scheduled medication reminders via WhatsApp
3. Adherence tracking (YES/NO responses)
4. Caretaker alerts on missed doses

## Architecture Reference
Read `ARCHITECTURE.md` for the full engineering review. Follow the **Pass 2/3 simplified architecture**:

## Tech Stack (FINAL — don't deviate)
- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify
- **Database:** PostgreSQL via Supabase (use `@supabase/supabase-js`)
- **Scheduling:** node-cron + PostgreSQL queries (NOT BullMQ/Redis)
- **AI Vision:** OpenAI GPT-4o (`openai` npm package)
- **Infographic:** Satori + @resvg/resvg-js (NOT Puppeteer)
- **Voice TTS:** Google Cloud TTS (gRPC) — placeholder for MVP, can be stubbed
- **WhatsApp:** Meta Cloud API direct (NOT a BSP) — use `axios` for API calls
- **Payments:** Razorpay — placeholder for MVP

## What to Build (Priority Order)

### Must Have (MVP):
1. **WhatsApp webhook server** — receive messages, verify Meta signature, route to handlers
2. **Conversation state machine** — onboarding flow, prescription scan flow, reminder response flow
3. **Prescription reader service** — send image to GPT-4o Vision, parse response, validate against drug DB
4. **Drug database** — seed with top 100 Indian drugs (name, max dose, Hindi name, common dosages)
5. **Infographic generator** — Satori-based, Hindi + English bilingual, medication schedule card
6. **Reminder scheduler** — node-cron checking PostgreSQL every minute, sends due reminders via WhatsApp
7. **Adherence tracker** — log YES/NO responses, alert caretaker after 30 min of no response
8. **WhatsApp client abstraction** — `WhatsAppClient` interface with `MetaCloudClient` implementation

### Nice to Have (if time):
- Caretaker photo attachment on reminders
- Voice message generation (Google TTS → OGG Opus)
- Razorpay payment link generation
- Weekly adherence report to caretaker

## Database
Use the schema from ARCHITECTURE.md (the SQL in the "Database Schema" section). Create a `supabase/migrations/` directory with the migration SQL.

## Key Design Decisions
1. All WhatsApp messages use template messages for business-initiated (reminders) and free-form for responses within 24hr window
2. Prescription confirmation is MANDATORY — never activate reminders without user confirming each medication
3. Drug name validation against local DB — flag unknown drugs and doses outside normal ranges
4. Hindi text uses Noto Sans Devanagari font for infographics
5. Error messages should be bilingual (Hindi + English)
6. Medical disclaimer on every infographic

## File Structure
```
src/
├── package.json
├── tsconfig.json
├── .env.example
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── src/
│   ├── index.ts                 # Fastify server entry point
│   ├── config.ts                # Environment variables
│   ├── webhook/
│   │   └── whatsapp.ts          # WhatsApp webhook handler
│   ├── conversation/
│   │   ├── engine.ts            # State machine engine
│   │   ├── states.ts            # State definitions + transitions
│   │   └── handlers/
│   │       ├── onboarding.ts
│   │       ├── prescription.ts
│   │       └── reminder.ts
│   ├── services/
│   │   ├── whatsapp-client.ts   # WhatsApp API abstraction
│   │   ├── prescription-reader.ts # GPT-4o Vision integration
│   │   ├── drug-validator.ts    # Drug DB lookup + validation
│   │   ├── infographic.ts       # Satori-based image generation
│   │   ├── reminder-scheduler.ts # node-cron + PG scheduler
│   │   ├── adherence.ts         # Tracking + caretaker alerts
│   │   └── voice.ts             # TTS stub
│   ├── db/
│   │   ├── client.ts            # Supabase client
│   │   └── queries.ts           # Database queries
│   ├── data/
│   │   └── indian-drugs.json    # Top 100 Indian drugs seed data
│   └── utils/
│       ├── hindi.ts             # Hindi text utilities
│       └── phone.ts             # E.164 phone validation
├── tests/
│   ├── prescription-reader.test.ts
│   ├── drug-validator.test.ts
│   ├── conversation-engine.test.ts
│   └── infographic.test.ts
└── README.md
```

## Indian Drug Database Seed (top drugs to include)
Include at minimum these categories with 5-10 drugs each:
- Diabetes: Metformin, Glimepiride, Sitagliptin, Voglibose, Gliclazide, Pioglitazone
- Blood Pressure: Amlodipine, Telmisartan, Losartan, Ramipril, Atenolol, Enalapril, Olmesartan
- Cholesterol: Atorvastatin, Rosuvastatin
- Heart: Ecosprin (aspirin), Clopidogrel, Metoprolol
- Thyroid: Levothyroxine (Eltroxin, Thyronorm)
- Acidity: Pantoprazole, Omeprazole, Ranitidine, Rabeprazole
- Pain: Paracetamol, Ibuprofen, Diclofenac
- Antibiotics: Amoxicillin, Azithromycin, Ciprofloxacin, Cefixime
- Vitamins: Calcium + D3, B12, Iron (Ferrous sulfate)
- Common Indian brands: Glycomet (metformin), Telma (telmisartan), Amlong (amlodipine), Ecosprin (aspirin), Crocin (paracetamol), Dolo (paracetamol)

For each drug include: generic_name, brand_names[], dosage_forms[], common_doses[], max_daily_dose, hindi_name, category, food_instructions

## Testing
- Use vitest
- Test prescription reader with mock GPT-4o responses
- Test drug validator with edge cases (unknown drugs, high doses)
- Test conversation engine state transitions
- Test infographic generation (renders without crash)

## Environment Variables (.env.example)
```
WHATSAPP_VERIFY_TOKEN=uma-verify-token-2026
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
GOOGLE_TTS_KEY=your-google-tts-key
PORT=3000
NODE_ENV=development
```

When completely finished, run this command to notify:
openclaw system event --text "Done: Uma MVP build complete — WhatsApp webhook server, prescription reader, infographic generator, reminder scheduler, drug database, conversation FSM, adherence tracker. Ready for code review." --mode now
