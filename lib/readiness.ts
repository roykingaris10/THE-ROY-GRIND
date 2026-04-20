import type { AppData, DailyEntry, SetLog } from '@/types';

export interface ReadinessResult {
  score: number;
  factors: ReadinessFactor[];
  label: 'EXCELLENT' | 'GOOD' | 'GUARDED' | 'LOW';
  advice: string;
}

export interface ReadinessFactor {
  name: string;
  value: string;
  score: number;
  weight: number;
}

interface Baselines {
  sleep: number;
  hrv: number;
  restingHR: number;
  recovery: number;
}

function getBaselines(data: AppData, date: string): Baselines {
  const entries = Object.values(data.entries)
    .filter(e => e.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const avg = (vals: number[]) => vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;

  return {
    sleep: avg(entries.filter(e => e.sleep != null).map(e => e.sleep!)) || 7.5,
    hrv: avg(entries.filter(e => e.hrv != null).map(e => e.hrv!)) || 60,
    restingHR: avg(entries.filter(e => e.restingHR != null).map(e => e.restingHR!)) || 60,
    recovery: avg(entries.filter(e => e.recovery != null).map(e => e.recovery!)) || 7,
  };
}

function getRecentAvgRPE(sets: SetLog[], numSessions: number): number | null {
  const sessionDates = [...new Set(sets.filter(s => s.isMain).map(s => s.date))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, numSessions);
  const recentSets = sets.filter(s => s.isMain && s.rpe != null && sessionDates.includes(s.date));
  if (!recentSets.length) return null;
  return recentSets.reduce((sum, s) => sum + (s.rpe || 0), 0) / recentSets.length;
}

export function calculateReadiness(data: AppData, date: string): ReadinessResult {
  const d = data.entries[date];
  const baselines = getBaselines(data, date);
  const factors: ReadinessFactor[] = [];
  let score = 100;

  const sleep = d?.sleep ?? baselines.sleep;
  let sleepScore = 100;
  if (sleep < 6) sleepScore = 25;
  else if (sleep < 7) sleepScore = 55;
  else if (sleep < 7.5) sleepScore = 75;
  else sleepScore = 95;
  const sleepPenalty = Math.round((1 - sleepScore / 100) * 30);
  score -= sleepPenalty;
  factors.push({ name: 'SLEEP', value: `${sleep.toFixed(1)} hrs`, score: sleepScore, weight: 0.3 });

  if (d?.hrv != null && baselines.hrv > 0) {
    const hrvDelta = (d.hrv - baselines.hrv) / baselines.hrv;
    let hrvScore = 80;
    if (hrvDelta < -0.20) hrvScore = 25;
    else if (hrvDelta < -0.10) hrvScore = 50;
    else if (hrvDelta < -0.05) hrvScore = 65;
    else if (hrvDelta > 0.05) hrvScore = 95;
    const hrvPenalty = Math.round((1 - hrvScore / 100) * 25);
    score -= hrvPenalty;
    factors.push({ name: 'HRV', value: `${d.hrv} ms`, score: hrvScore, weight: 0.25 });
  }

  if (d?.restingHR != null && baselines.restingHR > 0) {
    const hrDelta = d.restingHR - baselines.restingHR;
    let hrScore = 85;
    if (hrDelta > 10) hrScore = 30;
    else if (hrDelta > 5) hrScore = 55;
    else if (hrDelta > 2) hrScore = 75;
    else if (hrDelta <= 0) hrScore = 95;
    const hrPenalty = Math.round((1 - hrScore / 100) * 15);
    score -= hrPenalty;
    factors.push({ name: 'RESTING HR', value: `${d.restingHR} bpm`, score: hrScore, weight: 0.15 });
  }

  const recovery = d?.recovery;
  if (recovery != null) {
    let recScore = 70;
    if (recovery <= 3) recScore = 20;
    else if (recovery <= 5) recScore = 45;
    else if (recovery <= 7) recScore = 70;
    else recScore = 90;
    const recPenalty = Math.round((1 - recScore / 100) * 15);
    score -= recPenalty;
    factors.push({ name: 'SORENESS', value: recovery <= 4 ? 'HIGH' : recovery <= 6 ? 'MED' : 'LOW', score: recScore, weight: 0.15 });
  }

  const energy = d?.energy ?? d?.mood;
  if (energy != null) {
    let enScore = 70;
    if (energy <= 3) enScore = 25;
    else if (energy <= 5) enScore = 50;
    else if (energy <= 7) enScore = 70;
    else enScore = 90;
    const enPenalty = Math.round((1 - enScore / 100) * 10);
    score -= enPenalty;
    factors.push({ name: 'ENERGY', value: `${energy}/10`, score: enScore, weight: 0.15 });
  }

  const recentRPE = getRecentAvgRPE(data.sets, 3);
  if (recentRPE !== null && recentRPE > 8.5) {
    score -= 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: ReadinessResult['label'];
  let advice: string;
  if (score >= 80) {
    label = 'EXCELLENT';
    advice = 'Push hard today.';
  } else if (score >= 60) {
    label = 'GOOD';
    advice = 'Standard session.';
  } else if (score >= 40) {
    label = 'GUARDED';
    advice = 'Consider RPE −0.5 on top sets.';
  } else {
    label = 'LOW';
    advice = 'Council suggests deload.';
  }

  return { score, factors, label, advice };
}

export function getAverageReadiness(data: AppData, days: number = 7): number {
  const today = new Date();
  let total = 0;
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (data.entries[dateStr]) {
      const r = calculateReadiness(data, dateStr);
      total += r.score;
      count++;
    }
  }
  return count > 0 ? Math.round(total / count) : 75;
}
