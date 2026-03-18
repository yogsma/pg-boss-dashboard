import { apiClient, Job, Queue } from '@/lib/api-client';

export async function getAllQueues(): Promise<Queue[]> {
  return apiClient.get<Queue[]>('/api/modules/queues/queues');
}

export async function getQueueDetails(queueName: string): Promise<Queue> {
  return apiClient.get<Queue>(`/api/modules/queues/queues/${encodeURIComponent(queueName)}`);
}

export async function getAllJobs(
  queueName: string,
  page = 1,
  pageSize = 10
): Promise<{ jobs: Job[]; total: number }> {
  return apiClient.get<{ jobs: Job[]; total: number }>(
    `/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs`,
    { params: { page, pageSize } }
  );
}

export async function getJob(jobId: string): Promise<Job> {
  return apiClient.get<Job>(`/api/modules/queues/jobs/${jobId}`);
}

export async function deleteJob(queueName: string, jobId: string): Promise<void> {
  await apiClient.delete(`/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs/${jobId}`);
}

export async function deleteAllJobs(queueName: string): Promise<void> {
  await apiClient.delete(`/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs`);
}
