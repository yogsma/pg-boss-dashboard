'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GRANULARITIES = [
  { value: 'minute', label: 'Minute' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const;

interface GranularitySelectorProps {
  value: string;
  onChange: (value: 'minute' | 'hour' | 'day' | 'week' | 'month') => void;
}

export function GranularitySelector({ value, onChange }: GranularitySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange as (v: string) => void}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Granularity" />
      </SelectTrigger>
      <SelectContent>
        {GRANULARITIES.map((g) => (
          <SelectItem key={g.value} value={g.value}>
            {g.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
