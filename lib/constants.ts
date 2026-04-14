import { Block, Benchmark, NutritionPhase } from '@/types';

export const COLORS = {
  background: '#111111',
  card: '#1A1A1A',
  border: '#222222',
  primary: '#FF3B3B',
  squat: '#44AAFF',
  bench: '#FFAA44',
  deadlift: '#44FF88',
  textPrimary: '#E8E8E8',
  textSecondary: '#888888',
  textMuted: '#555555',
  label: '#666666',
  ghostBorder: '#333333',
  ghostText: '#888888',
  success: '#44FF88',
  warning: '#FFAA44',
  danger: '#FF3B3B',
} as const;

export const PROGRAM_START_DEFAULT = '2026-04-14';

export const BLOCKS: Block[] = [
  { name: 'Base Building', weeks: [1, 8], focus: 'Hypertrophy + Technique', sqFreq: '3x/wk', rpeRange: '6-8', repRange: '6-10' },
  { name: 'Strength Accumulation', weeks: [9, 18], focus: 'Heavy Compounds', sqFreq: '2x/wk', rpeRange: '7-9', repRange: '3-5' },
  { name: 'Intensity & Peaking', weeks: [19, 26], focus: 'Heavy Singles/Doubles', sqFreq: '2x/wk', rpeRange: '8-9.5', repRange: '1-3' },
  { name: 'Peak & Test', weeks: [27, 32], focus: 'Taper -> Max Out', sqFreq: '1-2x/wk', rpeRange: '9-9.5', repRange: 'Singles' },
];

export const BENCHMARKS: Benchmark[] = [
  { month: 0, week: 0, bw: 130, sq: 150, bn: 105, dl: 210 },
  { month: 1, week: 4, bw: 126, sq: 157, bn: 109, dl: 218 },
  { month: 2, week: 8, bw: 122, sq: 165, bn: 114, dl: 228 },
  { month: 3, week: 12, bw: 118, sq: 173, bn: 120, dl: 238 },
  { month: 4, week: 16, bw: 117, sq: 178, bn: 125, dl: 243 },
  { month: 5, week: 20, bw: 113, sq: 185, bn: 129, dl: 250 },
  { month: 6, week: 24, bw: 108, sq: 190, bn: 133, dl: 258 },
  { month: 7, week: 28, bw: 104, sq: 196, bn: 137, dl: 265 },
  { month: 8, week: 32, bw: 101, sq: 200, bn: 140, dl: 270 },
];

export const DELOAD_WEEKS = [4, 8, 12, 16, 21, 24, 28, 30];
export const DIET_BREAK_WEEKS = [13, 14, 15, 16, 22];

export const NUTRITION_PHASES: NutritionPhase[] = [
  { weeks: [1, 12], name: 'Aggressive Cut', calories: [2600, 2800], protein: [220, 240], carbs: [200, 250], fat: [80, 90] },
  { weeks: [13, 16], name: 'Diet Break', calories: [3200, 3400], protein: [220, 240], carbs: [300, 350], fat: [85, 95] },
  { weeks: [17, 26], name: 'Moderate Cut', calories: [2400, 2600], protein: [220, 240], carbs: [180, 220], fat: [75, 85] },
  { weeks: [27, 32], name: 'Maintenance', calories: [2800, 3000], protein: [220, 240], carbs: [250, 300], fat: [85, 95] },
];

export const LIFT_COLORS: Record<string, string> = {
  squat: COLORS.squat,
  bench: COLORS.bench,
  deadlift: COLORS.deadlift,
};

export const VALIDATION = {
  weight: { min: 50, max: 250 },
  liftWeight: { min: 0, max: 500 },
  reps: { min: 1, max: 30 },
  rpe: { min: 6, max: 10 },
  steps: { min: 0, max: 50000 },
  sleep: { min: 0, max: 14 },
  rating: { min: 1, max: 10 },
} as const;
