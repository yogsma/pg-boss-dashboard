import { apiClient } from '@/lib/api-client';

export interface TimeseriesTable {
  table_schema: string;
  table_name: string;
  timestamp_column: string;
  estimated_rows: number;
}

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export interface TimeseriesQuery {
  schema: string;
  table: string;
  timestampColumn: string;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  startTime: string;
  endTime: string;
  aggregations?: Array<{
    column: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    alias?: string;
  }>;
}

export async function discoverTables(): Promise<TimeseriesTable[]> {
  return apiClient.get<TimeseriesTable[]>('/api/modules/timeseries/tables');
}

export async function getTableColumns(schema: string, table: string): Promise<ColumnInfo[]> {
  return apiClient.get<ColumnInfo[]>(`/api/modules/timeseries/tables/${schema}/${table}/columns`);
}

export async function queryTimeseries(query: TimeseriesQuery): Promise<Record<string, unknown>[]> {
  return apiClient.post<Record<string, unknown>[]>('/api/modules/timeseries/query', query);
}
