import { apiClient } from '@/lib/api-client';

export interface CronJob {
  jobid: number;
  jobname: string | null;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  success_count: number;
  failure_count: number;
  last_run: string | null;
}

export interface CronRunDetail {
  runid: number;
  jobid: number;
  job_pid: number | null;
  status: string;
  return_message: string | null;
  start_time: string | null;
  end_time: string | null;
}

export async function getSchedules(): Promise<CronJob[]> {
  return apiClient.get<CronJob[]>('/api/modules/cron/schedules');
}

export async function getSchedule(jobId: number): Promise<CronJob> {
  return apiClient.get<CronJob>(`/api/modules/cron/schedules/${jobId}`);
}

export async function toggleActive(jobId: number, active: boolean): Promise<void> {
  await apiClient.patch(`/api/modules/cron/schedules/${jobId}`, { active });
}

export async function getHistory(
  page = 1,
  pageSize = 20
): Promise<{ history: CronRunDetail[]; total: number }> {
  return apiClient.get<{ history: CronRunDetail[]; total: number }>(
    '/api/modules/cron/history',
    { params: { page, pageSize } }
  );
}

export async function getJobHistory(
  jobId: number,
  page = 1,
  pageSize = 20
): Promise<{ history: CronRunDetail[]; total: number }> {
  return apiClient.get<{ history: CronRunDetail[]; total: number }>(
    `/api/modules/cron/schedules/${jobId}/history`,
    { params: { page, pageSize } }
  );
}
