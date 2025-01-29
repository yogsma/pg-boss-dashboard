import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';

const router = Router();

router.get('/jobs/:jobId', queueController.getJob);
router.get('/queues/:queueName/jobs', queueController.getAllJobs);
router.get('/queues', queueController.getAllQueues);
router.get('/queues/:queueName', queueController.getQueueDetails);
router.delete('/queues/:queueName/jobs/:jobId', queueController.deleteJob);
router.delete('/queues/:queueName/jobs', queueController.deleteAllJobs);

export { router as queueRoutes };
