import { Activity, BarChart3, Search, Database, Network } from 'lucide-react';
import { UIModuleManifest } from '../registry';

export const dbHealthUIModule: UIModuleManifest = {
  id: 'db-health',
  name: 'Database Health',
  icon: Activity,
  basePath: '/health',
  navItems: [
    { label: 'Overview', href: '/health', icon: Database },
    { label: 'Slow Queries', href: '/health/slow-queries', icon: Search },
    { label: 'Table Sizes', href: '/health/table-sizes', icon: BarChart3 },
    { label: 'Connections', href: '/health/connections', icon: Network },
  ],
};
