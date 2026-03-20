import { z } from 'zod';

export const VALID_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const GranularityEnum = z.enum(['minute', 'hour', 'day', 'week', 'month']);

export const TimeseriesQuerySchema = z.object({
  schema: z.string().regex(VALID_NAME_REGEX, 'Invalid schema name'),
  table: z.string().regex(VALID_NAME_REGEX, 'Invalid table name'),
  timestampColumn: z.string().regex(VALID_NAME_REGEX, 'Invalid column name'),
  granularity: GranularityEnum,
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  aggregations: z.array(z.object({
    column: z.string().regex(VALID_NAME_REGEX, 'Invalid column name'),
    function: z.enum(['count', 'sum', 'avg', 'min', 'max']),
    alias: z.string().regex(VALID_NAME_REGEX, 'Invalid alias').optional(),
  })).optional(),
});

export const TimeseriesTableSchema = z.object({
  table_schema: z.string(),
  table_name: z.string(),
  timestamp_column: z.string(),
  estimated_rows: z.number(),
});

export const ColumnInfoSchema = z.object({
  column_name: z.string(),
  data_type: z.string(),
  is_nullable: z.string(),
});

export type TimeseriesQuery = z.infer<typeof TimeseriesQuerySchema>;
export type TimeseriesTable = z.infer<typeof TimeseriesTableSchema>;
export type ColumnInfo = z.infer<typeof ColumnInfoSchema>;
