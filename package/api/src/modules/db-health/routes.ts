import { Router } from 'express';
import { dbHealthController } from './controller';

const router = Router();

router.get('/overview', dbHealthController.getOverview);
router.get('/connections', dbHealthController.getConnections);
router.get('/slow-queries', dbHealthController.getSlowQueries);
router.get('/tables', dbHealthController.getTables);
router.get('/indexes', dbHealthController.getIndexes);
router.get('/indexes/unused', dbHealthController.getUnusedIndexes);
router.get('/connections/topology', dbHealthController.getConnectionTopology);
router.get('/connections/health', dbHealthController.getConnectionHealth);

export { router as dbHealthRouter };
