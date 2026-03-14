'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CronExpressionBadge } from '../components/cron-expression-badge';
import { ActiveToggle } from '../components/active-toggle';
import * as cronApi from '../lib/api';
import { CronJob } from '../lib/api';
import { format } from 'date-fns';

export function CronSchedulesPage() {
  const [schedules, setSchedules] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cronApi
      .getSchedules()
      .then(setSchedules)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch cron schedules'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading cron schedules...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <PageHeader
        title="Cron Schedules"
        description={`${schedules.length} scheduled job${schedules.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cron' }]}
      />

      {schedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No cron jobs found. Create schedules using pg_cron.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((job) => (
                <TableRow key={job.jobid}>
                  <TableCell className="font-mono">{job.jobid}</TableCell>
                  <TableCell>{job.jobname || '-'}</TableCell>
                  <TableCell>
                    <CronExpressionBadge expression={job.schedule} />
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate font-mono text-xs">
                    {job.command}
                  </TableCell>
                  <TableCell>
                    <ActiveToggle jobId={job.jobid} active={job.active} />
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">{job.success_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={job.failure_count > 0 ? 'bg-red-500' : 'bg-gray-500'}>
                      {job.failure_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.last_run ? format(new Date(job.last_run), 'PPp') : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
