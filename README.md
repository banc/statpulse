# StatPulse

StatPulse is a B2B website and API availability monitoring service inspired by UptimeRobot. It is also a pet project focused on backend engineering, databases, asynchronous processing, and production-oriented architecture.

The project is currently in an early MVP stage. The backend can schedule HTTP checks through Redis, a worker executes them, and the results are stored in PostgreSQL.

## Tech Stack

- Node.js and TypeScript
- Next.js and React
- Express
- PostgreSQL
- Prisma
- Redis and BullMQ
- Docker Compose
- npm workspaces

TimescaleDB, authentication, alert channels, and the monitoring dashboard are planned but are not implemented yet.

## Repository Structure

```text
apps/
  backend-api/   Express API and monitoring scheduler
  frontend/      Next.js frontend
  worker/        BullMQ worker that performs HTTP checks
packages/
  database/      Prisma schema, migrations, and shared database client
```

## Prerequisites

Install the following tools:

- Node.js 22
- npm
- Apple container on macOS, or Docker with Docker Compose as a fallback

If you use `nvm`, activate the project version:

```bash
nvm install
nvm use
```

Verify the installed tools:

```bash
node --version
npm --version
container --version
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
cp .env.container.example .env.container
```

The expected local configuration is:

```env
DATABASE_URL=postgresql://statpulse:statpulse_local_password@localhost:5432/statpulse_dev
REDIS_URL=redis://localhost:6379
PORT=3001
REQUEST_TIMEOUT_MS=10000
```

The `.env.container` file is used only by Apple container to initialize the local PostgreSQL container:

```env
POSTGRES_USER=statpulse
POSTGRES_PASSWORD=statpulse_local_password
POSTGRES_DB=statpulse_dev
```

The API currently reads `PORT` and defaults to port `3001` when it is not set.

Start PostgreSQL and Redis with Apple container:

```bash
npm run container:system:start
npm run container:up
```

If you previously created the PostgreSQL container with different credentials, recreate the container and its local volume before switching to the new `.env.container` values.

Check that both containers are running:

```bash
npm run container:ps
```

If the containers already exist but are stopped, start them again with:

```bash
npm run container:start
```

Docker Compose is still available as a fallback:

```bash
npm run docker:up
```

Check Docker Compose containers:

```bash
docker compose -f docker-compose.dev.yml ps
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

Create a monitor:

```bash
curl -X POST http://localhost:3001/monitors \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","intervalSeconds":60}'
```

List monitors and their latest result:

```bash
curl http://localhost:3001/monitors
```

Read recent results for a monitor:

```bash
curl 'http://localhost:3001/monitors/<monitor-id>/results?limit=20'
```

Pause a monitor:

```bash
curl -X PATCH http://localhost:3001/monitors/<monitor-id> \
  -H 'Content-Type: application/json' \
  -d '{"isActive":false}'
```

## Development Commands

```bash
npm run lint
npm run typecheck
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
npm run container:down
```

If you use Docker Compose instead, run:

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
- The frontend is still the default Next.js starter page.
- Monitor management currently uses a development-only user instead of authentication.
- Alert notifications are not implemented.
- PostgreSQL is used without TimescaleDB.
- Automated tests are not implemented yet.
- SSRF protection is not implemented yet, so do not expose the API publicly.

## Planned Development

The next milestones are:

1. Stabilize the local environment and CI pipeline.
2. Implement reliable per-monitor scheduling.
3. Add authentication and connect monitors to real users.
4. Add URL validation and SSRF protection.
5. Introduce TimescaleDB for monitoring metrics.
6. Add incidents and Telegram or email notifications.
7. Build the monitoring dashboard.
8. Add automated tests, observability, and deployment configuration.
