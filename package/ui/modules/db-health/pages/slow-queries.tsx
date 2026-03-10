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
import * as healthApi from '../lib/api';
import { SlowQuery } from '../lib/api';

export function SlowQueriesPage() {
  const [queries, setQueries] = useState<SlowQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPid, setExpandedPid] = useState<number | null>(null);

  useEffect(() => {
    healthApi
      .getSlowQueries(5)
      .then(setQueries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch slow queries'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading slow queries...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <PageHeader
        title="Slow Queries"
        description="Queries running longer than 5 seconds"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Health', href: '/health' },
          { label: 'Slow Queries' },
        ]}
      />

      {queries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No slow queries detected. All queries are running within acceptable thresholds.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Query</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((q) => (
                <TableRow
                  key={q.pid}
                  className="cursor-pointer"
                  onClick={() => setExpandedPid(expandedPid === q.pid ? null : q.pid)}
                >
                  <TableCell className="font-mono">{q.pid}</TableCell>
                  <TableCell>{q.usename || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        q.duration_seconds > 60
                          ? 'bg-red-500'
                          : q.duration_seconds > 30
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }
                    >
                      {q.duration_seconds.toFixed(1)}s
                    </Badge>
                  </TableCell>
                  <TableCell>{q.state}</TableCell>
                  <TableCell className={expandedPid === q.pid ? '' : 'max-w-[400px] truncate'}>
                    <pre className="text-xs whitespace-pre-wrap">{q.query}</pre>
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
