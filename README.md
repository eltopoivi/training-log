# Tracker — Personal Training MVP

Monorepo (Next.js 14 PWA + NestJS/Fastify + Prisma/Postgres + Redis + MinIO) that ingests
activities from Strava (Coros → Strava → this app) and renders map, HR/power/altitude
charts, and laps. Single seed user. Foundation for future wellness / nutrition / coach IA.

## Requirements

- Node.js 20+
- pnpm 9+
- Docker (Compose v2)

## Setup

```bash
cp .env.example .env
# Generate 32-byte encryption key:
openssl rand -hex 32
# paste into ENCRYPTION_KEY in .env

pnpm install
pnpm infra:up                 # postgres + redis + minio + bucket init
pnpm db:migrate               # creates schema (migration: init_mvp)
pnpm db:seed                  # creates seed user from SEED_USER_EMAIL/NAME
pnpm dev                      # starts web :3000 and api :3001 in parallel
```

### Strava app

Create an app at <https://www.strava.com/settings/api>:

- **Authorization Callback Domain**: `localhost`
- Copy **Client ID** and **Client Secret** into `.env` as `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET`.
- Pick a random string for `STRAVA_VERIFY_TOKEN` (any opaque value).

Then from the running web app:

1. Open <http://localhost:3000/settings>.
2. Click **Conectar Strava** → complete OAuth → return with toast "Strava conectada".
3. Click **Sincronizar últimas 30** → BullMQ jobs pull activities, streams, and laps.
4. Browse them at <http://localhost:3000/activities>.

### Optional: Strava webhooks

Webhooks require a publicly reachable callback URL. Use a tunnel:

```bash
# in a separate terminal
ngrok http 3001
# or
cloudflared tunnel --url http://localhost:3001
```

Put the public URL (with `/api/integrations/strava/webhook` appended) into
`.env` as `STRAVA_WEBHOOK_CALLBACK_URL`, then register once:

```bash
pnpm tsx scripts/strava-webhook-register.ts
```

Strava will hit `GET /api/integrations/strava/webhook` to verify (validated against
`STRAVA_VERIFY_TOKEN`) and subsequent `POST`s will enqueue sync jobs.

## URLs

- Web: <http://localhost:3000>
- API: <http://localhost:3001/api>
- Health: <http://localhost:3001/api/health>
- MinIO console: <http://localhost:9001> (admin `minioadmin` / `minioadmin`)
- Prisma Studio: `pnpm db:studio`

## Scripts

| command             | description                                      |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | turbo — web (3000) + api (3001) in parallel      |
| `pnpm build`        | turbo build of all packages                      |
| `pnpm lint`         | turbo lint                                       |
| `pnpm typecheck`    | turbo typecheck                                  |
| `pnpm infra:up`     | docker compose up postgres/redis/minio           |
| `pnpm infra:down`   | stop services                                    |
| `pnpm infra:reset`  | stop and **delete** all volumes                  |
| `pnpm db:migrate`   | Prisma migrate dev (name `init_mvp` on first)    |
| `pnpm db:studio`    | Prisma Studio                                    |
| `pnpm db:seed`      | idempotent seed user                             |

## Layout

```
apps/web                      Next.js 14 App Router + Tailwind + shadcn/ui + Serwist PWA
apps/api                      NestJS + Fastify + BullMQ + Prisma
packages/domain               Sport enum + shared types
packages/db                   Prisma schema, client, seed
packages/integrations/strava  Strava client + mappers
```

## What this MVP does NOT do

Better-Auth, custom TSS/zones/CTL/ATL/TSB, wellness/nutrition/gym/planning/coach logic
(only nav placeholders), Coros API, `.fit` raw storage (Strava does not expose it without
scope `upload` — `Activity.rawFitKey` stays `null`, TODO for post-MVP), tests, dark mode,
i18n, rate limiting / helmet. See the spec for the full non-goal list.

## Notes

- Auth is mocked via an `x-user-id` header middleware that falls back to the seed
  user. See `// TODO` in `apps/api/src/common/auth.middleware.ts`.
- Strava tokens are stored AES-256-GCM encrypted (`ivHex:tagHex:cipherHex`).
- Strava only reliably returns HR / power / calories; TSS & IF are stored `null`.
