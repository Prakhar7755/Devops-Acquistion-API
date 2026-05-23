# Production API — Docker + Neon Database Setup

## Overview

This project uses **Neon PostgreSQL**, with entirely different database connectors for development and production:

| Environment     | Image                 | Connector                  | Description                    |
| --------------- | --------------------- | -------------------------- | ------------------------------ |
| **Development** | `neon_local` (Docker) | `pg` (PostgreSQL)          | Ephemeral branches per session |
| **Production**  | Neon Cloud (managed)  | `@neondatabase/serverless` | Serverless HTTP driver         |

The app switches drivers automatically based on `NODE_ENV` in `src/config/database.js`.

---

## NPM Script Shortcuts

All Docker commands have npm shortcuts so you never need to type the full `docker compose` invocation:

```bash
# ─── Development ──────────────────────────────────────────

npm run dev                    # run app locally without Docker (nodemon)
npm run docker:dev             # start the full dev stack (app + neon-local)
npm run docker:dev:build       # build dev images then start the dev stack
npm run docker:dev:down        # stop and remove dev containers/network
npm run neon:local             # start a neon-local container locally

# ─── Production ───────────────────────────────────────────

npm run build:prod             # build the production Docker image
npm run docker:prod            # start the app in detached mode (prod)
npm run docker:prod:down       # stop and remove prod containers/network
npm run docker:logs            # tail production app logs
npm run docker:logs:dev        # tail dev stack logs
```

Under the hood, `npm run docker:dev` runs:

```bash
docker compose -f docker-compose.dev.yml --profile dev up
```

and `npm run docker:prod` runs:

```bash
docker compose -f docker-compose.prod.yml --profile prod up -d
```

---

## Prerequisites

