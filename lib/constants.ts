import type { Block, Benchmark, NutritionPhase } from '@/types';

export const COLORS = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  border: '#222222',
  primary: '#FF6B1A',
  warning: '#FF3B3B',
  squat: '#44AAFF',
  bench: '#FFAA44',
  deadlift: '#44FF88',
  accessory: '#888888',
  caloriesIn: '#44FF88',
  caloriesOut: '#FF6B1A',
  textPrimary: '#E8E8E8',
  textSecondary: '#888888',
  textMuted: '#555555',
  label: '#666666',
  ghostBorder: '#333333',
  success: '#44FF88',
  danger: '#FF3B3B',
} as const;

export const PROGRAM_START_DEFAULT = '2026-04-14';

export const BLOCKS: Block[] = [
  { name: 'Base Building', weeks: [1, 8], focus: 'Hypertrophy + Technique', sqFreq: '3x/wk', rpeRange: '6-8', repRange: '6-10' },
  { name: 'Strength Accumulation', weeks: [9, 16], focus: 'Heavy Compounds', sqFreq: '2x/wk', rpeRange: '7-9', repRange: '3-5' },
  { name: 'Intensity & Peaking', weeks: [17, 26], focus: 'Heavy Singles/Doubles', sqFreq: '2x/wk', rpeRange: '8-9.5', repRange: '1-3' },
  { name: 'Peak & Test', weeks: [27, 32], focus: 'Taper -> Max Out', sqFreq: '1-2x/wk', rpeRange: '9-9.5', repRange: 'Singles' },
];

export const BENCHMARKS_REALISTIC: Benchmark[] = [
  { month: 0, week: 0, bw: 130, sq: 150, bn: 105, dl: 210 },
  { month: 1, week: 4, bw: 126, sq: 157, bn: 109, dl: 218 },
  { month: 2, week: 8, bw: 122, sq: 165, bn: 113, dl: 228 },
  { month: 3, week: 12, bw: 118, sq: 172, bn: 117, dl: 237 },
  { month: 4, week: 16, bw: 117, sq: 178, bn: 120, dl: 243 },
  { month: 5, week: 20, bw: 113, sq: 184, bn: 123, dl: 250 },
  { month: 6, week: 24, bw: 108, sq: 188, bn: 126, dl: 257 },
  { month: 7, week: 28, bw: 104, sq: 192, bn: 128, dl: 261 },
  { month: 8, week: 32, bw: 101, sq: 195, bn: 130, dl: 265 },
];

export const BENCHMARKS_STRETCH: Benchmark[] = [
  ...BENCHMARKS_REALISTIC.slice(0, 8),
  { month: 8, week: 32, bw: 100, sq: 200, bn: 140, dl: 270 },
];

export const DELOAD_WEEKS = [4, 8, 12, 16, 20, 24, 30];
export const DIET_BREAK_WEEKS = [13, 14, 22];
export const DIET_TRANSITION_WEEKS = [15, 16];

export const NUTRITION_PHASES: NutritionPhase[] = [
  { weeks: [1, 12], name: 'Aggressive Cut', calories: [2400, 2800], protein: [220, 240], carbs: [200, 250], fat: [80, 90] },
  { weeks: [13, 14], name: 'Diet Break', calories: [3000, 3400], protein: [220, 240], carbs: [300, 350], fat: [85, 95] },
  { weeks: [15, 16], name: 'Transition', calories: [2600, 3000], protein: [220, 240], carbs: [240, 280], fat: [80, 90] },
  { weeks: [17, 26], name: 'Moderate Cut', calories: [2400, 2600], protein: [220, 240], carbs: [180, 220], fat: [75, 85] },
  { weeks: [27, 32], name: 'Peak / Maintenance', calories: [2700, 3000], protein: [220, 240], carbs: [250, 300], fat: [85, 95] },
];

export const LIFT_COLORS: Record<string, string> = {
  squat: COLORS.squat,
  bench: COLORS.bench,
  deadlift: COLORS.deadlift,
};

export const VALIDATION = {
  age: { min: 13, max: 80 },
  height: { min: 140, max: 220 },
  weight: { min: 40, max: 250 },
  liftWeight: { min: 0, max: 500 },
  reps: { min: 1, max: 30 },
  rpe: { min: 6, max: 10 },
  steps: { min: 0, max: 50000 },
  ebikeMinutes: { min: 0, max: 180 },
  otherCardio: { min: 0, max: 2000 },
  sleep: { min: 0, max: 14 },
  hr: { min: 30, max: 200 },
  hrv: { min: 10, max: 200 },
  rating: { min: 1, max: 10 },
} as const;
