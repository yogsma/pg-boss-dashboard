import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface QueueStats {
  completed: number;
  failed: number;
  inProgress: number;
}

interface QueueStatusCardProps {
  queueName: string;
  stats: QueueStats;
}

export function QueueStatusCard({ queueName, stats }: QueueStatusCardProps) {
  const router = useRouter();

  return (
    <Card
      className="w-[300px] hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/queues/${queueName}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{queueName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-500">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
