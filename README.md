# StatPulse

StatPulse is a B2B website and API availability monitoring service inspired by UptimeRobot. It is also a pet project focused on backend engineering, databases, asynchronous processing, and production-oriented architecture.

The project is currently in an early MVP stage. The backend can schedule HTTP checks through Redis, a worker executes them, and the results are stored in PostgreSQL.

## Tech Stack

- Node.js and TypeScript
- Next.js and React
- Express
- TimescaleDB/PostgreSQL
- Prisma
- Redis and BullMQ
- Docker Compose
- npm workspaces

TimescaleDB, alert channels, and the monitoring dashboard are planned but are not implemented yet.

## Repository Structure

```text
apps/
  backend-api/   Express API and monitoring scheduler
  frontend/      Next.js frontend
  worker/        BullMQ worker that performs HTTP checks
packages/
  database/      Prisma schema, migrations, and shared database client
  url-safety/    URL normalization and SSRF protection helpers
```

## Backend API Architecture

The API is split into small layers:

```text
src/
  config/             environment configuration
  infrastructure/     external adapters such as BullMQ queues
  modules/            business modules grouped by domain
    auth/
      *.routes.ts       registration, login, and current-user routes
    monitors/
      *.routes.ts       HTTP route definitions
      *.controller.ts   Express request/response mapping
      *.service.ts      business use cases
      *.repository.ts   database access
      *.validation.ts   input normalization and validation
  shared/             reusable HTTP and error helpers
  app.ts              Express app composition
  index.ts            process entrypoint
```

## Prerequisites

Install the following tools:

- Node.js 22
- npm
- Docker with Docker Compose

If you use `nvm`, activate the project version:

```bash
nvm install
nvm use
```

Verify the installed tools:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

The expected local configuration is:

```env
DATABASE_URL=postgresql://statpulse:statpulse_local_password@localhost:5432/statpulse_dev
REDIS_URL=redis://localhost:6379
PORT=3001
REQUEST_TIMEOUT_MS=10000
JWT_SECRET=replace-with-a-long-random-local-secret
```

The API currently reads `PORT` and defaults to port `3001` when it is not set.

Monitor URLs are normalized and checked before being stored. Private, local, link-local, multicast, and reserved network targets are blocked by default. The worker repeats this safety check before each HTTP request and before following redirects.

Monitor results are stored in TimescaleDB as time-series data. The local Docker Compose setup uses a TimescaleDB PostgreSQL image, and migrations enable a hypertable, a 90-day raw result retention policy, and a five-minute continuous aggregate for dashboard metrics.

Start PostgreSQL and Redis with Docker Compose:

```bash
npm run docker:up
```

If an older local PostgreSQL volume was initialized with different credentials, recreate the local Docker volume before running migrations:

```bash
docker compose -f docker-compose.dev.yml down -v
npm run docker:up
```

Check local infrastructure containers:

```bash
npm run docker:ps
```

Generate the Prisma client and apply database migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Running the Applications

Run each application in a separate terminal.

Start the API:

```bash
npm run dev:api
```

Start the monitoring worker:

```bash
npm run dev:worker
```

Start the frontend:

```bash
npm run dev:frontend
```

The applications are available at:

- Frontend: <http://localhost:3000>
- API health endpoint: <http://localhost:3001/health>

## Testing the Monitoring MVP Manually

Register a user:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123"}'
```

Log in and copy the returned token:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123"}'
```

Check the current user:

```bash
curl http://localhost:3001/auth/me \
  -H 'Authorization: Bearer <token>'
```

Create a monitor:

```bash
curl -X POST http://localhost:3001/monitors \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"name":"Example","url":"https://example.com","method":"GET","expectedStatus":200,"intervalSeconds":60,"timeoutMs":10000}'
```

List monitors and their latest result:

```bash
curl http://localhost:3001/monitors \
  -H 'Authorization: Bearer <token>'
```

Read recent results for a monitor:

```bash
curl 'http://localhost:3001/monitors/<monitor-id>/results?limit=20' \
  -H 'Authorization: Bearer <token>'
```

Read recent incidents for a monitor:

```bash
curl 'http://localhost:3001/monitors/<monitor-id>/incidents?limit=20' \
  -H 'Authorization: Bearer <token>'
```

Read graph-ready metrics buckets for a monitor:

```bash
curl 'http://localhost:3001/monitors/<monitor-id>/metrics?from=2026-07-09T00:00:00.000Z&to=2026-07-10T00:00:00.000Z&bucketSeconds=300' \
  -H 'Authorization: Bearer <token>'
```

Pause a monitor:

```bash
curl -X PATCH http://localhost:3001/monitors/<monitor-id> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"isActive":false}'
```

## Development Commands

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

To format the repository:

```bash
npm run format
```

To open Prisma Studio:

```bash
npm run db:studio
```

To stop the local infrastructure:

```bash
npm run docker:down
```

## Current Monitoring Flow

```text
Backend API
  -> manages monitors through HTTP endpoints
  -> creates one BullMQ repeatable job per active monitor
  -> BullMQ worker performs HTTP requests
  -> worker stores results in PostgreSQL
```

## Current Limitations

- Only basic HTTP monitoring is implemented.
- Monitor state and incidents are implemented for UP/DOWN transitions.
- The frontend is still the default Next.js starter page.
- Monitor management requires JWT authentication.
- Alert notifications are not implemented.
- Raw monitor results are retained for 90 days.
- Automated tests are not implemented yet.
- URL checks include SSRF protection, but the service still needs more production hardening before public exposure.

## Development Plan

The local working roadmap lives in `PLAN.MD`.
