import { BLOCKS, BENCHMARKS_REALISTIC, BENCHMARKS_STRETCH, NUTRITION_PHASES } from './constants';
import type { Block, Benchmark, NutritionPhase, SetLog, LiftType } from '@/types';

export function getWeekNumber(date: Date, programStart: string): number {
  const start = new Date(programStart + 'T00:00:00');
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export function getCurrentBlock(week: number): Block {
  return BLOCKS.find(b => week >= b.weeks[0] && week <= b.weeks[1]) || BLOCKS[0];
}

export function getEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function getNutritionPhase(week: number): NutritionPhase {
  return NUTRITION_PHASES.find(p => week >= p.weeks[0] && week <= p.weeks[1]) || NUTRITION_PHASES[0];
}

export function getCurrentBenchmark(week: number, stretch: boolean = false): Benchmark {
  const benchmarks = stretch ? BENCHMARKS_STRETCH : BENCHMARKS_REALISTIC;
  const month = Math.min(8, Math.floor((week - 1) / 4));
  return benchmarks[month];
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

export function getBestE1RM(sets: SetLog[], type: LiftType): number {
  const filtered = sets.filter(s => s.liftType === type && s.isMain);
  if (filtered.length === 0) return 0;
  return Math.max(...filtered.map(s => s.e1rm || getEstimated1RM(s.weight, s.reps)));
}

export function getHeaviestSet(sets: SetLog[], type: LiftType): SetLog | null {
  const filtered = sets.filter(s => s.liftType === type);
  if (filtered.length === 0) return null;
  return filtered.reduce((best, s) => {
    const bestE = best.e1rm || getEstimated1RM(best.weight, best.reps);
    const sE = s.e1rm || getEstimated1RM(s.weight, s.reps);
    return sE > bestE ? s : best;
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay();
}
