'use client';

import { useEffect, useState } from 'react';
import { QueueStatusCard } from '../components/queue-status-card';
import { apiClient } from '../lib/api-client';

type QueueStats = {
  completed: number;
  failed: number;
  active: number;
};

type Queue = {
  name: string;
  stats: QueueStats;
};

export default function Home() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const data = await apiClient.getAllQueues();
        setQueues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queues');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueues();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Queue Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((queue) => (
          <QueueStatusCard
            key={queue.name}
            queueName={queue.name}
            stats={{
              completed: queue.stats.completed,
              failed: queue.stats.failed,
              inProgress: queue.stats.active, // Map 'active' to 'inProgress'
            }}
          />
        ))}
      </div>
    </main>
  );
}
