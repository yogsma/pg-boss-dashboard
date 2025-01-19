import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import asyncHandler from 'express-async-handler';

const queueService = new QueueService();

export const queueController = {
  getJob: asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = await queueService.getJob(jobId);
    res.json(job);
  }),

  getAllJobs: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await queueService.getAllJobs(queueName, page, pageSize);
    res.json(result);
  }),

  getAllQueues: asyncHandler(async (req: Request, res: Response) => {
    const queues = await queueService.getAllQueues();
    res.json(queues);
  }),

  getQueueDetails: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    const queue = await queueService.getQueueDetails(queueName);
    res.json(queue);
  }),
};
