import { z } from 'zod';

export const ConnectionOverviewSchema = z.object({
  total: z.number(),
  active: z.number(),
  idle: z.number(),
  max_connections: z.number(),
});

export const ConnectionDetailSchema = z.object({
  pid: z.number(),
  usename: z.string().nullable(),
  application_name: z.string().nullable(),
  client_addr: z.string().nullable(),
  state: z.string().nullable(),
  query: z.string().nullable(),
  query_start: z.string().nullable(),
  backend_start: z.string().nullable(),
  wait_event_type: z.string().nullable(),
  wait_event: z.string().nullable(),
});

export const TableInfoSchema = z.object({
  schemaname: z.string(),
  relname: z.string(),
  total_size: z.string(),
  total_size_bytes: z.number(),
  index_size: z.string(),
  estimated_rows: z.number(),
});

export const IndexInfoSchema = z.object({
  schemaname: z.string(),
  tablename: z.string(),
  indexname: z.string(),
  index_size: z.string(),
  index_size_bytes: z.number(),
  idx_scan: z.number(),
  idx_tup_read: z.number(),
  idx_tup_fetch: z.number(),
});

export const SlowQuerySchema = z.object({
  pid: z.number(),
  usename: z.string().nullable(),
  query: z.string(),
  duration_seconds: z.number(),
  state: z.string(),
  wait_event_type: z.string().nullable(),
});

export type ConnectionOverview = z.infer<typeof ConnectionOverviewSchema>;
export type ConnectionDetail = z.infer<typeof ConnectionDetailSchema>;
export type TableInfo = z.infer<typeof TableInfoSchema>;
export type IndexInfo = z.infer<typeof IndexInfoSchema>;
export type SlowQuery = z.infer<typeof SlowQuerySchema>;
