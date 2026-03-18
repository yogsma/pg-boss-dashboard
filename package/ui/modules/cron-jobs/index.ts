import { Clock, CalendarClock, History } from 'lucide-react';
import { UIModuleManifest } from '../registry';

export const cronJobsUIModule: UIModuleManifest = {
  id: 'cron-jobs',
  name: 'Cron Jobs',
  icon: Clock,
  basePath: '/cron',
  navItems: [
    { label: 'Schedules', href: '/cron', icon: CalendarClock },
    { label: 'History', href: '/cron/history', icon: History },
  ],
};
