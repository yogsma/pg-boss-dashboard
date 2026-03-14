import { z } from 'zod';

export const JobSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: z.any(),
  state: z.enum(['created', 'active', 'completed', 'failed']),
  retryLimit: z.number(),
  retryCount: z.number(),
  retryDelay: z.number(),
  retryBackoff: z.boolean(),
  startAfter: z.string().datetime().optional(),
  expireIn: z.string().optional(),
  createdOn: z.string().datetime(),
  completedOn: z.string().datetime().optional(),
  failedOn: z.string().datetime().optional(),
  startedOn: z.string().datetime().optional(),
  output: z.string().optional(),
  priority: z.number().optional(),
  keepUntil: z.string().datetime().optional(),
  archivedOn: z.string().datetime().optional(),
});

export const QueueStatsSchema = z.object({
  completed: z.number(),
  failed: z.number(),
  active: z.number(),
});

export const QueueSchema = z.object({
  name: z.string(),
  stats: QueueStatsSchema,
});

export type Job = z.infer<typeof JobSchema>;
export type QueueStats = z.infer<typeof QueueStatsSchema>;
export type Queue = z.infer<typeof QueueSchema>;
