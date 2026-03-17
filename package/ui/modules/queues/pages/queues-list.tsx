'use client';

import { useEffect, useState } from 'react';
import { Queue } from '@/lib/api-client';
import { QueueStatusCard } from '../components/queue-status-card';
import { PageHeader } from '@/components/page-header';
import * as queuesApi from '../lib/api';

export function QueuesListPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queuesApi
      .getAllQueues()
      .then(setQueues)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch queues'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading queues...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <PageHeader
        title="Job Queues"
        description={`${queues.length} queue${queues.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Queues' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((queue) => (
          <QueueStatusCard
            key={queue.name}
            queueName={queue.name}
            stats={{
              completed: queue.stats.completed,
              failed: queue.stats.failed,
              inProgress: queue.stats.active,
            }}
          />
        ))}
      </div>
    </div>
  );
}
