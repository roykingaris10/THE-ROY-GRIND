import type { UserProfile, DailyEntry, WorkoutSession, TDEEBreakdown, SessionType } from '@/types';
import { DELOAD_WEEKS } from './constants';

export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function calculateStepsCalories(steps: number, weightKg: number): number {
  return Math.round(steps * 0.045 * (weightKg / 70));
}

export function calculateEbikeCalories(minutes: number, weightKg: number): number {
  const hours = minutes / 60;
  return Math.round(4.0 * weightKg * hours);
}

export function calculateTrainingCalories(
  durationMinutes: number,
  weightKg: number,
  sessionType: SessionType
): number {
  const metMap: Record<SessionType, number> = { heavy: 6.0, volume: 5.0, light: 3.5, deload: 3.5 };
  const met = metMap[sessionType];
  const hours = durationMinutes / 60;
  const gross = met * weightKg * hours;
  const bmrPortion = (calculateBMR(weightKg, 180, 24, 'male') / 24) * hours;
  return Math.round(gross - bmrPortion);
}

export function inferSessionType(week: number, dayIndex: number): SessionType {
  if (DELOAD_WEEKS.includes(week)) return 'deload';
  if (week >= 1 && week <= 8) return 'volume';
  if (week >= 9 && week <= 16) {
    return dayIndex === 4 ? 'volume' : 'heavy';
  }
  if (week >= 17 && week <= 26) return 'heavy';
  if (week >= 27 && week <= 29) return 'heavy';
  return 'light';
}

export function calculateTDEE(
  profile: UserProfile,
  currentWeight: number,
  entry: DailyEntry,
  session?: WorkoutSession | null,
  currentWeek?: number
): TDEEBreakdown {
  const bmr = calculateBMR(currentWeight, profile.heightCm, profile.age, profile.sex);
  const steps = calculateStepsCalories(entry.steps || 0, currentWeight);
  const ebike = calculateEbikeCalories(entry.ebikeMinutes || 0, currentWeight);

  let training = 0;
  if (session) {
    let duration = 90;
    if (session.startTime && session.endTime) {
      duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000;
    }
    const sType = inferSessionType(currentWeek || session.week, session.dayIndex);
    training = calculateTrainingCalories(duration, currentWeight, sType);
  }

  const other = entry.otherCardioKcal || 0;

  return {
    bmr,
    steps,
    ebike,
    training,
    other,
    total: bmr + steps + ebike + training + other,
  };
}

export function getDailyTarget(weekNumber: number, tdee: number): { min: number; max: number; phaseName: string } {
  let result: { min: number; max: number; phaseName: string };

  if (weekNumber >= 1 && weekNumber <= 12) {
    result = { min: tdee - 900, max: tdee - 600, phaseName: 'Aggressive Cut' };
  } else if (weekNumber >= 13 && weekNumber <= 14) {
    result = { min: tdee - 100, max: tdee + 100, phaseName: 'Diet Break' };
  } else if (weekNumber >= 15 && weekNumber <= 16) {
    result = { min: tdee - 400, max: tdee - 200, phaseName: 'Transition' };
  } else if (weekNumber >= 17 && weekNumber <= 26) {
    result = { min: tdee - 700, max: tdee - 400, phaseName: 'Moderate Cut' };
  } else {
    result = { min: tdee - 200, max: tdee + 100, phaseName: 'Peak / Maintenance' };
  }

  return applyConstraints(result, weekNumber);
}

function applyConstraints(
  target: { min: number; max: number; phaseName: string },
  weekNumber: number
): { min: number; max: number; phaseName: string } {
  let floor = 2400;
  if ([13, 14, 22].includes(weekNumber)) floor = 3000;
  if (weekNumber >= 27) floor = 2700;

  return {
    ...target,
    min: Math.max(target.min, floor),
    max: Math.max(target.max, floor + 200),
  };
}

export function getNetBalanceStatus(
  caloriesIn: number,
  tdee: number,
  weekNumber: number
): 'on-target' | 'mild-off' | 'way-off' {
  const target = getDailyTarget(weekNumber, tdee);
  const midpoint = (target.min + target.max) / 2;
  const diff = Math.abs(caloriesIn - midpoint);
  const range = (target.max - target.min) / 2;

  if (diff <= range + 100) return 'on-target';
  if (diff <= range + 300) return 'mild-off';
  return 'way-off';
}
