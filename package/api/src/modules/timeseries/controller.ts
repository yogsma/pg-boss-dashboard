import { Request, Response } from 'express';
import { TimeseriesService } from './service';
import { TimeseriesQuerySchema } from './types';
import asyncHandler from 'express-async-handler';
import { HttpError } from '../../errors';

const timeseriesService = new TimeseriesService();

export const timeseriesController = {
  getTables: asyncHandler(async (_req: Request, res: Response) => {
    const tables = await timeseriesService.discoverTables();
    res.json(tables);
  }),

  getTableColumns: asyncHandler(async (req: Request, res: Response) => {
    const { schema, table } = req.params;
    const columns = await timeseriesService.getTableColumns(schema, table);
    res.json(columns);
  }),

  query: asyncHandler(async (req: Request, res: Response) => {
    const parsed = TimeseriesQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(`Invalid query: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400);
    }
    const data = await timeseriesService.queryTimeseries(parsed.data);
    res.json(data);
  }),
};
