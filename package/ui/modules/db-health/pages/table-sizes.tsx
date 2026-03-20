'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as healthApi from '../lib/api';
import { TableInfo } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function TableSizesPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    healthApi
      .getTables()
      .then(setTables)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch table sizes'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading table sizes...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const top10 = tables.slice(0, 10).map((t) => ({
    name: t.relname.length > 20 ? t.relname.substring(0, 20) + '...' : t.relname,
    size: t.total_size_bytes,
    sizeFormatted: t.total_size,
  }));

  return (
    <div>
      <PageHeader
        title="Table Sizes"
        description={`${tables.length} tables found`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Health', href: '/health' },
          { label: 'Table Sizes' },
        ]}
      />

      {top10.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top 10 Tables by Size</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1073741824) return `${(value / 1073741824).toFixed(1)} GB`;
                    if (value >= 1048576) return `${(value / 1048576).toFixed(1)} MB`;
                    if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
                    return `${value} B`;
                  }}
                />
                <Tooltip
                  formatter={(value) => {
                    const num = Number(value);
                    if (num >= 1073741824) return `${(num / 1073741824).toFixed(2)} GB`;
                    if (num >= 1048576) return `${(num / 1048576).toFixed(2)} MB`;
                    if (num >= 1024) return `${(num / 1024).toFixed(2)} KB`;
                    return `${num} B`;
                  }}
                />
                <Bar dataKey="size" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schema</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total Size</TableHead>
              <TableHead>Index Size</TableHead>
              <TableHead className="text-right">Est. Rows</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((t) => (
              <TableRow key={`${t.schemaname}.${t.relname}`}>
                <TableCell className="font-mono text-sm">{t.schemaname}</TableCell>
                <TableCell className="font-mono text-sm">{t.relname}</TableCell>
                <TableCell>{t.total_size}</TableCell>
                <TableCell>{t.index_size}</TableCell>
                <TableCell className="text-right">{t.estimated_rows.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
