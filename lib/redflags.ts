import type { AppData, DailyEntry } from '@/types';
import { getDateString } from './helpers';

export interface RedFlag {
  level: 'critical' | 'warning';
  message: string;
}

function getLastNDaysEntries(entries: Record<string, DailyEntry>, days: number): DailyEntry[] {
  const today = new Date();
  const result: DailyEntry[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateString(d);
    if (entries[key]) {
      result.push(entries[key]);
    }
  }
  return result;
}

export function detectRedFlags(data: AppData): RedFlag[] {
  const flags: RedFlag[] = [];
  const entries = data.entries;
  const last14 = getLastNDaysEntries(entries, 14);
  const last7 = getLastNDaysEntries(entries, 7);

  // CRITICAL: Weight loss >1.2% BW/week for 2 consecutive weeks
  const weights14 = last14.filter(e => e.weight != null).map(e => e.weight!);
  if (weights14.length >= 4) {
    const first7Weights = last14.slice(7).filter(e => e.weight != null).map(e => e.weight!);
    const last7Weights = last14.slice(0, 7).filter(e => e.weight != null).map(e => e.weight!);

    if (first7Weights.length >= 2 && last7Weights.length >= 2) {
      const firstAvg = first7Weights.reduce((a, b) => a + b, 0) / first7Weights.length;
      const lastAvg = last7Weights.reduce((a, b) => a + b, 0) / last7Weights.length;
      const weeklyLossPct = ((firstAvg - lastAvg) / firstAvg) * 100;

      if (weeklyLossPct > 1.2) {
        flags.push({
          level: 'critical',
          message: `Rapid weight loss: ${weeklyLossPct.toFixed(1)}% over 2 weeks. Risk of muscle loss.`,
        });
      }
    }
  }

  // CRITICAL: Sleep under 6 hours for 3+ of the last 7 days
  const sleepEntries = last7.filter(e => e.sleep != null);
  const lowSleepDays = sleepEntries.filter(e => e.sleep! < 6).length;
  if (lowSleepDays >= 3) {
    flags.push({
      level: 'critical',
      message: `Poor sleep: under 6hrs for ${lowSleepDays}/7 days. Recovery compromised.`,
    });
  }

  // WARNING: Weight loss <0.3% for 2+ weeks (stall)
  if (weights14.length >= 4) {
    const first7Weights = last14.slice(7).filter(e => e.weight != null).map(e => e.weight!);
    const last7Weights = last14.slice(0, 7).filter(e => e.weight != null).map(e => e.weight!);

    if (first7Weights.length >= 2 && last7Weights.length >= 2) {
      const firstAvg = first7Weights.reduce((a, b) => a + b, 0) / first7Weights.length;
      const lastAvg = last7Weights.reduce((a, b) => a + b, 0) / last7Weights.length;
      const weeklyLossPct = ((firstAvg - lastAvg) / firstAvg) * 100;

      if (weeklyLossPct >= 0 && weeklyLossPct < 0.3) {
        flags.push({
          level: 'warning',
          message: `Weight stall: <0.3% loss over 2 weeks. Consider adjusting intake.`,
        });
      }
    }
  }

  // WARNING: Recovery rating <5/10 for 3+ of last 7 days
  const recoveryEntries = last7.filter(e => e.recovery != null);
  const lowRecoveryDays = recoveryEntries.filter(e => e.recovery! < 5).length;
  if (lowRecoveryDays >= 3) {
    flags.push({
      level: 'warning',
      message: `Low recovery: rated <5 for ${lowRecoveryDays}/7 days. Consider a deload.`,
    });
  }

  // WARNING: Mood/motivation <4/10 for 3+ of last 7 days
  const moodEntries = last7.filter(e => e.mood != null);
  const lowMoodDays = moodEntries.filter(e => e.mood! < 4).length;
  if (lowMoodDays >= 3) {
    flags.push({
      level: 'warning',
      message: `Low motivation: rated <4 for ${lowMoodDays}/7 days. Check stress & recovery.`,
    });
  }

  return flags;
}
