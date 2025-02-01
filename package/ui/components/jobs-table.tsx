import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  name: string;
  state: 'created' | 'active' | 'completed' | 'failed';
  data: unknown;
  createdon: string;
  completedon?: string;
  failedon?: string;
}

interface JobsTableProps {
  jobs: Job[];
  queueName: string;
  onJobsChange: () => void;
}

const stateColors = {
  created: 'bg-gray-500',
  active: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function JobsTable({ jobs, queueName, onJobsChange }: JobsTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const toast = useToast();

  const handleDeleteJob = async (queueName: string, jobId: string) => {
    try {
      setIsDeleting(true);
      await apiClient.deleteJob(queueName, jobId);
      toast.toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      onJobsChange(); // Refresh jobs list
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllJobs = async (queueName: string) => {
    try {
      setIsDeletingAll(true);
      await apiClient.deleteAllJobs(queueName);
      toast.toast({
        title: 'Success',
        description: 'All jobs deleted successfully',
      });
      onJobsChange(); // Refresh jobs list
    } catch (error) {
      console.error('Error deleting all jobs:', error);
      toast.toast({
        title: 'Error',
        description: 'Failed to delete all jobs',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end pr-4 mt-4">
        <Button 
          variant="destructive" 
          onClick={() => handleDeleteAllJobs(queueName)}
          disabled={isDeletingAll || jobs.length === 0}
          className="w-[160px]" 
        >
          {isDeletingAll ? 'Deleting...' : 'Delete All Jobs'}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Completed/Failed</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-mono">{job.id}</TableCell>
              <TableCell>
                <Badge className={stateColors[job.state]}>{job.state}</Badge>
              </TableCell>
              <TableCell>{job.createdon ? format(new Date(job.createdon), 'PPp') : '-'}</TableCell>
              <TableCell>
                {job.completedon
                  ? format(new Date(job.completedon), 'PPp')
                  : job.failedon
                  ? format(new Date(job.failedon), 'PPp')
                  : '-'}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">{JSON.stringify(job.data)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteJob(queueName, job.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}