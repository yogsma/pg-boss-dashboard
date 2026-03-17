'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import * as cronApi from '../lib/api';

interface ActiveToggleProps {
  jobId: number;
  active: boolean;
  onToggle?: (active: boolean) => void;
}

export function ActiveToggle({ jobId, active, onToggle }: ActiveToggleProps) {
  const [isActive, setIsActive] = useState(active);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setIsToggling(true);
      await cronApi.toggleActive(jobId, checked);
      setIsActive(checked);
      onToggle?.(checked);
    } catch (error) {
      console.error('Failed to toggle cron job:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isToggling}
    />
  );
}
