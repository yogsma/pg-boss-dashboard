import { ModuleManifest } from './registry';
import { queuesModule } from './queues';
import { dbHealthModule } from './db-health';
import { cronJobsModule } from './cron-jobs';
import { timeseriesModule } from './timeseries';

const allModules: ModuleManifest[] = [
  queuesModule,
  dbHealthModule,
  cronJobsModule,
  timeseriesModule,
];

export interface EnabledModule {
  id: string;
  name: string;
  description: string;
  routePrefix: string;
  available: boolean;
  reason?: string;
}

export async function loadModules(): Promise<{
  modules: ModuleManifest[];
  statuses: EnabledModule[];
}> {
  const statuses: EnabledModule[] = [];
  const enabledModules: ModuleManifest[] = [];

  for (const mod of allModules) {
    let available = true;
    let reason: string | undefined;

    if (mod.healthCheck) {
      try {
        const result = await mod.healthCheck();
        available = result.available;
        reason = result.reason;
      } catch (err) {
        available = false;
        reason = err instanceof Error ? err.message : 'Health check failed';
      }
    }

    statuses.push({
      id: mod.id,
      name: mod.name,
      description: mod.description,
      routePrefix: mod.routePrefix,
      available,
      reason,
    });

    if (available) {
      enabledModules.push(mod);
    }
  }

  return { modules: enabledModules, statuses };
}
