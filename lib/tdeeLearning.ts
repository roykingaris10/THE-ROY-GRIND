import type { AppData, UserProfile, DailyEntry } from '@/types';

export interface TDEECalibration {
  enabled: boolean;
  personalMultiplier: number;
  formulaTDEE: number;
  personalTDEE: number;
  sampleSize: number;
  confidence: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

function calculateBMR(profile: UserProfile, weight: number): number {
  if (profile.sex === 'male') {
    return 10 * weight + 6.25 * profile.heightCm - 5 * profile.age + 5;
  }
  return 10 * weight + 6.25 * profile.heightCm - 5 * profile.age - 161;
}

function calculateFormulaTDEE(weight: number, profile: UserProfile): number {
  const bmr = calculateBMR(profile, weight);
  return Math.round(bmr * 1.55);
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

interface DayData {
  date: string;
  weight: number;
  calories: number;
}

function getCompleteDays(data: AppData): DayData[] {
  return Object.values(data.entries)
    .filter(e => e.weight != null && e.calories != null && e.calories > 500)
    .map(e => ({ date: e.date, weight: e.weight!, calories: e.calories! }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function groupByWeek(days: DayData[]): DayData[][] {
  const weeks: DayData[][] = [];
  let current: DayData[] = [];
  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  return weeks;
}

export function calculatePersonalTDEE(data: AppData): TDEECalibration {
  const completeDays = getCompleteDays(data);
  const formulaTDEE = calculateFormulaTDEE(
    data.profile.startingWeight,
    data.profile,
  );

  if (completeDays.length < 28) {
    return {
      enabled: false,
      personalMultiplier: 1.0,
      formulaTDEE,
      personalTDEE: formulaTDEE,
      sampleSize: 0,
      confidence: 'low',
      lastUpdated: '',
    };
  }

  const weeks = groupByWeek(completeDays);
  const ratios: number[] = [];

  for (const week of weeks) {
    if (week.length < 5) continue;
    const avgIntake = mean(week.map(d => d.calories));
    const avgWeight = mean(week.map(d => d.weight));
    const weightChange = week[week.length - 1].weight - week[0].weight;
    const weekFormulaTDEE = calculateFormulaTDEE(avgWeight, data.profile);
    const impliedTDEE = avgIntake - (weightChange * 7700 / 7);
    if (weekFormulaTDEE > 0) {
      ratios.push(impliedTDEE / weekFormulaTDEE);
    }
  }

  if (ratios.length < 2) {
    return {
      enabled: false,
      personalMultiplier: 1.0,
      formulaTDEE,
      personalTDEE: formulaTDEE,
      sampleSize: ratios.length,
      confidence: 'low',
      lastUpdated: '',
    };
  }

  ratios.sort((a, b) => a - b);
  const trimCount = Math.floor(ratios.length * 0.1);
  const trimmed = ratios.slice(trimCount, ratios.length - trimCount || undefined);
  const personalMultiplier = clamp(mean(trimmed.length ? trimmed : ratios), 0.75, 1.25);

  const confidence: TDEECalibration['confidence'] =
    ratios.length >= 12 ? 'high' :
    ratios.length >= 6 ? 'medium' : 'low';

  return {
    enabled: true,
    personalMultiplier,
    formulaTDEE,
    personalTDEE: Math.round(formulaTDEE * personalMultiplier),
    sampleSize: ratios.length,
    confidence,
    lastUpdated: new Date().toISOString(),
  };
}
