# D1 Agent MVP

Every athlete deserves an agent.

This monorepo implements the D1 Agent MVP architecture from `D1_Agent_MVP_Spec (1).md`.
It keeps the Agent, Trust Engine, Public Sports Data Engine, Streaming Engine,
Highlight Engine, Match Engine, and Opportunity Engine as independently
extensible services.

## Apps and Packages

- `web` - Next.js App Router + TypeScript front end and route-handler API surface.
- `pipeline` - FastAPI Python service for public data context, streaming hooks, and AI/video jobs.
- `packages/shared` - Source-of-truth TypeScript/Zod contracts.
- `db` - PostgreSQL migrations matching the MVP schema.

## Production Decisions

- Football is the default MVP sport because the spec recommends it for tractable stat/highlight models.
- Streaming is modeled against managed providers (Mux/Cloudflare Stream) with provider adapters.
- External sends are approval-gated at the agent service boundary.
- Verification and entity resolution are append-only and non-destructive.
- Pipeline jobs expose explicit `failed` states and retry metadata.

## Local Development

```bash
npm install
npm run dev
```

Pipeline:

```bash
cd pipeline
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Database:

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
```

