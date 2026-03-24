'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Network, Activity, Pause, AlertTriangle, RefreshCw } from 'lucide-react';
import { ConnectionSankey } from '../components/connection-sankey';
import { ConnectionHealthAlerts } from '../components/connection-health-alerts';
import * as healthApi from '../lib/api';
import { ConnectionOverview, ConnectionTopology, ConnectionHealthData } from '../lib/api';

export function ConnectionsPage() {
  const [overview, setOverview] = useState<ConnectionOverview | null>(null);
  const [topology, setTopology] = useState<ConnectionTopology[]>([]);
  const [health, setHealth] = useState<ConnectionHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [overviewData, topologyData, healthData] = await Promise.all([
        healthApi.getOverview(),
        healthApi.getConnectionTopology(),
        healthApi.getConnectionHealth(),
      ]);
      setOverview(overviewData.connections);
      setTopology(topologyData);
      setHealth(healthData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connection data');
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  if (isLoading) return <div>Loading connections...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <PageHeader
        title="Connection Visualizer"
        description="Visualize service connections, health, and lock contention"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Health', href: '/health' },
          { label: 'Connections' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Stat Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Connections"
            value={`${overview.total} / ${overview.max_connections}`}
            icon={Network}
          />
          <StatCard label="Active" value={overview.active} icon={Activity} />
          <StatCard label="Idle" value={overview.idle} icon={Pause} />
          <StatCard
            label="Idle in Transaction"
            value={overview.idle_in_transaction}
            icon={AlertTriangle}
            className={overview.idle_in_transaction > 0 ? 'border-red-500/50' : ''}
          />
        </div>
      )}

      {/* Sankey Flow Diagram */}
      <div className="mb-6">
        <ConnectionSankey topology={topology} maxConnections={overview?.max_connections ?? 100} />
      </div>

      {/* Health Alerts */}
      {health && <ConnectionHealthAlerts health={health} />}
    </div>
  );
}
