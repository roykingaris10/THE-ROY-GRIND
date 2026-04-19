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
    if (entries[key]) result.push(entries[key]);
  }
  return result;
}

export function detectRedFlags(data: AppData): RedFlag[] {
  const flags: RedFlag[] = [];
  const last14 = getLastNDaysEntries(data.entries, 14);
  const last7 = getLastNDaysEntries(data.entries, 7);

  const weights14 = last14.filter(e => e.weight != null).map(e => e.weight!);
  if (weights14.length >= 4) {
    const first7 = last14.slice(7).filter(e => e.weight != null).map(e => e.weight!);
    const last7W = last14.slice(0, 7).filter(e => e.weight != null).map(e => e.weight!);
    if (first7.length >= 2 && last7W.length >= 2) {
      const firstAvg = first7.reduce((a, b) => a + b, 0) / first7.length;
      const lastAvg = last7W.reduce((a, b) => a + b, 0) / last7W.length;
      const pct = ((firstAvg - lastAvg) / firstAvg) * 100;
      if (pct > 1.2) {
        flags.push({ level: 'critical', message: `Rapid weight loss: ${pct.toFixed(1)}% over 2 weeks. Risk of muscle loss.` });
      }
      if (pct >= 0 && pct < 0.3 && weights14.length >= 6) {
        flags.push({ level: 'warning', message: `Weight stall: <0.3% loss over 2 weeks. Consider adjusting.` });
      }
    }
  }

  const sleepEntries = last7.filter(e => e.sleep != null);
  if (sleepEntries.filter(e => e.sleep! < 6).length >= 3) {
    flags.push({ level: 'critical', message: `Poor sleep: under 6hrs for 3+ of last 7 days.` });
  }

  if (last7.filter(e => e.recovery != null && e.recovery! < 5).length >= 3) {
    flags.push({ level: 'warning', message: `Low recovery: rated <5 for 3+ of last 7 days.` });
  }

  if (last7.filter(e => e.mood != null && e.mood! < 4).length >= 3) {
    flags.push({ level: 'warning', message: `Low motivation: rated <4 for 3+ of last 7 days.` });
  }

  return flags;
}