- **Docker** & **Docker Compose** ([Docker Desktop](https://www.docker.com/products/docker-desktop/) recommended)
- **Neon account** with a project at [console.neon.tech](https://console.neon.tech)
- Your Neon **API Key** and **Project ID** (for development only — Neon Local needs them to fetch ephemeral branches)

---

## Environment Variables

| Variable           | Dev                           | Prod                    | Description                                    |
| ------------------ | ----------------------------- | ----------------------- | ---------------------------------------------- |
| `NEON_API_KEY`     | Required                      | —                       | Neon API key (console → Settings → API Keys)   |
| `NEON_PROJECT_ID`  | Required                      | —                       | Neon project ID (console → Settings → General) |
| `PARENT_BRANCH_ID` | Optional (defaults to `main`) | —                       | Base branch for ephemeral dev branches         |
| `DELETE_BRANCH`    | Optional (defaults to `true`) | —                       | Delete ephemeral branch when container stops   |
| `DATABASE_URL`     | Auto-set by docker-compose    | **Required (injected)** | Full PostgreSQL connection string              |
| `NODE_ENV`         | `development`                 | `production`            | Selects DB driver and app behaviour            |

> **Note:** `DATABASE_URL` is never hardcoded in source. It is either injected by `docker-compose.dev.yml` or provided as a CI/CD secret.

---

## Quick Reference

### Development — Neon Local

Run the app locally with Neon Local providing an ephemeral database branch:

```bash
# 1. Fill in your credentials in .env.development
#    Set NEON_API_KEY and NEON_PROJECT_ID

# 2. Start the dev stack
npm run docker:dev

# 3. App is available at http://localhost:5000
# Neon Local Postgres: localhost:5432 (user: neon, password: npg)
```

When you stop the stack (`Ctrl+C`) the ephemeral branch is automatically deleted.

```bash
# Stop and clean up
npm run docker:dev:down
```

### Run Drizzle migrations in dev

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

### Production — Neon Cloud (Managed)

Run in production using your live Neon Cloud database:

```bash
# 1. Provide the production DATABASE_URL as an env var
export DATABASE_URL="postgres://user:password@ep-xxxx.region.neon.tech:5432/dbname?sslmode=require"

# 2. Build and start
npm run build:prod
npm run docker:prod
```

Inject `DATABASE_URL` via your CI/CD secret store — never embed it in the image or repo.

---

## File Reference

| File                      | Purpose                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `Dockerfile.dev`          | Dev image — installs all deps incl. `nodemon`; source mounted as volume for HMR       |
| `Dockerfile.prod`         | Prod image — installs production deps only; multi-stage build; non-root user          |
| `docker-compose.dev.yml`  | Orchestrates `app` + `neon-local` services for development                            |
| `docker-compose.prod.yml` | Orchestrates `app` service only (connects to Neon Cloud via `DATABASE_URL`)           |
| `.env.development`        | Dev defaults — `DATABASE_URL` points to `neon-local` on the compose network           |
| `.env.production`         | Prod defaults — `DATABASE_URL` must be injected externally                            |
| `docker-compose.neon.yml` | Dev Neon Local service only — useful for running Postgres without the app             |
| `.dockerignore`           | Excludes `node_modules`, `.env*`, `.neon_local`, etc. from Docker builds              |
| `src/config/database.js`  | Environment-aware DB config — selects `pg` (dev) or `@neondatabase/serverless` (prod) |

---

## Database Config (`src/config/database.js`)

```js
// Production — Neon Cloud via HTTP serverless driver
if (process.env.NODE_ENV === 'production') {
  const { neon } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-http');
  sql = neon(process.env.DATABASE_URL);
  db = drizzle({ client: sql });
}

// Development — PostgreSQL via pg driver (direct TCP to neon-local)
else {
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle({ client: pool });
}
```

---

## Ephemeral Branches (Development)

Set these in `.env.development` or export them before `docker compose up`:

```bash
export NEON_API_KEY="napi_xxxxxxxx"
export NEON_PROJECT_ID="your-project-id"
# Branch "my-feature" is forked from "main" when neon-local starts
export PARENT_BRANCH_ID="main"
# Must be set for the ephemeral branch to auto-delete on stop
export DELETE_BRANCH=true
```

Leave `DELETE_BRANCH` unset or set to `true` for ephemeral (discard-on-stop) branches. Set it to `false` to persist data between container restarts.

---

## Troubleshooting

**`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`**

Docker Desktop is not running on Windows. Open Docker Desktop from the Start Menu / system tray, wait for the whale icon to say "Engine running", then retry:

```bash
npm run docker:dev
```

**`NEON_API_KEY / NEON_PROJECT_ID is not set. Defaulting to a blank string.`**

These variables are read by the **`neon-local`** service (not the `app` service). Make sure they are in `.env.development`. The `docker-compose.dev.yml` uses `env_file: .env.development` to load them — so as long as `dotenv: true` behaviour is active, compose will resolve `${NEON_API_KEY}` from that file:

```bash
# Verify they are set before starting
cat .env.development | Select-String "NEON_"
```

If you see blank values, fill in `NEON_API_KEY` and `NEON_PROJECT_ID` from the Neon console, stop any running containers, and retry:

```bash
npm run docker:dev:down
npm run docker:dev:build
npm run docker:dev
```

**`NEON_API_KEY` also appears in logs / is passed to the `app` container — is that safe?**

No, API keys should not be passed to application containers. To fully isolate credentials, start neon-local as a standalone service with a dedicated Neon env file:

```bash
# 1. Copy only Neon creds into a separate file
echo "NEON_API_KEY=your-key"   > .neon.env
echo "NEON_PROJECT_ID=your-id" >> .neon.env

# 2. Start neon-local from that file
docker compose -f docker-compose.dev.neon.yml --env-file .neon.env up

# 3. In a second terminal, start the app (neon-local is already running)
docker compose -f docker-compose.dev.yml --profile dev up
```

`docker-compose.dev.neon.yml` (not yet created — add it if your team wants this level of secret isolation) would mount only `neon-local` and load exclusively from `.neon.env`. The `app` service in `docker-compose.dev.yml` already embeds `DATABASE_URL` directly and does not need the Neon API key.

**"Connection refused" from the app to neon-local**

- Both services share the default compose network automatically — no extra networking config is needed.
- Verify neon-local has finished starting: `docker compose -f docker-compose.dev.yml logs neon-local`.

**Database migrations fail in dev**

- Neon Local proxies Postgres on port `5432`. Ensure no other Postgres instance is already listening on port `5432` locally (including a host Postgres service).
- For Drizzle, `DATABASE_URL` in `docker-compose.dev.yml` is hardcoded as `postgres://neon:npg@neon-local:5432/neondb?sslmode=require`.

**SSL errors in dev**

- `ssl: { rejectUnauthorized: false }` is set in the `pg` pool config for Neon Local's self-signed certificate. This is intentional and safe for local development only.
