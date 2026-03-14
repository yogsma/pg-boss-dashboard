import { z } from 'zod';

export const CronJobSchema = z.object({
  jobid: z.number(),
  jobname: z.string().nullable(),
  schedule: z.string(),
  command: z.string(),
  nodename: z.string(),
  nodeport: z.number(),
  database: z.string(),
  username: z.string(),
  active: z.boolean(),
  success_count: z.number(),
  failure_count: z.number(),
  last_run: z.string().nullable(),
});

export const CronRunDetailSchema = z.object({
  runid: z.number(),
  jobid: z.number(),
  job_pid: z.number().nullable(),
  status: z.string(),
  return_message: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

export type CronJob = z.infer<typeof CronJobSchema>;
export type CronRunDetail = z.infer<typeof CronRunDetailSchema>;
