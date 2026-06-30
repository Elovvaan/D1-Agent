# MyD1 National Public Data Engine

Design authority:

`D:\MYD1-Ranking-Ingestion-Spec`

Every ingestion-related change should read that folder first. The files there define the adapter contract, classification order, MaxPreps ranking parser, normalization, confidence scoring, link discovery, organization model direction, and fixture expectations.

Current integration notes:

- The production command path remains `npm run import:public-deep -- --url "PUBLIC_HUB_URL"`.
- Source registry import remains `npm run import:source-registry`.
- Adapter-backed sources use `adapters/`, `classifiers/`, `normalizers/`, `scorers/`, `discovery/`, `org-resolution/`, and `scheduler/`.
- Non-adapter public school/state/league URLs continue through the existing generic discovery fallback.
- The spec reference implementation uses Cheerio/Vitest. This project currently avoids adding those runtime/test dependencies, so these modules preserve the same architecture and behavior with dependency-free parsing helpers.
- If a future change adds Cheerio/Vitest, reconcile directly against the files in `D:\MYD1-Ranking-Ingestion-Spec\files`.

Conflict policy:

If the spec conflicts with existing production behavior, document the conflict and preserve working production behavior until the migration path is explicit.
