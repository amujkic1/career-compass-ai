# Hireloop — Frontend

React + Vite + TanStack Start + shadcn/ui frontend for the Spring Boot career-intelligence API
(resume grading, job scraping, interview question generation).

## Run

```bash
bun install      # or npm install
bun run dev      # starts the dev server
```

## Environment

Set the backend base URL (no trailing slash) in `.env`:

```
VITE_API_BASE_URL=http://localhost:9090
```

Restart the dev server after changing env values. See `.env.example`.

## What's included

- **Public**: landing (`/`), login (`/login`), register (`/register`), unauthorized (`/unauthorized`).
- **Protected** (under `/_authenticated`, guarded by token check):
  - `/dashboard` — stats + quick actions
  - `/scrape` — scrape a job URL, edit, save as target
  - `/targets` — list/edit/delete targets, grade resume, generate interview questions, practice mode
  - `/profile` — account details + resume upload (with progress + public link)
  - `/settings` — subscription, resume link, webhook placeholder

## API client

`src/lib/api-client.ts` is the single wrapper:
- Adds `Authorization: Bearer <accessToken>` when present.
- Handles JSON and multipart (resume upload uses XHR for progress).
- On `401` clears the session and redirects to `/login`.

Endpoint helpers mirror the backend exactly: `/api/auth/*`, `/api/users/resume`,
`/api/ai/scrape`, `/targets`, `/targets/{id}`, `/api/ai/grade/{id}`,
`/api/ai/interview-questions/{id}`.

## Tokens

Access + refresh tokens and basic user info are stored in `localStorage`
(`src/lib/auth-store.ts`) and cleared on logout / 401. For maximum security the
backend can later move these to httpOnly cookies and add a refresh endpoint —
the client is structured so a refresh flow can be added in `api-client.ts`.

## Job targets list

The backend may not expose a GET list endpoint. `useTargets` tries `GET /targets`
(then `/api/targets`) and falls back to a local cache (`src/lib/targets-store.ts`)
that mirrors every create/update/delete so the Targets page always has data.

## Resume link preview

After upload, the backend returns plain text `Resume uploaded successfully! Link: {url}`.
The client parses the URL and shows a clickable "View resume" link.
