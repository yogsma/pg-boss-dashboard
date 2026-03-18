import { Router } from 'express';
import { cronJobsController } from './controller';

const router = Router();

router.get('/schedules', cronJobsController.getSchedules);
router.get('/schedules/:jobId', cronJobsController.getSchedule);
router.patch('/schedules/:jobId', cronJobsController.toggleActive);
router.get('/history', cronJobsController.getHistory);
router.get('/schedules/:jobId/history', cronJobsController.getJobHistory);

export { router as cronJobsRouter };
