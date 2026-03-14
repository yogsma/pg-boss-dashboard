import express, { NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { pool } from './db';
import { HttpError } from './errors';
import { loadModules, EnabledModule } from './modules/loader';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);
app.use(express.json());

let moduleStatuses: EnabledModule[] = [];

async function bootstrap() {
  const { modules, statuses } = await loadModules();
  moduleStatuses = statuses;

  // Mount module routers
  for (const mod of modules) {
    app.use(`/api/modules/${mod.routePrefix}`, mod.router);
    console.log(`Module loaded: ${mod.name} -> /api/modules/${mod.routePrefix}`);
  }

  // Module discovery endpoint
  app.get('/api/modules', (_req, res) => {
    res.json(moduleStatuses);
  });

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, _next: NextFunction) => {
    console.error(err.stack);
    const status = err instanceof HttpError ? err.status : 500;
    res.status(status).json({ message: err.message });
  });

  // Start server
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Modules: ${statuses.filter(s => s.available).map(s => s.name).join(', ')}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
