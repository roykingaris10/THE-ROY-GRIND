import { useMemo } from 'react';
import { getWeekNumber, getCurrentBlock, getNutritionPhase, getCurrentBenchmark } from '@/lib/helpers';
import { DELOAD_WEEKS, DIET_BREAK_WEEKS, DIET_TRANSITION_WEEKS } from '@/lib/constants';

export function useCurrentProgram(programStart: string, showStretch: boolean = false) {
  return useMemo(() => {
    const today = new Date();
    const week = getWeekNumber(today, programStart);
    const block = getCurrentBlock(week);
    const nutritionPhase = getNutritionPhase(week);
    const benchmark = getCurrentBenchmark(week, showStretch);
    const isDeload = DELOAD_WEEKS.includes(week);
    const isDietBreak = DIET_BREAK_WEEKS.includes(week);
    const isTransition = DIET_TRANSITION_WEEKS.includes(week);

    return { week, block, nutritionPhase, benchmark, isDeload, isDietBreak, isTransition };
  }, [programStart, showStretch]);
}
