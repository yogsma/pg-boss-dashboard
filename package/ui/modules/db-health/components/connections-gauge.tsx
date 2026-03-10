'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionOverview } from '../lib/api';

interface ConnectionsGaugeProps {
  connections: ConnectionOverview;
}

export function ConnectionsGauge({ connections }: ConnectionsGaugeProps) {
  const usagePercent = Math.round((connections.total / connections.max_connections) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Connection Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted"
              />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${usagePercent * 3.14} ${314 - usagePercent * 3.14}`}
                className={usagePercent > 80 ? 'text-red-500' : usagePercent > 60 ? 'text-yellow-500' : 'text-green-500'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{usagePercent}%</span>
              <span className="text-xs text-muted-foreground">used</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active</span>
            <span className="font-medium">{connections.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Idle</span>
            <span className="font-medium">{connections.idle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">{connections.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max</span>
            <span className="font-medium">{connections.max_connections}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
