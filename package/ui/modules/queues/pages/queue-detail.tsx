'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Job } from '@/lib/api-client';
import { JobsTable } from '../components/jobs-table';
import { PageHeader } from '@/components/page-header';
import * as queuesApi from '../lib/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;

export function QueueDetailPage() {
  const params = useParams();
  const queueName = params.queueName as string;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await queuesApi.getAllJobs(queueName, page, PAGE_SIZE);
        setJobs(data.jobs);
        setTotalJobs(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    },
    [queueName]
  );

  const handleJobsChange = useCallback(() => {
    fetchJobs(currentPage).catch(console.error);
  }, [fetchJobs, currentPage]);

  useEffect(() => {
    handleJobsChange();
  }, [handleJobsChange]);

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title={`${decodeURIComponent(queueName)} Jobs`}
        description={`${totalJobs} total jobs`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Queues', href: '/queues' },
          { label: decodeURIComponent(queueName) },
        ]}
      />

      <div className="rounded-md border">
        <JobsTable jobs={jobs} queueName={queueName} onJobsChange={handleJobsChange} />
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
    </div>
  );
}
