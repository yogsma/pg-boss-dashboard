import { Request, Response } from 'express';
import { DbHealthService } from './service';
import asyncHandler from 'express-async-handler';

const dbHealthService = new DbHealthService();

export const dbHealthController = {
  getOverview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await dbHealthService.getOverview();
    res.json(overview);
  }),

  getConnections: asyncHandler(async (_req: Request, res: Response) => {
    const connections = await dbHealthService.getConnections();
    res.json(connections);
  }),

  getSlowQueries: asyncHandler(async (req: Request, res: Response) => {
    const minDuration = parseFloat(req.query.min_duration as string) || 5;
    const queries = await dbHealthService.getSlowQueries(minDuration);
    res.json(queries);
  }),

  getTables: asyncHandler(async (_req: Request, res: Response) => {
    const tables = await dbHealthService.getTables();
    res.json(tables);
  }),

  getIndexes: asyncHandler(async (_req: Request, res: Response) => {
    const indexes = await dbHealthService.getIndexes();
    res.json(indexes);
  }),

  getUnusedIndexes: asyncHandler(async (_req: Request, res: Response) => {
    const indexes = await dbHealthService.getUnusedIndexes();
    res.json(indexes);
  }),
};
