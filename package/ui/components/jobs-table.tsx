import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
}

const stateColors = {
  created: 'bg-gray-500',
  active: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function JobsTable({ jobs }: JobsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Completed/Failed</TableHead>
          <TableHead>Data</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
