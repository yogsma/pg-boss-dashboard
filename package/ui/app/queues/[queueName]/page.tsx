'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobsTable } from '@/components/jobs-table';
import { Button } from '@/components/ui/button';
import { apiClient, Job } from '@/lib/api-client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;

export default function QueueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queueName = params.queueName as string;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getAllJobs(queueName, page, PAGE_SIZE);
      setJobs(data.jobs);
      setTotalJobs(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  }, [queueName]);

  const handleJobsChange = useCallback(() => {
    fetchJobs(currentPage).catch((err) => {
      setError(err instanceof Error ? err.message : 'Error refreshing jobs');
    });
  }, [fetchJobs, currentPage]);

  useEffect(() => {
    handleJobsChange();
  }, [handleJobsChange]);

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;
  }

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{decodeURIComponent(queueName)} Jobs</h1>
        <Button variant="outline" onClick={() => router.push('/')} className="w-[160px]">
          Back to Dashboard
        </Button>
      </div>

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
