import { ModuleManifest } from '../registry';
import { dbHealthRouter } from './routes';

export const dbHealthModule: ModuleManifest = {
  id: 'db-health',
  name: 'Database Health',
  description: 'Monitor PostgreSQL database health, connections, and performance',
  routePrefix: 'health',
  router: dbHealthRouter,
};
