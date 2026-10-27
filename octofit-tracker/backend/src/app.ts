import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/api.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api', apiRouter);
  app.use((_request, response) => response.status(404).json({ error: 'Not found' }));
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const candidate = error as { status?: unknown; message?: unknown };
    const status = typeof candidate.status === 'number' ? candidate.status : 500;
    const message = typeof candidate.message === 'string' ? candidate.message : 'Internal server error';
    response.status(status).json({ error: message });
  });
  return app;
}
import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/api.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_request, response) => response.json({ ok: true }));
  app.use('/api', apiRouter);
  app.use((error: Error & { status?: number }, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(error.status ?? 500).json({ error: error.message });
  });
  return app;
}
