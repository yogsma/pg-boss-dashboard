import axios, { AxiosInstance } from 'axios';

export class APIClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.axiosInstance = axios.create({
      baseURL,
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
          throw new Error(`API call failed: ${error.response.statusText}`);
        }
        throw error;
      }
    );
  }

  async getAllJobs(
    queueName: string,
    page = 1,
    pageSize = 10
  ): Promise<{ jobs: unknown[]; total: number }> {
    const response = await this.axiosInstance.get(`/api/queues/${queueName}/jobs`, {
      params: { page, pageSize },
    });
    return response.data;
  }

  async getAllQueues(): Promise<
    Array<{ name: string; stats: { completed: number; failed: number; active: number } }>
  > {
    const response = await this.axiosInstance.get('/api/queues');
    return response.data;
  }

  async deleteAllJobs(queueName: string): Promise<string> {
    const response = await this.axiosInstance.delete(`/api/queues/${queueName}/jobs`);
    if (response.status === 204) {
      return 'All jobs deleted';
    }
    return 'Failed to delete all jobs';
  }

  async deleteJob(queueName: string, jobId: string): Promise<string> {
    const response = await this.axiosInstance.delete(`/api/queues/${queueName}/jobs/${jobId}`);
    if (response.status === 204) {
      return 'Job deleted';
    }
    return 'Failed to delete job';
  }
}

export const apiClient = new APIClient();
