# Nymbl Design Engineer Challenge — Harbor & Pine staffing flow

Surface B: pick an open role, see who could fill it, compare options, assign someone, and see the impact on their load and everyone else's before committing.

## Run it

```
npm install
npm run dev
```

No backend — reads [`staffing-challenge-data/staffing_data.json`](staffing-challenge-data/staffing_data.json) directly (mirrored into `src/data/` for the build; see the AI log for why).

## Deliverables

- **Design concept** — [docs/design-concept.md](docs/design-concept.md): information structure, key states, the path from spotting a problem to acting on it, keyboard operability.
- **Coded prototype** — this app. Core logic in [src/lib/capacity.ts](src/lib/capacity.ts) and [src/lib/matching.ts](src/lib/matching.ts); flow assembled in [src/App.tsx](src/App.tsx).
- **AI process log** — [docs/ai-process-log.md](docs/ai-process-log.md).
- **Problem statement** — [docs/problem-statement.md](docs/problem-statement.md).

## Notable judgment calls

Documented inline where they live in the code (search for comments — they explain *why*, not *what*), and summarized in the design concept doc. The short version: three separate visible facts drive candidate ranking instead of one blended score, Tentative assignments on Proposed projects are tracked but never merged into Confirmed totals, and logged-hours-vs-plan divergence is surfaced inline rather than trusted silently either way.
