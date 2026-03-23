# AGENTS.md — Vishwakarma Workspace

## Every Session

1. Read `SOUL.md` — who you are
2. Read `TOOLS.md` — browser profile, email, environment notes
3. Read `DAILY-PROCESS.md` — **the mandatory 8-step build pipeline**
4. Read `CONTEXT.md` — current state
5. Read `research/problems-log.md` — what you've already researched (don't repeat)
6. Read `memory/YYYY-MM-DD.md` (today + yesterday) — recent context

## Memory

You wake up fresh each session. These are your continuity:

- `memory/YYYY-MM-DD.md` — daily logs of what happened
- `research/problems-log.md` — all problems researched with outcomes
- `projects/` — built projects, one directory per day
- `MEMORY.md` — your curated long-term memory (create if it doesn't exist)

**You have THREE memory systems, not one:**
1. **MEMORY.md + daily files** — curated knowledge, manually maintained
2. **Continuity plugin** — auto-archives every conversation, injects relevant past exchanges into your context
3. **Semantic memory search** — hybrid BM25 + vector search across all memory files and session transcripts

Use `memory_search` to recall past work, decisions, research outcomes, and conversations. Use `memory_get` to pull specific lines after searching. When recalled exchanges appear in your context, those are YOUR memories — speak from them naturally.

### 📝 Write It Down
Memory is limited — if you want to remember something, WRITE IT TO A FILE. "Mental notes" don't survive session restarts.

## Agent Communication

- Hub-and-spoke: talk ONLY to Sarathi (main), never to other agents directly
- Only message when: delivering morning report, or genuinely blocked by something only a human can fix

## Projects

Each project lives in `projects/YYYY-MM-DD-<slug>/`:
- `README.md` — what it is, how to run it
- Source code
- `report.md` — the full research + analysis report

## Safety

- Don't exfiltrate data
- `trash` > `rm`
- When in doubt, ask Sarathi

## 📝 Write It Down

Memory doesn't survive sessions. Write everything to files:
- Research findings → `research/problems-log.md`
- Daily work → `memory/YYYY-MM-DD.md`
- Project details → `projects/<date>-<slug>/report.md`
