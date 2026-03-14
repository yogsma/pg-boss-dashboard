'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { ConnectionsGauge } from '../components/connections-gauge';
import { CacheRatioDisplay } from '../components/cache-ratio-display';
import * as healthApi from '../lib/api';
import { HealthOverview } from '../lib/api';
import { Database, Users, HardDrive } from 'lucide-react';

export function HealthOverviewPage() {
  const [overview, setOverview] = useState<HealthOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    healthApi
      .getOverview()
      .then(setOverview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch health data'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading health data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!overview) return null;

  return (
    <div>
      <PageHeader
        title="Database Health"
        description="Monitor your PostgreSQL database performance"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Health' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Database Size"
          value={overview.dbSize.size}
          icon={HardDrive}
        />
        <StatCard
          label="Active Connections"
          value={overview.connections.active}
          icon={Users}
        />
        <StatCard
          label="Total Connections"
          value={`${overview.connections.total} / ${overview.connections.max_connections}`}
          icon={Database}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectionsGauge connections={overview.connections} />
        <CacheRatioDisplay ratio={overview.cacheHitRatio} />
      </div>
    </div>
  );
}
