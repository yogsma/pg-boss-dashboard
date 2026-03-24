import { apiClient } from '@/lib/api-client';

export interface ConnectionOverview {
  total: number;
  active: number;
  idle: number;
  idle_in_transaction: number;
  max_connections: number;
}

export interface HealthOverview {
  connections: ConnectionOverview;
  cacheHitRatio: number;
  dbSize: { size: string; size_bytes: number };
}

export interface ConnectionDetail {
  pid: number;
  usename: string | null;
  application_name: string | null;
  client_addr: string | null;
  state: string | null;
  query: string | null;
  query_start: string | null;
  backend_start: string | null;
  wait_event_type: string | null;
  wait_event: string | null;
}

export interface TableInfo {
  schemaname: string;
  relname: string;
  total_size: string;
  total_size_bytes: number;
  index_size: string;
  estimated_rows: number;
}

export interface SlowQuery {
  pid: number;
  usename: string | null;
  query: string;
  duration_seconds: number;
  state: string;
  wait_event_type: string | null;
}

export async function getOverview(): Promise<HealthOverview> {
  return apiClient.get<HealthOverview>('/api/modules/health/overview');
}

export async function getConnections(): Promise<ConnectionDetail[]> {
  return apiClient.get<ConnectionDetail[]>('/api/modules/health/connections');
}

export async function getSlowQueries(minDuration = 5): Promise<SlowQuery[]> {
  return apiClient.get<SlowQuery[]>('/api/modules/health/slow-queries', {
    params: { min_duration: minDuration },
  });
}

export async function getTables(): Promise<TableInfo[]> {
  return apiClient.get<TableInfo[]>('/api/modules/health/tables');
}

export interface ConnectionTopology {
  application_name: string | null;
  total: number;
  active: number;
  idle: number;
  idle_in_transaction: number;
}

export interface IdleTransaction {
  pid: number;
  usename: string | null;
  application_name: string | null;
  client_addr: string | null;
  duration_seconds: number;
  query: string | null;
  state: string;
}

export interface BlockedConnection {
  blocked_pid: number;
  blocked_user: string | null;
  blocked_app: string | null;
  blocked_query: string | null;
  waiting_seconds: number;
  blocking_pid: number;
  blocking_user: string | null;
  blocking_app: string | null;
  blocking_query: string | null;
}

export interface ConnectionHealthData {
  idleInTransaction: IdleTransaction[];
  longRunningQueries: SlowQuery[];
  blockedConnections: BlockedConnection[];
}

export async function getConnectionTopology(): Promise<ConnectionTopology[]> {
  return apiClient.get<ConnectionTopology[]>('/api/modules/health/connections/topology');
}

export async function getConnectionHealth(minDuration = 5): Promise<ConnectionHealthData> {
  return apiClient.get<ConnectionHealthData>('/api/modules/health/connections/health', {
    params: { min_duration: minDuration },
  });
}
