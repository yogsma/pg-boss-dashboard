import { ModuleManifest } from '../registry';
import { timeseriesRouter } from './routes';

export const timeseriesModule: ModuleManifest = {
  id: 'timeseries',
  name: 'Time Series',
  description: 'Explore and visualize time-series data from any table',
  routePrefix: 'timeseries',
  router: timeseriesRouter,
};
