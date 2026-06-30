# MyD1 V1 Workflow Audit

Date: 2026-06-30

Objective: authenticated app pages must use real saved/imported data, show clean empty states, disable clearly gated work, or perform the real action. Demo/seed data must not appear automatically in real user flows.

## Routes Audited

- `/`
- `/get-started`
- `/sign-in`
- `/search`
- `/profile`
- `/film`
- `/highlights`
- `/performance`
- `/trust`
- `/recruiting`
- `/opportunities`
- `/outreach`
- `/messages`
- `/calendar`
- `/coach`
- `/recruiter`
- `/media`
- `/media/library`
- `/media/upload`
- `/media/submissions`
- `/admin`
- `/admin/import-school`
- `/admin/public-data`
- `/admin/operator`
- `/admin/rosters`
- `/settings`
- `/directory/[entityType]/[entityId]`
- `/directory/school/[id]`
- `/directory/team/[id]`
- `/directory/organization/[id]`
- `/directory/ranking/[id]`
- `/directory/source/[id]`

## Buttons Checked

- Profile edit, visibility, brand links, supporting document, transcript, profile photo, and hero media actions remain persisted through the current dev data layer.
- Film upload now blocks unsupported files before submit and stores only real accepted upload metadata.
- Highlight upload persists real uploaded highlights; editor/share/export actions remain gated and clearly labeled as intentionally unavailable.
- Recruiting smart filters/save targets remain gated until saved recruiting-board persistence exists.
- Outreach approval/review actions remain gated until approval-gated messaging exists.
- Messages new outbound message remains gated until the D1 inbox backend exists.
- Calendar add event remains gated until saved user calendar state exists.
- Opportunity refresh/action/dismiss remain gated until saved opportunity workflow state exists.
- Admin, roster, import, operator, media partner, search, and directory navigation links route to working pages or empty states.

## Mock Data Removed From Real Flows

- Seed games, films, highlights, college matches, opportunities, timeline events, calendar events, and messages are no longer returned by core real-user service functions.
- Trust Score is now calculated from saved profile, uploaded documents, uploaded film, saved/public stats, and athlete-entered brand links instead of seed trust factors.
- Opportunity Score no longer uses seeded recruiter replies or hard-coded coach opens.
- Command Center no longer shows fake coach-connected, film-fresh, match, message, highlight, event, or mission completion signals.
- Coach, recruiter, admin, messages, recruiting, outreach, opportunities, highlights, and calendar pages now show zero/empty states instead of invented activity.
- `/api/context/[gameId]` no longer returns invented game context.
- Operator/media upload placeholders no longer include sample athlete names.

## Film Upload Behavior

- V1 local film upload limit: 10 MB.
- The client form validates file presence, file type, and size before submit.
- Oversized files show an inline error and never hit the Server Action body parser.
- The Server Action repeats validation and redirects to a visible failure state if bypassed.
- Accepted uploads are saved under `web/public/uploads` with metadata in `data/user-state/uploads.json`.
- No fake game-library rows are created. The film library reflects accepted uploads only.
- Large-object storage/chunked upload remains a backend dependency for full-game production uploads.

## Intentionally Disabled Or Gated

- Media processing, highlight generation, highlight editor, export, and share workflows.
- D1 inbox outbound sending and approval-gated outreach delivery.
- Calendar event creation.
- Saved recruiting filters, target saving, and recruiter board persistence.
- Opportunity dismissal/action persistence.
- Livestream ingestion and stream health.
- Team trust distribution until a real team roster is connected.
- Moderation/dispute streams until corresponding backend queues exist.

## Remaining Backend Dependencies

- Production object storage or chunked upload service for large film.
- Async media processing and highlight generation worker.
- D1 inbox persistence and notification delivery.
- Recruiting board persistence and match-engine generated targets.
- Calendar persistence.
- Coach affiliation/team roster connection flow.
- Admin moderation/dispute queues.
- Public game-context storage for `/api/context/[gameId]`.

## Recommended Next Work

- Add object-storage upload handshake and resumable uploads.
- Connect film processing statuses to a real worker queue.
- Persist messages/calendar/recruiting/opportunity user state through the database layer.
- Add automated route smoke tests for empty accounts and imported-data accounts.
