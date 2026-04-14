import { BLOCKS, BENCHMARKS, NUTRITION_PHASES } from './constants';
import type { Block, Benchmark, NutritionPhase, LiftEntry, LiftType } from '@/types';

export function getWeekNumber(date: Date, programStart: string): number {
  const start = new Date(programStart + 'T00:00:00');
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export function getCurrentBlock(week: number): Block {
  return BLOCKS.find(b => week >= b.weeks[0] && week <= b.weeks[1]) || BLOCKS[0];
}

export function getEstimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function getNutritionPhase(week: number): NutritionPhase {
  return NUTRITION_PHASES.find(p => week >= p.weeks[0] && week <= p.weeks[1]) || NUTRITION_PHASES[0];
}

export function getCurrentBenchmark(week: number): Benchmark {
  const month = Math.min(8, Math.floor((week - 1) / 4));
  return BENCHMARKS[month];
}

export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return getDateString(d);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getBestLift(lifts: LiftEntry[], type: LiftType): LiftEntry | null {
  const filtered = lifts.filter(l => l.type === type);
  if (filtered.length === 0) return null;
  return filtered.reduce((best, l) => {
    const bestE1rm = best.e1rm || getEstimated1RM(best.weight, best.reps);
    const lE1rm = l.e1rm || getEstimated1RM(l.weight, l.reps);
    return lE1rm > bestE1rm ? l : best;
  });
}

export function getBestE1RM(lifts: LiftEntry[], type: LiftType): number {
  const best = getBestLift(lifts, type);
  if (!best) return 0;
  return best.e1rm || getEstimated1RM(best.weight, best.reps);
}

export function getHeaviestLift(lifts: LiftEntry[], type: LiftType): LiftEntry | null {
  const filtered = lifts.filter(l => l.type === type);
  if (filtered.length === 0) return null;
  return filtered.reduce((best, l) => (l.weight > best.weight ? l : best));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
