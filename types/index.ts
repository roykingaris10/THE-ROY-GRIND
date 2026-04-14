export interface DailyEntry {
  date: string; // YYYY-MM-DD
  weight?: number; // kg, 1 decimal
  waist?: number; // cm, 0.5 precision
  calories?: number;
  protein?: number; // grams
  carbs?: number;
  fat?: number;
  steps?: number;
  cycling?: number; // minutes
  sleep?: number; // hours, 0.5 precision
  restingHR?: number; // bpm
  recovery?: number; // 1-10
  energy?: number; // 1-10
  mood?: number; // 1-10
  notes?: string;
}

export interface LiftEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'squat' | 'bench' | 'deadlift';
  weight: number; // kg
  reps: number;
  sets: number;
  rpe: number; // 6-10, 0.5 increments
  notes?: string;
  e1rm?: number; // calculated: weight * (1 + reps/30)
}

export interface AppSettings {
  programStart: string;
  reminderEnabled: boolean;
  reminderTime: string;
  onboardingComplete: boolean;
}

export interface AppData {
  entries: Record<string, DailyEntry>;
  lifts: LiftEntry[];
  settings: AppSettings;
}

export type LiftType = 'squat' | 'bench' | 'deadlift';

export interface Block {
  name: string;
  weeks: [number, number];
  focus: string;
  sqFreq: string;
  rpeRange: string;
  repRange: string;
}

export interface Benchmark {
  month: number;
  week: number;
  bw: number;
  sq: number;
  bn: number;
  dl: number;
}

export interface NutritionPhase {
  weeks: [number, number];
  name: string;
  calories: [number, number];
  protein: [number, number];
  carbs: [number, number];
  fat: [number, number];
}
