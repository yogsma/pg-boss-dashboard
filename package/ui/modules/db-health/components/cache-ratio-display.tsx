import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CacheRatioDisplayProps {
  ratio: number;
}

export function CacheRatioDisplay({ ratio }: CacheRatioDisplayProps) {
  const percent = Math.round(ratio * 10000) / 100;
  const isGood = percent >= 99;
  const isWarning = percent >= 95 && percent < 99;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <span
            className={`text-4xl font-bold ${
              isGood ? 'text-green-500' : isWarning ? 'text-yellow-500' : 'text-red-500'
            }`}
          >
            {percent.toFixed(2)}%
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            {isGood
              ? 'Excellent - most reads served from cache'
              : isWarning
              ? 'Acceptable - consider adding more shared_buffers'
              : 'Low - database is reading too much from disk'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
