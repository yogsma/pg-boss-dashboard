'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimeRangePicker } from '../components/time-range-picker';
import { GranularitySelector } from '../components/granularity-selector';
import * as tsApi from '../lib/api';
import { TimeseriesTable, ColumnInfo } from '../lib/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

type Granularity = 'minute' | 'hour' | 'day' | 'week' | 'month';

export function TimeseriesExplorerPage() {
  const [tables, setTables] = useState<TimeseriesTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [timestampCol, setTimestampCol] = useState<string>('');
  const [rangeHours, setRangeHours] = useState(24);
  const [granularity, setGranularity] = useState<Granularity>('hour');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tsApi
      .discoverTables()
      .then(setTables)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to discover tables'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleTableSelect = useCallback(async (tableKey: string) => {
    setSelectedTable(tableKey);
    setData([]);
    const [schema, table] = tableKey.split('.');
    const tableInfo = tables.find(
      (t) => t.table_schema === schema && t.table_name === table
    );
    if (tableInfo) {
      setTimestampCol(tableInfo.timestamp_column);
    }
    try {
      const cols = await tsApi.getTableColumns(schema, table);
      setColumns(cols);
    } catch (err) {
      console.error('Failed to fetch columns:', err);
    }
  }, [tables]);

  const handleQuery = useCallback(async () => {
    if (!selectedTable || !timestampCol) return;
    const [schema, table] = selectedTable.split('.');
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - rangeHours * 3600000).toISOString();

    try {
      setIsQuerying(true);
      setError(null);
      const result = await tsApi.queryTimeseries({
        schema,
        table,
        timestampColumn: timestampCol,
        granularity,
        startTime,
        endTime,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setIsQuerying(false);
    }
  }, [selectedTable, timestampCol, rangeHours, granularity]);

  if (isLoading) return <div>Discovering time-series tables...</div>;

  // De-duplicate table entries (multiple timestamp columns per table)
  const uniqueTables = tables.reduce<Record<string, TimeseriesTable>>((acc, t) => {
    const key = `${t.table_schema}.${t.table_name}`;
    if (!acc[key]) acc[key] = t;
    return acc;
  }, {});

  const timestampColumns = tables
    .filter((t) => `${t.table_schema}.${t.table_name}` === selectedTable)
    .map((t) => t.timestamp_column);

  const chartData = data.map((d) => ({
    ...d,
    bucket: d.bucket ? format(new Date(d.bucket as string), 'MMM dd HH:mm') : '',
    count: Number(d.count) || 0,
  }));

  return (
    <div>
      <PageHeader
        title="Time Series Explorer"
        description="Explore and visualize time-series data from any table"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Time Series' }]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Query Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Table</label>
              <Select value={selectedTable} onValueChange={handleTableSelect}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(uniqueTables).map(([key, t]) => (
                    <SelectItem key={key} value={key}>
                      {t.table_schema}.{t.table_name} ({t.estimated_rows.toLocaleString()} rows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {timestampColumns.length > 1 && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Timestamp Column</label>
                <Select value={timestampCol} onValueChange={setTimestampCol}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timestampColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Time Range</label>
              <TimeRangePicker selectedHours={rangeHours} onSelect={setRangeHours} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Granularity</label>
              <GranularitySelector value={granularity} onChange={setGranularity} />
            </div>

            <Button onClick={handleQuery} disabled={!selectedTable || isQuerying}>
              {isQuerying ? 'Querying...' : 'Run Query'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {chartData.length > 0 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Results ({chartData.length} data points)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bucket"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time Bucket</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.bucket}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tables with timestamp columns found in this database.
        </div>
      )}
    </div>
  );
}
