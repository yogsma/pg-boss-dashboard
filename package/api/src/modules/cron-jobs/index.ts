import { ModuleManifest } from '../registry';
import { cronJobsRouter } from './routes';
import { CronJobsService } from './service';

const cronJobsService = new CronJobsService();

export const cronJobsModule: ModuleManifest = {
  id: 'cron-jobs',
  name: 'Cron Jobs',
  description: 'Manage pg_cron scheduled jobs and view execution history',
  routePrefix: 'cron',
  router: cronJobsRouter,
  healthCheck: async () => {
    const available = await cronJobsService.checkPgCronAvailable();
    return {
      available,
      reason: available ? undefined : 'pg_cron extension is not installed',
    };
  },
};
