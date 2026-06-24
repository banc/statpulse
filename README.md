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
DATABASE_URL=postgresql://postgres:local_password@localhost:5432/statpulse_dev
REDIS_URL=redis://localhost:6379
PORT=3001
```

The API currently reads `PORT` and defaults to port `3001` when it is not set.

Start PostgreSQL and Redis:

```bash
npm run docker:up
```

Check that both containers are running:

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
npm run docker:down
```

## Current Monitoring Flow

```text
Backend API
  -> reads monitors from PostgreSQL
  -> sends monitoring jobs to Redis
  -> BullMQ worker performs HTTP requests
  -> worker stores results in PostgreSQL
```

## Current Limitations

- Only basic HTTP monitoring is implemented.
- The frontend is still the default Next.js starter page.
- Authentication and monitor management endpoints are not implemented.
- Alert notifications are not implemented.
- PostgreSQL is used without TimescaleDB.
- Automated tests are not implemented yet.
- The periodic scheduler still requires further development.

## Planned Development

The next milestones are:

1. Stabilize the local environment and CI pipeline.
2. Implement reliable per-monitor scheduling.
3. Add authentication and monitor CRUD endpoints.
4. Add URL validation and SSRF protection.
5. Introduce TimescaleDB for monitoring metrics.
6. Add incidents and Telegram or email notifications.
7. Build the monitoring dashboard.
8. Add automated tests, observability, and deployment configuration.
