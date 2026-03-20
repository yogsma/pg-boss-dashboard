import { Request, Response } from 'express';
import { CronJobsService } from './service';
import asyncHandler from 'express-async-handler';

const MAX_PAGE_SIZE = 100;
const cronJobsService = new CronJobsService();

export const cronJobsController = {
  getSchedules: asyncHandler(async (_req: Request, res: Response) => {
    const schedules = await cronJobsService.getSchedules();
    res.json(schedules);
  }),

  getSchedule: asyncHandler(async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const schedule = await cronJobsService.getSchedule(jobId);
    res.json(schedule);
  }),

  toggleActive: asyncHandler(async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const { active } = req.body;
    const result = await cronJobsService.toggleActive(jobId, active);
    res.json(result);
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const result = await cronJobsService.getHistory(page, pageSize);
    res.json(result);
  }),

  getJobHistory: asyncHandler(async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const result = await cronJobsService.getJobHistory(jobId, page, pageSize);
    res.json(result);
  }),
};
