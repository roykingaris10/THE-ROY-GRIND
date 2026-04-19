import { useMemo } from 'react';
import type { AppData, TDEEBreakdown } from '@/types';
import { calculateTDEE, getDailyTarget, getNetBalanceStatus } from '@/lib/calorieEngine';
import { getDateString } from '@/lib/helpers';

export function useCalorieBalance(data: AppData | null, dateStr?: string) {
  return useMemo(() => {
    if (!data) {
      return {
        tdee: { bmr: 0, steps: 0, ebike: 0, training: 0, other: 0, total: 0 } as TDEEBreakdown,
        caloriesIn: 0,
        netBalance: 0,
        target: { min: 2400, max: 2800, phaseName: 'Loading...' },
        status: 'on-target' as const,
        currentWeight: 130,
      };
    }

    const date = dateStr || getDateString(new Date());
    const entry = data.entries[date] || { date };

    // Get current weight: latest logged weight or starting weight
    let currentWeight = data.profile.startingWeight;
    const allEntries = Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (allEntries.length > 0) currentWeight = allEntries[0].weight!;

    // Find today's session
    const session = data.sessions.find(s => s.date === date) || null;

    // Week number for phase detection
    const start = new Date(data.settings.programStart + 'T00:00:00');
    const now = new Date(date + 'T00:00:00');
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.max(1, Math.floor(diffDays / 7) + 1);

    const tdee = calculateTDEE(data.profile, currentWeight, entry, session, week);
    const caloriesIn = entry.calories || 0;
    const netBalance = caloriesIn - tdee.total;
    const target = getDailyTarget(week, tdee.total);
    const status = caloriesIn > 0 ? getNetBalanceStatus(caloriesIn, tdee.total, week) : 'on-target';

    return { tdee, caloriesIn, netBalance, target, status, currentWeight };
  }, [data, dateStr]);
}
