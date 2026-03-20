'use client';

import { useCallback, useEffect, useState } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import * as cronApi from '../lib/api';
import { CronRunDetail } from '../lib/api';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

export function CronHistoryPage() {
  const [history, setHistory] = useState<CronRunDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const data = await cronApi.getHistory(page, PAGE_SIZE);
      setHistory(data.history);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cron history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [fetchHistory, currentPage]);

  if (isLoading) return <div>Loading cron history...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Execution History"
        description={`${total} total executions`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cron', href: '/cron' },
          { label: 'History' },
        ]}
      />

      {history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No execution history found.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((run) => (
                  <TableRow key={run.runid}>
                    <TableCell className="font-mono">{run.runid}</TableCell>
                    <TableCell className="font-mono">{run.jobid}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          run.status === 'succeeded'
                            ? 'bg-green-500'
                            : run.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {run.start_time ? format(new Date(run.start_time), 'PPp') : '-'}
                    </TableCell>
                    <TableCell>
                      {run.end_time ? format(new Date(run.end_time), 'PPp') : '-'}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-xs">
                      {run.return_message || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
