import type { AppData, DailyEntry } from '@/types';
import { DELOAD_WEEKS } from '@/lib/constants';
import { calculateReadiness } from '@/lib/readiness';

export interface DeloadSuggestion {
  severity: 'mild' | 'strong';
  reasons: DeloadReason[];
  message: string;
}

export interface DeloadReason {
  key: string;
  label: string;
  detail: string;
  color: string;
}

export interface DeloadDecision {
  date: string;
  suggested: boolean;
  severity: 'mild' | 'strong';
  reasons: string[];
  accepted: boolean;
}

function getLast7Days(data: AppData, currentDate: string): DailyEntry[] {
  const days: DailyEntry[] = [];
  const d = new Date(currentDate);
  for (let i = 0; i < 7; i++) {
    const dateStr = d.toISOString().split('T')[0];
    if (data.entries[dateStr]) days.push(data.entries[dateStr]);
    d.setDate(d.getDate() - 1);
  }
  return days;
}

function getWeekNumber(date: string, programStart: string): number {
  const start = new Date(programStart);
  const current = new Date(date);
  const diff = current.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

export function shouldSuggestDeload(data: AppData, currentDate: string): DeloadSuggestion | null {
  const programStart = data.settings?.programStart ?? '2026-04-14';
  const week = getWeekNumber(currentDate, programStart);
  if (DELOAD_WEEKS.includes(week)) return null;

  const last7 = getLast7Days(data, currentDate);
  if (last7.length < 3) return null;

  const reasons: DeloadReason[] = [];

  const lowReadinessCount = last7.filter(d => {
    const r = calculateReadiness(data, d.date);
    return r.score < 50;
  }).length;
  if (lowReadinessCount >= 3) {
    reasons.push({
      key: 'lowReadiness',
      label: 'READINESS',
      detail: `Below 50 for ${lowReadinessCount} of last 7 days`,
      color: '#B67575',
    });
  }

  const sleepData = last7.filter(d => d.sleep != null);
  const poorSleepCount = sleepData.filter(d => (d.sleep || 8) < 6).length;
  if (poorSleepCount >= 3) {
    reasons.push({
      key: 'poorSleep',
      label: 'SLEEP',
      detail: `Under 6h for ${poorSleepCount} of last ${sleepData.length} days`,
      color: '#B67575',
    });
  }

  const hrvData = last7.filter(d => d.hrv != null).map(d => d.hrv!);
  if (hrvData.length >= 3) {
    const baseline14 = Object.values(data.entries)
      .filter(e => e.hrv != null && e.date < currentDate)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .map(e => e.hrv!);
    if (baseline14.length >= 5) {
      const baselineAvg = avg(baseline14);
      const recentAvg = avg(hrvData.slice(0, 3));
      const drop = ((baselineAvg - recentAvg) / baselineAvg) * 100;
      if (drop > 15) {
        reasons.push({
          key: 'lowHRV',
          label: 'HRV',
          detail: `↓ ${Math.round(drop)}% vs 14-day avg`,
          color: '#B67575',
        });
      }
    }
  }

  const recentSessions = data.sets
    .filter(s => s.isMain && s.rpe != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  if (recentSessions.length >= 6) {
    const recent6 = recentSessions.slice(0, 6);
    const older6 = recentSessions.slice(6, 12);
    const recentRPE = avg(recent6.map(s => s.rpe!));
    const olderRPE = avg(older6.map(s => s.rpe!));
    const drift = recentRPE - olderRPE;
    if (drift > 0.8) {
      reasons.push({
        key: 'rpeCreep',
        label: 'RPE DRIFT',
        detail: `+${drift.toFixed(1)} over 6 sessions`,
        color: '#B67575',
      });
    }
  }

  const lowRecoveryCount = last7.filter(d => (d.recovery || 10) < 5).length;
  if (lowRecoveryCount >= 3) {
    reasons.push({
      key: 'lowRecovery',
      label: 'RECOVERY',
      detail: `Low for ${lowRecoveryCount} of last 7 days`,
      color: '#8B7FB8',
    });
  }

  if (reasons.length >= 3) {
    return {
      severity: 'strong',
      reasons,
      message: 'Three signs have appeared. Your RPE has drifted upward. HRV has fallen. The bar has felt heavy.',
    };
  }
  if (reasons.length === 2) {
    return {
      severity: 'mild',
      reasons,
      message: 'Signs of accumulated fatigue. Consider a lighter session today.',
    };
  }
  return null;
}
