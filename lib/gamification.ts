import type { AppData, GamificationLevel, Achievement, VirtueStats, GamificationState } from '@/types';
import { getDateString, getBestE1RM } from './helpers';

export const LEVELS: GamificationLevel[] = [
  { level: 1, name: 'Catechumen', xpRequired: 0, icon: '\u2720' },
  { level: 2, name: 'Reader', xpRequired: 100, icon: '\u{1F4D6}' },
  { level: 3, name: 'Subdeacon', xpRequired: 300, icon: '\u{1F56F}' },
  { level: 4, name: 'Deacon', xpRequired: 600, icon: '\u2626' },
  { level: 5, name: 'Priest', xpRequired: 1000, icon: '\u{1F3DB}' },
  { level: 6, name: 'Archpriest', xpRequired: 1600, icon: '\u2654' },
  { level: 7, name: 'Bishop', xpRequired: 2400, icon: '\u{1F451}' },
  { level: 8, name: 'Archbishop', xpRequired: 3500, icon: '\u269C' },
  { level: 9, name: 'Metropolitan', xpRequired: 5000, icon: '\u{1F31F}' },
  { level: 10, name: 'Patriarch', xpRequired: 7000, icon: '\u{1FA90}' },
  { level: 11, name: 'Desert Father', xpRequired: 10000, icon: '\u{1F3D4}' },
  { level: 12, name: 'Saint', xpRequired: 15000, icon: '\u{1F607}' },
];

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_fruits', name: 'First Fruits', description: 'Log your first working set', icon: '\u{1F33E}', category: 'training' },
  { id: 'iron_sharpens', name: 'Iron Sharpens Iron', description: 'Log 100 working sets (Prov 27:17)', icon: '\u2694', category: 'training' },
  { id: 'mighty_strength', name: 'Mighty in Strength', description: 'Estimated total over 400kg (Psalm 24:8)', icon: '\u{1F4AA}', category: 'training' },
  { id: 'samsons_strength', name: "Samson's Strength", description: 'Estimated total over 500kg', icon: '\u{1F981}', category: 'training' },
  { id: 'temple_builder', name: 'Temple Builder', description: 'Complete all workouts in a week', icon: '\u{1F3DB}', category: 'training' },
  { id: 'good_fight', name: 'The Good Fight', description: 'Complete 4 weeks of training (2 Tim 4:7)', icon: '\u{1F396}', category: 'training' },
  { id: 'daily_bread', name: 'Daily Bread', description: 'Log nutrition for 7 consecutive days (Matt 6:11)', icon: '\u{1F35E}', category: 'nutrition' },
  { id: 'faithful_steward', name: 'Faithful Steward', description: 'Hit calorie target for 14 days (Luke 12:42)', icon: '\u{1F3AF}', category: 'nutrition' },
  { id: 'temperance_virtue', name: 'Temperance', description: 'Stay within all macro targets for 7 days', icon: '\u{1F3C6}', category: 'nutrition' },
  { id: 'living_sacrifice', name: 'Living Sacrifice', description: 'Train during a deload week (Rom 12:1)', icon: '\u{1F525}', category: 'nutrition' },
  { id: 'daily_offering', name: 'Daily Offering', description: '7-day logging streak', icon: '\u{1F56F}', category: 'consistency' },
  { id: 'persistence_prayer', name: 'Persistence in Prayer', description: '21-day logging streak (Col 4:2)', icon: '\u{1F4FF}', category: 'consistency' },
  { id: 'forty_days', name: '40 Days in the Wilderness', description: '40-day logging streak (Matt 4:2)', icon: '\u{1F3DC}', category: 'consistency' },
  { id: 'resurrection', name: 'Resurrection', description: 'Return to logging after 3+ days off', icon: '\u2626', category: 'consistency' },
  { id: 'pillar_of_faith', name: 'Pillar of Faith', description: 'Complete Block 1 (8 weeks)', icon: '\u{1F3DB}', category: 'milestone' },
  { id: 'burning_bush', name: 'Burning Bush', description: 'Hit your first PR (Exodus 3)', icon: '\u{1F525}', category: 'milestone' },
  { id: 'davids_stone', name: "David's Stone", description: 'Hit a benchmark lift target', icon: '\u{1FAA8}', category: 'milestone' },
  { id: 'mount_tabor', name: 'Mount Tabor', description: 'Lose 10kg from starting weight (Transfiguration)', icon: '\u26F0', category: 'milestone' },
  { id: 'theosis', name: 'Theosis', description: 'Complete all 32 weeks of the program', icon: '\u{1F31F}', category: 'milestone' },
  { id: 'body_temple', name: 'Body as Temple', description: 'Log weight, nutrition, and training in a single day', icon: '\u26EA', category: 'milestone' },
];

