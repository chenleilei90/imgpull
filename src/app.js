const express = require('express');
const path = require('path');
const { attachRequestContext } = require('./middleware/request-context');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./modules/auth/auth.routes');
const registryRoutes = require('./modules/registries/registry.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const imageRoutes = require('./modules/images/image.routes');
const workerRoutes = require('./modules/worker/worker.routes');
const AuthController = require('./modules/auth/auth.controller');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(attachRequestContext);

  app.get('/health', (req, res) => {
    res.json({
      code: 0,
      message: 'ok',
      data: {
        status: 'ok',
        now: new Date().toISOString()
      }
    });
  });

  app.use('/public', express.static(path.join(process.cwd(), 'public')));

  const page = (fileName) => (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', fileName));
  };

  app.get('/', page('index.html'));
  app.get('/login', page('login.html'));
  app.get('/dashboard', page('dashboard.html'));
  app.get('/registries', page('registries.html'));
  app.get('/sync', page('sync.html'));
  app.get('/tasks', page('tasks.html'));
  app.get('/task-detail', page('task-detail.html'));
  app.get('/images', page('images.html'));

  app.use('/api/v1/auth', authRoutes);
  app.get('/api/v1/me', requireAuth, AuthController.me);
  app.use('/api/v1/registries', registryRoutes);
  app.use('/api/v1/sync-tasks', taskRoutes);
  app.use('/api/v1/my-images', imageRoutes);
  app.use('/internal/worker', workerRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
