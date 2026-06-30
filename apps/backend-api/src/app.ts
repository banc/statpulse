import express from 'express';
import { monitorRouter } from './modules/monitors/monitor.routes';
import { errorHandler } from './shared/http/error-handler';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/monitors', monitorRouter);
  app.use(errorHandler);

  return app;
}
