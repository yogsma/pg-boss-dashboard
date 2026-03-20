'use client';

import { Button } from '@/components/ui/button';

const PRESETS = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];

interface TimeRangePickerProps {
  selectedHours: number;
  onSelect: (hours: number) => void;
}

export function TimeRangePicker({ selectedHours, onSelect }: TimeRangePickerProps) {
  return (
    <div className="flex gap-1">
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          variant={selectedHours === preset.hours ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(preset.hours)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
