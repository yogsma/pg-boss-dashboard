import { LineChart } from 'lucide-react';
import { UIModuleManifest } from '../registry';

export const timeseriesUIModule: UIModuleManifest = {
  id: 'timeseries',
  name: 'Time Series',
  icon: LineChart,
  basePath: '/timeseries',
  navItems: [
    { label: 'Explorer', href: '/timeseries', icon: LineChart },
  ],
};
