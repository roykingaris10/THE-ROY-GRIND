export interface UserProfile {
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  startingWeight: number;
}

export interface DailyEntry {
  date: string;
  weight?: number;
  waist?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  steps?: number;
  stepsAutoSynced?: boolean;
  ebikeMinutes?: number;
  otherCardioKcal?: number;
  otherCardioNotes?: string;
  sleep?: number;
  restingHR?: number;
  hrv?: number;
  recovery?: number;
  energy?: number;
  mood?: number;
  notes?: string;
}

export interface SetLog {
  id: string;
  date: string;
  week: number;
  dayIndex: number;
  exerciseId: string;
  exerciseName: string;
  liftType?: 'squat' | 'bench' | 'deadlift' | null;
  isMain?: boolean;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  e1rm?: number;
  isPR?: boolean;
  isWarmup?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  week: number;
  dayIndex: number;
  workoutName: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  completionPercent: number;
  estimatedBurnKcal?: number;
  notes?: string;
}

export interface AppSettings {
  programStart: string;
  reminderEnabled: boolean;
  reminderTime: string;
  showStretchTargets: boolean;
  autoSyncSteps: boolean;
  defaultEbikeMinutesPerDay: number;
  onboardingComplete: boolean;
}

export interface AppData {
  profile: UserProfile;
  entries: Record<string, DailyEntry>;
  sets: SetLog[];
  sessions: WorkoutSession[];
  settings: AppSettings;
}

export type LiftType = 'squat' | 'bench' | 'deadlift';
export type SessionType = 'heavy' | 'volume' | 'light' | 'deload';

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

export interface TDEEBreakdown {
  bmr: number;
  steps: number;
  ebike: number;
  training: number;
  other: number;
  total: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe?: string;
  liftType?: LiftType;
  isMain?: boolean;
  notes?: string;
}

export interface WorkoutDay {
  dayIndex: number;
  name: string;
  exercises: Exercise[];
}

export interface GamificationLevel {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'training' | 'nutrition' | 'consistency' | 'milestone';
  unlocked: boolean;
}

export interface VirtueStats {
  discipline: number;
  temperance: number;
  fortitude: number;
  perseverance: number;
}

export interface GamificationState {
  xp: number;
  level: GamificationLevel;
  xpToNext: number;
  levelProgress: number;
  streak: number;
  longestStreak: number;
  achievements: Achievement[];
  unlockedCount: number;
  virtues: VirtueStats;
}
