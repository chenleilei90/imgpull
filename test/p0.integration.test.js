const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const repoRoot = path.resolve(__dirname, '..');
const testDbName = `img_sync_platform_test_${Date.now()}`;
const dbHost = process.env.TEST_DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.TEST_DB_PORT || 3307);
const dbUser = process.env.TEST_DB_USER || 'root';
const dbPassword = process.env.TEST_DB_PASSWORD || 'root123';

let server;
let baseUrl;
let appPool;
let token;
let registryId;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

function workerHeaders(tokenValue = process.env.INTERNAL_WORKER_TOKEN) {
  return {
    'Content-Type': 'application/json',
    'X-Worker-Token': tokenValue
  };
}

async function request(method, url, body, headers = { 'Content-Type': 'application/json' }) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  assert.equal(response.status < 500, true, `${method} ${url} returned ${response.status}`);
  return data;
}

async function prepareDatabase() {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true
  });

  const schemaPath = path.join(repoRoot, 'schema.sql');
  const schema = fs
    .readFileSync(schemaPath, 'utf8')
    .replaceAll('img_sync_platform', testDbName);

  await connection.query(`DROP DATABASE IF EXISTS \`${testDbName}\`;`);
  await connection.query(schema);
  await connection.query(
    `INSERT INTO \`${testDbName}\`.plans (
       code, name, price_month, price_year, daily_sync_limit, monthly_sync_limit,
       max_batch_size, max_concurrent_tasks, max_registry_accounts,
       api_enabled, api_daily_limit, max_image_size_bytes, max_task_duration_seconds,
       log_retention_days, status
     ) VALUES
       ('free', 'free', 10, 100, 10, 100, 10, 2, 3, 0, 0, 2147483648, 600, 7, 'active'),
       ('pro', 'pro', 49, 499, 100, 3000, 50, 5, 10, 1, 1000, 10737418240, 1800, 30, 'active')`
  );

  await connection.end();
}

async function query(sql, params = []) {
  const [rows] = await appPool.query(sql, params);
  return rows;
}

test.before(async () => {
  process.env.DB_HOST = dbHost;
  process.env.DB_PORT = String(dbPort);
  process.env.DB_USER = dbUser;
  process.env.DB_PASSWORD = dbPassword;
  process.env.DB_NAME = testDbName;
  process.env.APP_SECRET = 'integration-test-secret';
  process.env.INTERNAL_WORKER_TOKEN = 'integration-worker-token';
  process.env.EXECUTOR_DRIVER = 'fake';
  process.env.FAKE_EXECUTOR_DELAY_MS = '1';

  await prepareDatabase();

  const { createApp } = require('../src/app');
  ({ pool: appPool } = require('../src/db/mysql'));

  await new Promise((resolve) => {
    server = createApp().listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (appPool) {
    await appPool.end();
  }

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword
  });
  await connection.query(`DROP DATABASE IF EXISTS \`${testDbName}\`;`);
  await connection.end();
});

