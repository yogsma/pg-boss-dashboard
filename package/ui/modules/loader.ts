import { UIModuleManifest } from './registry';
import { queuesUIModule } from './queues';
import { dbHealthUIModule } from './db-health';
import { cronJobsUIModule } from './cron-jobs';
import { timeseriesUIModule } from './timeseries';

export const allUIModules: UIModuleManifest[] = [
  queuesUIModule,
  dbHealthUIModule,
  cronJobsUIModule,
  timeseriesUIModule,
];

export function getUIModules(enabledIds?: string[]): UIModuleManifest[] {
  if (!enabledIds) return allUIModules;
  return allUIModules.filter((m) => enabledIds.includes(m.id));
}
