import express from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { monitorRouter } from './modules/monitors/monitor.routes';
import { errorHandler } from './shared/http/error-handler';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/auth', authRouter);
  app.use('/monitors', monitorRouter);
  app.use(errorHandler);

  return app;
}
