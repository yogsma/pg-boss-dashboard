import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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

export interface ModuleStatus {
  id: string;
  name: string;
  description: string;
  routePrefix: string;
  available: boolean;
  reason?: string;
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

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Legacy methods for backwards compatibility during migration
  async getJob(jobId: string): Promise<Job> {
    return this.get<Job>(`/api/modules/queues/jobs/${jobId}`);
  }

  async getAllJobs(
    queueName: string,
    page = 1,
    pageSize = 10
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.get<{ jobs: Job[]; total: number }>(
      `/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs`,
      { params: { page, pageSize } }
    );
  }

  async getAllQueues(): Promise<Queue[]> {
    return this.get<Queue[]>('/api/modules/queues/queues');
  }

  async deleteAllJobs(queueName: string): Promise<string> {
    const response = await this.axiosInstance.delete(
      `/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs`
    );
    if (response.status === 204) {
      return 'All jobs deleted';
    }
    return 'Failed to delete all jobs';
  }

  async deleteJob(queueName: string, jobId: string): Promise<string> {
    const response = await this.axiosInstance.delete(
      `/api/modules/queues/queues/${encodeURIComponent(queueName)}/jobs/${jobId}`
    );
    if (response.status === 204) {
      return 'Job deleted';
    }
    return 'Failed to delete job';
  }

  async getModules(): Promise<ModuleStatus[]> {
    return this.get<ModuleStatus[]>('/api/modules');
  }
}

export const apiClient = new APIClient();