export function computeXP(data: AppData): number {
  let xp = 0;
  const workingSets = data.sets.filter(s => !s.isWarmup);
  xp += workingSets.length * 2;
  const prs = data.sets.filter(s => s.isPR);
  xp += prs.length * 50;
  xp += data.sessions.filter(s => s.completed).length * 25;
  const datesWithEntries = Object.keys(data.entries).filter(d => {
    const e = data.entries[d];
    return e.weight != null || e.calories != null || e.steps != null || e.sleep != null;
  });
  xp += datesWithEntries.length * 10;
  const { current } = computeStreak(data);
  const streakBonuses = Math.floor(current / 7);
  xp += streakBonuses * 30;
  const weeksWithSessions = new Set(data.sessions.filter(s => s.completed).map(s => s.week));
  const completedBlocks = [
    weeksWithSessions.has(8),
    weeksWithSessions.has(16),
    weeksWithSessions.has(26),
    weeksWithSessions.has(32),
  ].filter(Boolean).length;
  xp += completedBlocks * 100;
  return xp;
}

export function computeLevel(xp: number): { level: GamificationLevel; xpToNext: number; progress: number } {
  let current = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      break;
    }
  }
  const nextIdx = LEVELS.findIndex(l => l.level === current.level + 1);
  if (nextIdx === -1) {
    return { level: current, xpToNext: 0, progress: 1 };
  }
  const next = LEVELS[nextIdx];
  const range = next.xpRequired - current.xpRequired;
  const into = xp - current.xpRequired;
  return { level: current, xpToNext: next.xpRequired - xp, progress: range > 0 ? into / range : 1 };
}

export function computeStreak(data: AppData): { current: number; longest: number } {
  const dates = Object.keys(data.entries)
    .filter(d => {
      const e = data.entries[d];
      return e.weight != null || e.calories != null || e.steps != null || e.sleep != null;
    })
    .sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let currentRun = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentRun++;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = getDateString(new Date());
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  const lastDate = dates[dates.length - 1];
  let currentStreak = 0;
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const curr = new Date(dates[i + 1] + 'T00:00:00');
      const prev = new Date(dates[i] + 'T00:00:00');
      if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { current: currentStreak, longest: Math.max(longest, currentStreak) };
}

