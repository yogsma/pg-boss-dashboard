import { Router } from 'express';

export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  routePrefix: string;
  router: Router;
  healthCheck?: () => Promise<{ available: boolean; reason?: string }>;
}
