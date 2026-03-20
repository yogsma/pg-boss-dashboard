'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/lib/modules-context';
import { allUIModules } from '@/modules/loader';
import { PageHeader } from '@/components/page-header';

export default function HubOverviewPage() {
  const { modules, isLoading } = useModules();

  return (
    <div>
      <PageHeader
        title="Postgres Ecosystem Hub"
        description="Monitor and manage your PostgreSQL ecosystem from a single dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allUIModules.map((uiMod) => {
          const status = modules.find((m) => m.id === uiMod.id);
          const available = isLoading || status?.available;
          const Icon = uiMod.icon;

          return (
            <Link key={uiMod.id} href={available ? uiMod.basePath : '#'}>
              <Card
                className={`transition-all hover:shadow-md ${
                  !available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{uiMod.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {status?.description || 'Loading...'}
                  </p>
                  <div className="mt-2">
                    {isLoading ? (
                      <Badge variant="secondary">Loading</Badge>
                    ) : available ? (
                      <Badge className="bg-green-500">Available</Badge>
                    ) : (
                      <Badge variant="destructive">Unavailable</Badge>
                    )}
                  </div>
                  {!available && status?.reason && (
                    <p className="text-xs text-muted-foreground mt-1">{status.reason}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
