import { useMemo } from 'react';
import { getBlockWorkouts, getWorkoutForDay } from '@/lib/workouts';
import { DELOAD_WEEKS } from '@/lib/constants';
import type { WorkoutDay } from '@/types';

export function useCurrentWorkout(week: number) {
  return useMemo(() => {
    const isDeload = DELOAD_WEEKS.includes(week);
    const workouts = getBlockWorkouts(week);
    return { workouts, isDeload };
  }, [week]);
}

export function useWorkoutDay(week: number, dayIndex: number): WorkoutDay | undefined {
  return useMemo(() => getWorkoutForDay(week, dayIndex), [week, dayIndex]);
}
