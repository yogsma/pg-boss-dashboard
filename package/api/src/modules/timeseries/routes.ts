import { Router } from 'express';
import { timeseriesController } from './controller';

const router = Router();

router.get('/tables', timeseriesController.getTables);
router.get('/tables/:schema/:table/columns', timeseriesController.getTableColumns);
router.post('/query', timeseriesController.query);

export { router as timeseriesRouter };