test('internal worker endpoints require a valid worker token', async () => {
  const missingTokenResponse = await fetch(`${baseUrl}/internal/worker/cycle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node_code: 'itest-node' })
  });
  const missingTokenData = await missingTokenResponse.json();
  assert.equal(missingTokenResponse.status, 401);
  assert.equal(missingTokenData.code, 40190);

  const wrongTokenResponse = await fetch(`${baseUrl}/internal/worker/cycle`, {
    method: 'POST',
    headers: workerHeaders('wrong-token'),
    body: JSON.stringify({ node_code: 'itest-node' })
  });
  const wrongTokenData = await wrongTokenResponse.json();
  assert.equal(wrongTokenResponse.status, 403);
  assert.equal(wrongTokenData.code, 40391);
});

test('P0 auth, registry redaction, fake executor success flow, logs, and my images', async () => {
  const username = `itest_${Date.now()}`;
  const email = `${username}@example.com`;

  const registered = await request('POST', '/api/v1/auth/register', {
    username,
    email,
    password: 'StrongPass123!'
  });
  assert.equal(registered.code, 0);
  assert.ok(registered.data.user_id);

  const loggedIn = await request('POST', '/api/v1/auth/login', {
    account: username,
    password: 'StrongPass123!'
  });
  assert.equal(loggedIn.code, 0);
  assert.ok(loggedIn.data.token);
  token = loggedIn.data.token;

  const registry = await request(
    'POST',
    '/api/v1/registries',
    {
      name: 'Test Harbor',
      registry_type: 'harbor',
      registry_host: 'registry.example.com',
      region: 'cn-test',
      namespace_name: 'demo',
      username: 'robot',
      secret: 'secret-value',
      is_default: true
    },
    authHeaders()
  );
  assert.equal(registry.code, 0);
  registryId = registry.data.id;
  assert.equal(registry.data.secret_encrypted, undefined);
  assert.equal(registry.data.secret, undefined);
  assert.equal(registry.data.token, undefined);
  assert.equal(registry.data.password, undefined);

  const registryList = await request('GET', '/api/v1/registries', null, authHeaders());
  assert.equal(registryList.code, 0);
  assert.equal(registryList.data.length, 1);
  assert.equal(registryList.data[0].secret_encrypted, undefined);

  const secretBeforeRows = await query('SELECT secret_encrypted FROM registry_accounts WHERE id = ?', [registryId]);
  const updatedRegistry = await request(
    'PUT',
    `/api/v1/registries/${registryId}`,
    {
      name: 'Test Harbor Updated',
      registry_type: 'harbor',
      registry_host: 'registry.example.com',
      region: 'cn-test',
      namespace_name: 'demo',
      username: 'robot',
      is_default: true,
      remark: 'updated without secret'
    },
    authHeaders()
  );
  assert.equal(updatedRegistry.code, 0);
  assert.equal(updatedRegistry.data.secret_encrypted, undefined);
  assert.equal(updatedRegistry.data.secret, undefined);
  const secretAfterRows = await query('SELECT secret_encrypted FROM registry_accounts WHERE id = ?', [registryId]);
  assert.equal(secretAfterRows[0].secret_encrypted, secretBeforeRows[0].secret_encrypted);

  const deleteTargetPayload = {
    name: 'Delete Recreate Harbor',
    registry_type: 'harbor',
    registry_host: 'delete-recreate.example.com',
    region: 'cn-test',
    namespace_name: 'demo',
    username: 'robot',
    secret: 'delete-recreate-secret',
    is_default: false
  };
  const deleteTarget = await request('POST', '/api/v1/registries', deleteTargetPayload, authHeaders());
  assert.equal(deleteTarget.code, 0);
  const deleted = await request('DELETE', `/api/v1/registries/${deleteTarget.data.id}`, null, authHeaders());
  assert.equal(deleted.code, 0);
  const recreated = await request('POST', '/api/v1/registries', deleteTargetPayload, authHeaders());
  assert.equal(recreated.code, 0);
  assert.ok(recreated.data.id);
  assert.notEqual(recreated.data.id, deleteTarget.data.id);
  assert.equal(recreated.data.secret_encrypted, undefined);

  const registryTest = await request('POST', `/api/v1/registries/${registryId}/test`, null, authHeaders());
  assert.equal(registryTest.data.status, 'success');
  assert.equal(registryTest.data.code, 'ok');

  const task = await request(
    'POST',
    '/api/v1/sync-tasks',
    {
      registry_account_id: registryId,
      overwrite_on_exists: true,
      images: ['nginx:1.25']
    },
    authHeaders()
  );
  assert.equal(task.code, 0);
  const taskId = task.data.task_id;

  const beforeRun = await request('GET', `/api/v1/sync-tasks/${taskId}`, null, authHeaders());
  assert.equal(beforeRun.data.task.status, 'queued');
  assert.equal(beforeRun.data.items[0].status, 'queued');

  const claimed = await request(
    'POST',
    '/internal/worker/tasks/claim',
    {
      node_code: 'itest-node',
      node_name: 'Integration Test Node',
      region: 'local'
    },
    workerHeaders()
  );
  assert.equal(claimed.data.claimed, true);
  const taskItemId = claimed.data.task_item.id;

  const afterClaim = await request('GET', `/api/v1/sync-tasks/${taskId}`, null, authHeaders());
  assert.equal(afterClaim.data.task.status, 'running');
  assert.equal(afterClaim.data.items[0].status, 'pulling');

  const runResult = await request(
    'POST',
    `/internal/worker/task-items/${taskItemId}/run`,
    {
      node_code: 'itest-node',
      node_name: 'Integration Test Node',
      region: 'local'
    },
    workerHeaders()
  );
  assert.equal(runResult.data.status, 'success');

  const finalDetail = await request('GET', `/api/v1/sync-tasks/${taskId}`, null, authHeaders());
  assert.equal(finalDetail.data.task.status, 'success');
  assert.equal(finalDetail.data.task.success_count, 1);
  assert.equal(finalDetail.data.items[0].status, 'success');

  const logs = await request('GET', `/api/v1/sync-tasks/items/${taskItemId}/logs`, null, authHeaders());
  assert.equal(logs.data.logs.some((row) => row.message.includes('fake pull')), true);
  assert.equal(logs.data.logs.some((row) => row.message.includes('fake push')), true);

  const images = await request('GET', '/api/v1/my-images', null, authHeaders());
  assert.equal(images.data.pagination.total, 1);
  assert.equal(images.data.items[0].target_ref, 'registry.example.com/demo/nginx:1.25');

  const taskRows = await query('SELECT status, success_count, failed_count FROM sync_tasks WHERE id = ?', [taskId]);
  assert.deepEqual(taskRows[0], { status: 'success', success_count: 1, failed_count: 0 });

  const imageRows = await query('SELECT source_ref, target_ref FROM synced_images WHERE task_id = ?', [taskId]);
  assert.equal(imageRows.length, 1);
  assert.equal(imageRows[0].source_ref, 'docker.io/library/nginx:1.25');
});

test('P0 cancel queued task and retry canceled task', async () => {
  const task = await request(
    'POST',
    '/api/v1/sync-tasks',
    {
      registry_account_id: registryId,
      overwrite_on_exists: true,
      images: ['redis:7']
    },
    authHeaders()
  );
  const taskId = task.data.task_id;

  const cancel = await request('POST', `/api/v1/sync-tasks/${taskId}/cancel`, null, authHeaders());
  assert.equal(cancel.code, 0);

  const canceled = await request('GET', `/api/v1/sync-tasks/${taskId}`, null, authHeaders());
  assert.equal(canceled.data.task.status, 'canceled');
  assert.equal(canceled.data.items[0].status, 'canceled');

  const retry = await request('POST', `/api/v1/sync-tasks/${taskId}/retry`, null, authHeaders());
  assert.equal(retry.code, 0);
  assert.equal(retry.data.retried_count, 1);

  const retried = await request('GET', `/api/v1/sync-tasks/${taskId}`, null, authHeaders());
  assert.equal(retried.data.task.status, 'queued');
  assert.equal(retried.data.items[0].status, 'queued');
});