export function computeAchievements(data: AppData): Achievement[] {
  const workingSets = data.sets.filter(s => !s.isWarmup);
  const prs = data.sets.filter(s => s.isPR);
  const { current: streak, longest } = computeStreak(data);
  const sqE1rm = getBestE1RM(data.sets, 'squat');
  const bnE1rm = getBestE1RM(data.sets, 'bench');
  const dlE1rm = getBestE1RM(data.sets, 'deadlift');
  const total = sqE1rm + bnE1rm + dlE1rm;
  const weeksWithSessions = new Set(data.sessions.filter(s => s.completed).map(s => s.week));
  const latestWeight = getLatestWeight(data);

  const datesWithCalories = Object.keys(data.entries).filter(d => data.entries[d].calories != null).sort();
  let maxCalStreak = 0;
  let calStreak = 1;
  for (let i = 1; i < datesWithCalories.length; i++) {
    const diff = daysDiff(datesWithCalories[i - 1], datesWithCalories[i]);
    if (diff === 1) { calStreak++; maxCalStreak = Math.max(maxCalStreak, calStreak); }
    else calStreak = 1;
  }
  if (datesWithCalories.length === 1) maxCalStreak = 1;

  const hasReturnAfterGap = checkReturnAfterGap(data);
  const hasFullDayLog = Object.values(data.entries).some(e =>
    e.weight != null && e.calories != null && data.sessions.some(s => s.date === e.date && s.completed)
  );

  const conditions: Record<string, boolean> = {
    first_fruits: workingSets.length >= 1,
    iron_sharpens: workingSets.length >= 100,
    mighty_strength: total >= 400,
    samsons_strength: total >= 500,
    temple_builder: checkFullWeek(data),
    good_fight: weeksWithSessions.size >= 4,
    daily_bread: maxCalStreak >= 7,
    faithful_steward: maxCalStreak >= 14,
    temperance_virtue: maxCalStreak >= 7,
    living_sacrifice: data.sessions.some(s => s.completed && [4, 8, 12, 16, 20, 24, 30].includes(s.week)),
    daily_offering: longest >= 7,
    persistence_prayer: longest >= 21,
    forty_days: longest >= 40,
    resurrection: hasReturnAfterGap,
    pillar_of_faith: Array.from({ length: 8 }, (_, i) => i + 1).some(w => weeksWithSessions.has(w)) && weeksWithSessions.has(8),
    burning_bush: prs.length >= 1,
    davids_stone: false,
    mount_tabor: latestWeight != null && (data.profile.startingWeight - latestWeight) >= 10,
    theosis: weeksWithSessions.has(32),
    body_temple: hasFullDayLog,
  };

  return ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: conditions[a.id] ?? false }));
}

export function computeVirtues(data: AppData): VirtueStats {
  const { current: streak } = computeStreak(data);
  const discipline = Math.min(100, Math.round((streak / 30) * 100));

  const entriesWithCal = Object.values(data.entries).filter(e => e.calories != null);
  const totalEntries = entriesWithCal.length;
  const temperance = totalEntries > 0
    ? Math.min(100, Math.round((totalEntries / Math.max(totalEntries, 30)) * 100))
    : 0;

  const completedSessions = data.sessions.filter(s => s.completed).length;
  const fortitude = Math.min(100, Math.round((completedSessions / Math.max(completedSessions, 40)) * 100));

  const weeksWithData = new Set([
    ...Object.keys(data.entries).map(d => getWeekFromDate(d, data.settings.programStart)),
    ...data.sessions.map(s => s.week),
  ]);
  const perseverance = Math.min(100, Math.round((weeksWithData.size / 32) * 100));

  return { discipline, temperance, fortitude, perseverance };
}

export function computeGamification(data: AppData): GamificationState {
  const xp = computeXP(data);
  const { level, xpToNext, progress } = computeLevel(xp);
  const { current: streak, longest: longestStreak } = computeStreak(data);
  const achievements = computeAchievements(data);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const virtues = computeVirtues(data);

  return { xp, level, xpToNext, levelProgress: progress, streak, longestStreak, achievements, unlockedCount, virtues };
}

function getLatestWeight(data: AppData): number | null {
  const withWeight = Object.values(data.entries)
    .filter(e => e.weight != null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return withWeight.length > 0 ? withWeight[0].weight! : null;
}

function daysDiff(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
}

function checkReturnAfterGap(data: AppData): boolean {
  const dates = Object.keys(data.entries)
    .filter(d => {
      const e = data.entries[d];
      return e.weight != null || e.calories != null;
    })
    .sort();
  for (let i = 1; i < dates.length; i++) {
    if (daysDiff(dates[i - 1], dates[i]) >= 3) return true;
  }
  return false;
}

function checkFullWeek(data: AppData): boolean {
  const sessionsByWeek: Record<number, Set<number>> = {};
  data.sessions.filter(s => s.completed).forEach(s => {
    if (!sessionsByWeek[s.week]) sessionsByWeek[s.week] = new Set();
    sessionsByWeek[s.week].add(s.dayIndex);
  });
  return Object.values(sessionsByWeek).some(days => days.size >= 4);
}

function getWeekFromDate(dateStr: string, programStart: string): number {
  const start = new Date(programStart + 'T00:00:00');
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diff / 7) + 1);
}
