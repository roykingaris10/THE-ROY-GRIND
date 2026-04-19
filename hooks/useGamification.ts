import { useMemo } from 'react';
import type { AppData, GamificationState } from '@/types';
import { computeGamification } from '@/lib/gamification';

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  level: { level: 1, name: 'Catechumen', xpRequired: 0, icon: '\u2720' },
  xpToNext: 100,
  levelProgress: 0,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  unlockedCount: 0,
  virtues: { discipline: 0, temperance: 0, fortitude: 0, perseverance: 0 },
};

export function useGamification(data: AppData | null): GamificationState {
  return useMemo(() => {
    if (!data) return DEFAULT_STATE;
    return computeGamification(data);
  }, [data]);
}
