'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Job } from '@/lib/api-client';
import { PageHeader } from '@/components/page-header';
import * as queuesApi from '../lib/api';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const stateConfig = {
  created: { color: 'bg-gray-500', icon: Clock, label: 'Created' },
  active: { color: 'bg-yellow-500', icon: Loader, label: 'Active' },
  completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-500', icon: XCircle, label: 'Failed' },
};

const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queuesApi
      .getJob(jobId)
      .then(setJob)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch job details'))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  if (isLoading) return <div>Loading job details...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  const StateIcon = stateConfig[job.state].icon;

  return (
    <div>
      <PageHeader
        title="Job Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Queues', href: '/queues' },
          { label: job.name, href: `/queues/${encodeURIComponent(job.name)}` },
          { label: job.id },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Retry Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Retry Count</label>
                  <div>
                    {renderValue(job.retrycount)} / {renderValue(job.retrylimit)}
                  </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Job Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(job.data, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {(job.startafter || !!job.expirein || job.keepuntil) && (
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
                {!!job.expirein && (
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
