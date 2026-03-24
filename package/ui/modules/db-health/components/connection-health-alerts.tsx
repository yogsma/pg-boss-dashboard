'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, AlertCircle, Clock, Lock } from 'lucide-react';
import { ConnectionHealthData } from '../lib/api';

interface ConnectionHealthAlertsProps {
  health: ConnectionHealthData;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function ConnectionHealthAlerts({ health }: ConnectionHealthAlertsProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const idleCount = health.idleInTransaction.length;
  const slowCount = health.longRunningQueries.length;
  const blockedCount = health.blockedConnections.length;

  const longestIdle =
    idleCount > 0 ? Math.max(...health.idleInTransaction.map((c) => c.duration_seconds)) : 0;
  const longestSlow =
    slowCount > 0 ? Math.max(...health.longRunningQueries.map((q) => q.duration_seconds)) : 0;
  const longestBlocked =
    blockedCount > 0 ? Math.max(...health.blockedConnections.map((c) => c.waiting_seconds)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Connection Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Idle in Transaction */}
        <Collapsible open={openSections.has('idle')} onOpenChange={() => toggleSection('idle')}>
          <CollapsibleTrigger className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {openSections.has('idle') ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <AlertCircle
              className={`h-4 w-4 shrink-0 ${idleCount > 0 ? 'text-red-500' : 'text-green-500'}`}
            />
            <span className="font-medium text-sm">{idleCount} idle-in-transaction</span>
            {idleCount > 0 && (
              <>
                <Badge variant="outline" className="text-xs">
                  longest: {formatDuration(longestIdle)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {[
                    ...new Set(
                      health.idleInTransaction.map((c) => c.application_name || '(unnamed)')
                    ),
                  ].join(', ')}
                </span>
              </>
            )}
            {idleCount === 0 && <span className="text-xs text-muted-foreground">Healthy</span>}
          </CollapsibleTrigger>
          {idleCount > 0 && (
            <CollapsibleContent>
              <div className="rounded-md border ml-7 mt-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PID</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Query</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {health.idleInTransaction.map((c) => (
                      <TableRow key={c.pid}>
                        <TableCell className="font-mono">{c.pid}</TableCell>
                        <TableCell>{c.application_name || '-'}</TableCell>
                        <TableCell>{c.usename || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">{formatDuration(c.duration_seconds)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          <pre className="text-xs">{c.query || '-'}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>

        {/* Long Running Queries */}
        <Collapsible open={openSections.has('slow')} onOpenChange={() => toggleSection('slow')}>
          <CollapsibleTrigger className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {openSections.has('slow') ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <Clock
              className={`h-4 w-4 shrink-0 ${slowCount > 0 ? 'text-yellow-500' : 'text-green-500'}`}
            />
            <span className="font-medium text-sm">
              {slowCount} long-running {slowCount === 1 ? 'query' : 'queries'}
            </span>
            {slowCount > 0 && (
              <Badge variant="outline" className="text-xs">
                longest: {formatDuration(longestSlow)}
              </Badge>
            )}
            {slowCount === 0 && <span className="text-xs text-muted-foreground">Healthy</span>}
          </CollapsibleTrigger>
          {slowCount > 0 && (
            <CollapsibleContent>
              <div className="rounded-md border ml-7 mt-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Query</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {health.longRunningQueries.map((q) => (
                      <TableRow key={q.pid}>
                        <TableCell className="font-mono">{q.pid}</TableCell>
                        <TableCell>{q.usename || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            className={q.duration_seconds > 60 ? 'bg-red-500' : 'bg-yellow-500'}
                          >
                            {formatDuration(q.duration_seconds)}
                          </Badge>
                        </TableCell>
                        <TableCell>{q.state}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          <pre className="text-xs">{q.query}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>

        {/* Blocked Connections */}
        <Collapsible
          open={openSections.has('blocked')}
          onOpenChange={() => toggleSection('blocked')}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {openSections.has('blocked') ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <Lock
              className={`h-4 w-4 shrink-0 ${blockedCount > 0 ? 'text-red-500' : 'text-green-500'}`}
            />
            <span className="font-medium text-sm">
              {blockedCount} blocked {blockedCount === 1 ? 'connection' : 'connections'}
            </span>
            {blockedCount > 0 && (
              <Badge variant="outline" className="text-xs">
                longest wait: {formatDuration(longestBlocked)}
              </Badge>
            )}
            {blockedCount === 0 && (
              <span className="text-xs text-muted-foreground">No lock contention</span>
            )}
          </CollapsibleTrigger>
          {blockedCount > 0 && (
            <CollapsibleContent>
              <div className="rounded-md border ml-7 mt-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blocked PID</TableHead>
                      <TableHead>Blocked App</TableHead>
                      <TableHead>Waiting</TableHead>
                      <TableHead>Blocking PID</TableHead>
                      <TableHead>Blocking App</TableHead>
                      <TableHead>Blocking Query</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {health.blockedConnections.map((c) => (
                      <TableRow key={c.blocked_pid}>
                        <TableCell className="font-mono">{c.blocked_pid}</TableCell>
                        <TableCell>{c.blocked_app || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">{formatDuration(c.waiting_seconds)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{c.blocking_pid}</TableCell>
                        <TableCell>{c.blocking_app || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <pre className="text-xs">{c.blocking_query || '-'}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}
