# P0 Backend Runbook

## 1. Install dependencies

```bash
npm install
```

## 2. Prepare MySQL

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p < schema.sql
```

Seed the minimum plan:

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

## 3. Configure

```bash
cp config/app.config.example.json config/app.config.json
```

PowerShell:

```powershell
Copy-Item config/app.config.example.json config/app.config.json
```

Edit database connection and `appSecret`.

## 4. Run with fake executor

```bash
EXECUTOR_DRIVER=fake npm start
```

PowerShell:

```powershell
$env:EXECUTOR_DRIVER="fake"
npm start
```

Use this mode to validate API behavior without Docker.

## 5. Run with real Docker executor

```bash
EXECUTOR_DRIVER=docker npm start
```

PowerShell:

```powershell
$env:EXECUTOR_DRIVER="docker"
npm start
```

The machine must have a working Docker CLI and permission to run Docker commands.

## 6. Worker cycle

```bash
curl -X POST http://127.0.0.1:3001/internal/worker/cycle \
  -H "Content-Type: application/json" \
  -H "X-Worker-Token: $INTERNAL_WORKER_TOKEN" \
  -d '{"node_code":"local-node","node_name":"Local Node","region":"local"}'
```

PowerShell:

```powershell
curl.exe -X POST http://127.0.0.1:3001/internal/worker/cycle `
  -H "Content-Type: application/json" `
  -H "X-Worker-Token: $env:INTERNAL_WORKER_TOKEN" `
  -d "{\"node_code\":\"local-node\",\"node_name\":\"Local Node\",\"region\":\"local\"}"
```

## 7. Run tests

```bash
npm test
```

The tests require a reachable MySQL-compatible server. By default they use:

```text
127.0.0.1:3307
root/root123
```

Override with:

```text
TEST_DB_HOST
TEST_DB_PORT
TEST_DB_USER
TEST_DB_PASSWORD
```
