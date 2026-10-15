# Nymbl Design Engineer Challenge: Harbor & Pine staffing flow

Surface B: pick an open role, see who could fill it, compare options, assign someone, and see the impact on their load and everyone else's before committing.

## Run it

```
npm install
npm run dev
```

No backend. Reads [`staffing-challenge-data/staffing_data.json`](staffing-challenge-data/staffing_data.json) directly (mirrored into `src/data/` for the build; see the AI log for why).

## Required deliverables

- **Design concept** [docs/design-concept.md](docs/design-concept.md): information structure, key states, the path from spotting a problem to acting on it, keyboard operability.
- **Coded prototype**: this app. Core logic in [src/lib/capacity.ts](src/lib/capacity.ts) and [src/lib/matching.ts](src/lib/matching.ts), flow assembled in [src/App.tsx](src/App.tsx).
- **AI process log** [docs/ai-process-log.md](docs/ai-process-log.md).
- **Problem statement** [docs/problem-statement.md](docs/problem-statement.md).

## Beyond the required four

- **Competitive analysis** [docs/competitive-analysis.md](docs/competitive-analysis.md): Float, Runn, Resource Guru, Forecast, Kantata, and Productive.io, checked against Harbor & Pine's scale before assuming anything here needed inventing from scratch.
- **Six wireframes** [docs/wireframes/](docs/wireframes/): the three Surface B states plus three flows the coded prototype doesn't cover (the Monday view, a Delivery Manager's request flow, and resolving a Proposed project's win/loss outcome).
- **The same core screens in Figma**, built from real Material 3 Design Kit components, not flat shapes: [figma.com/design/6DSWdNL44aREEIR4J9JV0s](https://www.figma.com/design/6DSWdNL44aREEIR4J9JV0s/dwest?node-id=47-563).
- **An accessibility pass** against the live app: measured contrast ratios, not eyeballed, logged in [docs/ai-process-log.md](docs/ai-process-log.md) and tracked in Linear.

## Tracking

Full breakdown, including what's still open (a GitHub remote, dark mode, a Carbon-vs-Material evaluation), lives in the [Nymbl Design Engineer Challenge](https://linear.app/timewarptrivia/project/nymbl-design-engineer-challenge-cd1872118e5a) Linear project.

## Notable judgment calls

Documented inline where they live in the code (search for comments: they explain *why*, not *what*), and summarized in the design concept doc. The short version: three separate visible facts drive candidate ranking instead of one blended score, Tentative assignments on Proposed projects are tracked but never merged into Confirmed totals, and logged-hours-vs-plan divergence is surfaced inline rather than trusted silently either way.
