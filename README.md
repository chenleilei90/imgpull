# ImgPull Backend MVP

ImgPull Backend MVP is the P0 backend for syncing public Docker Hub images into a user's own domestic registry.

The current backend focuses on the core chain:

```text
register/login -> bind registry -> test registry -> create sync task -> worker claim
-> pull -> tag -> login -> push -> write status/logs -> query task/images
```

## Runtime Requirements

- Node.js 20 or newer
- MySQL 8 compatible database
- Docker CLI on the worker host when using the real executor

This repository also supports a `fake` executor for integration tests and local API verification when Docker is unavailable.

## Install

```bash
npm install
```

## Database

Create the database and tables:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p < schema.sql
```

Insert a minimum free plan:

```sql
USE img_sync_platform;

INSERT INTO plans (
  code, name, price_month, price_year, daily_sync_limit, monthly_sync_limit,
  max_batch_size, max_concurrent_tasks, max_registry_accounts,
  api_enabled, api_daily_limit, max_image_size_bytes, max_task_duration_seconds,
  log_retention_days, status
) VALUES (
  'free', 'free', 0, 0, 3, 100,
  3, 1, 1, 0, 0, 2147483648, 600, 7, 'active'
) ON DUPLICATE KEY UPDATE name = VALUES(name);
```

## Configuration

Copy the example configuration:

```bash
cp config/app.config.example.json config/app.config.json
```

Windows PowerShell:

```powershell
Copy-Item config/app.config.example.json config/app.config.json
```

Main environment variables:

```text
PORT=3001
HOST=127.0.0.1
APP_SECRET=replace-with-a-long-random-secret
TOKEN_EXPIRES_IN_HOURS=72
INTERNAL_WORKER_TOKEN=replace-with-a-long-random-worker-token

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=img_sync_platform

EXECUTOR_ENABLED=true
EXECUTOR_DRIVER=docker
DOCKER_BINARY=docker
FAKE_EXECUTOR_DELAY_MS=50
PULL_TIMEOUT_MS=1800000
PUSH_TIMEOUT_MS=1800000
```

Environment variables override `config/app.config.json`.

## Executor Modes

Real Docker executor:

```bash
EXECUTOR_DRIVER=docker npm start
```

PowerShell:

```powershell
$env:EXECUTOR_DRIVER="docker"
npm start
```

The real executor runs:

```text
docker pull
docker tag
docker login
docker push
docker logout
```

Fake executor:

```bash
EXECUTOR_DRIVER=fake npm start
```

PowerShell:

```powershell
$env:EXECUTOR_DRIVER="fake"
npm start
```

The fake executor does not call Docker. It is used for integration tests and local success-path verification.

## Start

```bash
npm start
```

Expected log:

```text
[server] listening on http://127.0.0.1:3001
```

Health check:

```bash
curl http://127.0.0.1:3001/health
```

## Test

The integration tests create an isolated test database and run the fake executor success path.

```bash
npm test
```

Test database environment variables:

```text
TEST_DB_HOST=127.0.0.1
TEST_DB_PORT=3306
TEST_DB_USER=root
TEST_DB_PASSWORD=root
```

## P0 API Surface

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/me`
- `GET /api/v1/registries`
- `POST /api/v1/registries`
- `PUT /api/v1/registries/:id`
- `DELETE /api/v1/registries/:id`
- `POST /api/v1/registries/:id/test`
- `POST /api/v1/registries/:id/set-default`
- `POST /api/v1/sync-tasks`
- `GET /api/v1/sync-tasks`
- `GET /api/v1/sync-tasks/:id`
- `POST /api/v1/sync-tasks/:id/cancel`
- `POST /api/v1/sync-tasks/:id/retry`
- `GET /api/v1/sync-tasks/items/:id/logs`
- `GET /api/v1/my-images`
- `GET /api/v1/my-images/:id`
- `POST /api/v1/my-images/:id/resync`
- `POST /internal/worker/tasks/claim`
- `POST /internal/worker/task-items/:id/run`
- `POST /internal/worker/cycle`

All `/internal/worker/*` requests must include `X-Worker-Token: $INTERNAL_WORKER_TOKEN`.

## Current Verification

Current automated coverage includes:

- Task status transition test
- Fake executor success-path integration test
- Registry response redaction test
- Internal worker token authentication test
- Registry edit-without-secret preservation test
- Registry delete-and-recreate consistency test
- Cancel queued task test
- Retry canceled task test

Real Docker verification requires a host with Docker CLI and a writable target registry. See [docs/real-docker-acceptance.md](docs/real-docker-acceptance.md).
