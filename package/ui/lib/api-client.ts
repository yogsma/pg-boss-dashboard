import axios, { AxiosInstance } from 'axios';

export interface Job {
  id: string;
  name: string;
  state: 'created' | 'active' | 'completed' | 'failed';
  data: unknown;
  createdon: string;
  completedon?: string;
  failedon?: string;
  startedon?: string;
  retrycount: number;
  retrylimit: number;
  retrydelay: number;
  retrybackoff: boolean;
  startafter?: string;
  expirein?: unknown;
  keepuntil?: string;
  output?: string;
  priority: number;
  archivedon?: string;
}

export interface QueueStats {
  completed: number;
  failed: number;
  active: number;
}

export interface Queue {
  name: string;
  stats: QueueStats;
}

export class APIClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const message = error.response.data?.message || error.response.statusText;
          throw new Error(`API call failed: ${message}`);
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        throw new Error('Network error. Please check your connection.');
      }
    );
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.axiosInstance.get(`/api/jobs/${jobId}`);
    return response.data;
  }

  async getAllJobs(
    queueName: string,
    page = 1,
    pageSize = 10
  ): Promise<{ jobs: Job[]; total: number }> {
    const response = await this.axiosInstance.get(
      `/api/queues/${encodeURIComponent(queueName)}/jobs`,
      { params: { page, pageSize } }
    );
    return response.data;
  }

  async getAllQueues(): Promise<Queue[]> {
    const response = await this.axiosInstance.get('/api/queues');
    return response.data;
  }

  async deleteAllJobs(queueName: string): Promise<string> {
    const response = await this.axiosInstance.delete(
      `/api/queues/${encodeURIComponent(queueName)}/jobs`
    );
    if (response.status === 204) {
      return 'All jobs deleted';
    }
    return 'Failed to delete all jobs';
  }

  async deleteJob(queueName: string, jobId: string): Promise<string> {
    const response = await this.axiosInstance.delete(
      `/api/queues/${encodeURIComponent(queueName)}/jobs/${jobId}`
    );
    if (response.status === 204) {
      return 'Job deleted';
    }
    return 'Failed to delete job';
  }
}

export const apiClient = new APIClient();
