import express from 'express';
import cors from 'cors';
import { config } from './config';
import { queueRoutes } from './routes/queue.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', queueRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// Start server
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${config.port}`);
});
