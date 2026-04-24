const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'config', 'app.config.json');
const examplePath = path.join(process.cwd(), 'config', 'app.config.example.json');

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildDefaultConfig() {
  const example = readJsonFile(examplePath) || {};

  return {
    server: {
      port: Number(process.env.PORT || example.server?.port || 3001),
      host: process.env.HOST || example.server?.host || '0.0.0.0'
    },
    security: {
      appSecret: process.env.APP_SECRET || example.security?.appSecret || 'change-this-secret',
      tokenExpiresInHours: Number(process.env.TOKEN_EXPIRES_IN_HOURS || example.security?.tokenExpiresInHours || 72),
      internalWorkerToken:
        process.env.INTERNAL_WORKER_TOKEN ||
        example.security?.internalWorkerToken ||
        'change-this-worker-token'
    },
    database: {
      host: process.env.DB_HOST || example.database?.host || '127.0.0.1',
      port: Number(process.env.DB_PORT || example.database?.port || 3306),
      user: process.env.DB_USER || example.database?.user || 'root',
      password: process.env.DB_PASSWORD || example.database?.password || '',
      database: process.env.DB_NAME || example.database?.database || 'img_sync_platform',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || example.database?.connectionLimit || 10),
      queueLimit: Number(process.env.DB_QUEUE_LIMIT || example.database?.queueLimit || 0)
    },
    executor: {
      enabled: String(process.env.EXECUTOR_ENABLED || example.executor?.enabled || 'true') === 'true',
      driver: process.env.EXECUTOR_DRIVER || example.executor?.driver || 'docker',
      dockerBinary: process.env.DOCKER_BINARY || example.executor?.dockerBinary || 'docker',
      fakeDelayMs: Number(process.env.FAKE_EXECUTOR_DELAY_MS || example.executor?.fakeDelayMs || 50),
      pullTimeoutMs: Number(process.env.PULL_TIMEOUT_MS || example.executor?.pullTimeoutMs || 1800000),
      pushTimeoutMs: Number(process.env.PUSH_TIMEOUT_MS || example.executor?.pushTimeoutMs || 1800000)
    }
  };
}

function applyEnvOverrides(config) {
  return {
    ...config,
    server: {
      ...config.server,
      port: Number(process.env.PORT || config.server.port),
      host: process.env.HOST || config.server.host
    },
    security: {
      ...config.security,
      appSecret: process.env.APP_SECRET || config.security.appSecret,
      tokenExpiresInHours: Number(process.env.TOKEN_EXPIRES_IN_HOURS || config.security.tokenExpiresInHours),
      internalWorkerToken: process.env.INTERNAL_WORKER_TOKEN || config.security.internalWorkerToken
    },
    database: {
      ...config.database,
      host: process.env.DB_HOST || config.database.host,
      port: Number(process.env.DB_PORT || config.database.port),
      user: process.env.DB_USER || config.database.user,
      password: process.env.DB_PASSWORD || config.database.password,
      database: process.env.DB_NAME || config.database.database,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || config.database.connectionLimit),
      queueLimit: Number(process.env.DB_QUEUE_LIMIT || config.database.queueLimit)
    },
    executor: {
      ...config.executor,
      enabled: String(process.env.EXECUTOR_ENABLED || config.executor.enabled || 'true') === 'true',
      driver: process.env.EXECUTOR_DRIVER || config.executor.driver,
      dockerBinary: process.env.DOCKER_BINARY || config.executor.dockerBinary,
      fakeDelayMs: Number(process.env.FAKE_EXECUTOR_DELAY_MS || config.executor.fakeDelayMs),
      pullTimeoutMs: Number(process.env.PULL_TIMEOUT_MS || config.executor.pullTimeoutMs),
      pushTimeoutMs: Number(process.env.PUSH_TIMEOUT_MS || config.executor.pushTimeoutMs)
    }
  };
}

const fileConfig = readJsonFile(configPath) || {};
const defaults = buildDefaultConfig();
const mergedConfig = {
  ...defaults,
  ...fileConfig,
  server: {
    ...defaults.server,
    ...(fileConfig.server || {})
  },
  security: {
    ...defaults.security,
    ...(fileConfig.security || {})
  },
  database: {
    ...defaults.database,
    ...(fileConfig.database || {})
  },
  executor: {
    ...defaults.executor,
    ...(fileConfig.executor || {})
  }
};

const config = applyEnvOverrides(mergedConfig);

module.exports = {
  config,
  configPath
};
