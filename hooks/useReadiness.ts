import { useMemo } from 'react';
import type { AppData } from '@/types';
import { calculateReadiness, type ReadinessResult } from '@/lib/readiness';

export function useReadiness(data: AppData | null | undefined): ReadinessResult {
  return useMemo(() => {
    if (!data) {
      return {
        score: 75,
        factors: [],
        label: 'GOOD' as const,
        advice: 'Standard session.',
      };
    }
    const today = new Date().toISOString().split('T')[0];
    return calculateReadiness(data, today);
  }, [data]);
}
