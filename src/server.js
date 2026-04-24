const { createApp } = require('./app');
const { config } = require('./config');
const { query } = require('./db/mysql');

async function bootstrap() {
  await query('SELECT 1 AS ok');

  const app = createApp();
  app.listen(config.server.port, config.server.host, () => {
    console.log(`[server] listening on http://${config.server.host}:${config.server.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[server] failed to start', error);
  process.exit(1);
});
