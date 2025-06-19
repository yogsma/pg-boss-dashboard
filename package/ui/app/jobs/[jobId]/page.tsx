'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface Job {
  id: string;
  name: string;
  state: 'created' | 'active' | 'completed' | 'failed';
  data: any;
  createdon: string;
  completedon?: string;
  failedon?: string;
  startedon?: string;
  retrycount: number;
  retrylimit: number;
  retrydelay: number;
  retrybackoff: boolean;
  startafter?: string;
  expirein?: any;
  keepuntil?: string;
  output?: string;
  priority: number;
  archivedon?: string;
}

const stateConfig = {
  created: { color: 'bg-gray-500', icon: Clock, label: 'Created' },
  active: { color: 'bg-yellow-500', icon: Loader, label: 'Active' },
  completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-500', icon: XCircle, label: 'Failed' },
};

// Helper function to safely render any value
const renderValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getJob(jobId);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;
  }

  if (!job) {
    return <div className="container mx-auto p-8">Job not found</div>;
  }

  const StateIcon = stateConfig[job.state].icon;

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Job Details</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Job Status Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <StateIcon className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">{job.id}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={stateConfig[job.state].color}>
                    {stateConfig[job.state].label}
                  </Badge>
                  <span className="text-muted-foreground">Queue: {job.name}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Information for Failed Jobs */}
        {job.state === 'failed' && job.output && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">Job Failed with Error:</div>
                <pre className="text-sm bg-red-50 p-3 rounded border overflow-auto">
                  {renderValue(job.output)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <div className="font-mono text-sm">{job.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Queue Name</label>
                  <div>{job.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div>{renderValue(job.priority)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State</label>
                  <Badge className={stateConfig[job.state].color}>
                    {stateConfig[job.state].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retry Information */}
          <Card>
            <CardHeader>
              <CardTitle>Retry Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Retry Count</label>
                  <div>{renderValue(job.retrycount)} / {renderValue(job.retrylimit)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Retry Delay</label>
                  <div>{renderValue(job.retrydelay)}ms</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Backoff</label>
                  <div>{job.retrybackoff ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div>{job.createdon ? format(new Date(job.createdon), 'PPpp') : '-'}</div>
              </div>
              {job.startedon && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Started</label>
                  <div>{format(new Date(job.startedon), 'PPpp')}</div>
                </div>
              )}
              {job.completedon && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed</label>
                  <div className="text-green-600">{format(new Date(job.completedon), 'PPpp')}</div>
                </div>
              )}
              {job.failedon && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Failed</label>
                  <div className="text-red-600">{format(new Date(job.failedon), 'PPpp')}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Data */}
        <Card>
          <CardHeader>
            <CardTitle>Job Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(job.data, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Additional Configuration */}
        {(job.startafter || job.expirein || job.keepuntil) && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduling & Expiration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {job.startafter && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start After</label>
                    <div>{format(new Date(job.startafter), 'PPpp')}</div>
                  </div>
                )}
                {job.expirein && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expires In</label>
                    <div>{renderValue(job.expirein)}</div>
                  </div>
                )}
                {job.keepuntil && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Keep Until</label>
                    <div>{format(new Date(job.keepuntil), 'PPpp')}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 