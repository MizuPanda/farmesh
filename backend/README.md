# Backend

This folder now contains backend-oriented modules used by the Next.js app:

- `src/auth/getUser.ts` auth/profile fetch logic
- `src/agents/coordinationAgent.ts` match coordination agent logic
- `src/agents/normalizationAgent.ts` listing/request normalization agent logic
- `data/` legacy local store snapshots

The current app still executes these modules through `frontend` API routes/components.
