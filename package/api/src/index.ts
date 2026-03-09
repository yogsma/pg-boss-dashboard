import express, { NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { queueRoutes } from './routes/queue.routes';
import { pool } from './db';
import { HttpError } from './errors';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);
app.use(express.json());

// Routes
app.use('/api', queueRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: NextFunction) => {
  console.error(err.stack);
  const status = err instanceof HttpError ? err.status : 500;
  res.status(status).json({ message: err.message });
});

// Start server
const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${config.port}`);
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
