'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sankey, Tooltip, Layer, Rectangle } from 'recharts';
import { ConnectionTopology } from '../lib/api';

interface ConnectionSankeyProps {
  topology: ConnectionTopology[];
  maxConnections: number;
}

const SERVICE_COLORS = [
  '#22c55e',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

function SankeyNode({
  x,
  y,
  width,
  height,
  index,
  payload,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value: number; isDatabase?: boolean };
}) {
  const isDb = payload.isDatabase;
  const color = isDb ? '#3b82f6' : SERVICE_COLORS[index % SERVICE_COLORS.length];

  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.8}
        rx={4}
        ry={4}
      />
      <text
        x={isDb ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isDb ? 'end' : 'start'}
        dominantBaseline="central"
        className="fill-foreground text-xs"
      >
        {payload.name} ({payload.value})
      </text>
    </Layer>
  );
}

function SankeyLink({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  linkWidth,
  index,
}: {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
  index: number;
}) {
  return (
    <Layer>
      <path
        d={`
          M${sourceX},${sourceY + linkWidth / 2}
          C${sourceControlX},${sourceY + linkWidth / 2}
            ${targetControlX},${targetY + linkWidth / 2}
            ${targetX},${targetY + linkWidth / 2}
          L${targetX},${targetY - linkWidth / 2}
          C${targetControlX},${targetY - linkWidth / 2}
            ${sourceControlX},${sourceY - linkWidth / 2}
            ${sourceX},${sourceY - linkWidth / 2}
          Z
        `}
        fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
        fillOpacity={0.3}
        strokeWidth={0}
      />
    </Layer>
  );
}

export function ConnectionSankey({ topology, maxConnections }: ConnectionSankeyProps) {
  if (topology.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Connection Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No active connections detected.
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalConnections = topology.reduce((sum, t) => sum + t.total, 0);

  const nodes = [
    ...topology.map((t) => ({
      name: t.application_name || '(unnamed)',
      value: t.total,
    })),
    {
      name: `PostgreSQL`,
      value: totalConnections,
      isDatabase: true,
    },
  ];

  const dbIndex = nodes.length - 1;

  const links = topology.map((t, i) => ({
    source: i,
    target: dbIndex,
    value: t.total,
  }));

  const data = { nodes, links };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Connection Flow
          <span className="text-muted-foreground font-normal ml-2">
            {totalConnections} / {maxConnections} connections
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Sankey
          width={700}
          height={Math.max(200, topology.length * 50)}
          data={data}
          nodeWidth={10}
          nodePadding={24}
          margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
          link={
            <SankeyLink
              index={0}
              sourceX={0}
              targetX={0}
              sourceY={0}
              targetY={0}
              sourceControlX={0}
              targetControlX={0}
              linkWidth={0}
            />
          }
          node={
            <SankeyNode
              x={0}
              y={0}
              width={0}
              height={0}
              index={0}
              payload={{ name: '', value: 0 }}
            />
          }
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload.length) return null;
              const data = payload[0].payload;
              if (data.source && data.target) {
                return (
                  <div className="bg-popover border rounded-lg p-2 text-sm shadow-md">
                    <p className="font-medium">{data.source.name}</p>
                    <p className="text-muted-foreground">{data.value} connections</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </Sankey>
      </CardContent>
    </Card>
  );
}
