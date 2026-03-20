import { ModuleManifest } from '../registry';
import { queuesRouter } from './routes';

export const queuesModule: ModuleManifest = {
  id: 'queues',
  name: 'Job Queues',
  description: 'Monitor and manage pg-boss job queues',
  routePrefix: 'queues',
  router: queuesRouter,
};
