import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, SetLog } from '@/types';
import { PROGRAM_START_DEFAULT } from './constants';
import { getEstimated1RM } from './helpers';

const STORAGE_KEY = 'invictus-data-v1';
const LEGACY_KEY = 'royforge-data-v1';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function getDefaultData(): AppData {
  return {
    profile: {
      age: 24,
      sex: 'male',
      heightCm: 180,
      startingWeight: 130,
    },
    entries: {},
    sets: [],
    sessions: [],
    settings: {
      programStart: PROGRAM_START_DEFAULT,
      reminderEnabled: false,
      reminderTime: '21:00',
      showStretchTargets: false,
      autoSyncSteps: true,
      defaultEbikeMinutesPerDay: 20,
      onboardingComplete: false,
    },
  };
}

export async function loadData(): Promise<AppData> {
  try {
    let raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      if (raw) {
        await AsyncStorage.setItem(STORAGE_KEY, raw);
        await AsyncStorage.removeItem(LEGACY_KEY);
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      return {
        ...getDefaultData(),
        ...parsed,
        profile: { ...getDefaultData().profile, ...parsed.profile },
        settings: { ...getDefaultData().settings, ...parsed.settings },
      };
    }
    return getDefaultData();
  } catch {
    return getDefaultData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  if (saveTimeout) clearTimeout(saveTimeout);
  return new Promise((resolve) => {
    saveTimeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save:', e);
      }
      resolve();
    }, 500);
  });
}

export async function saveImmediate(data: AppData): Promise<void> {
  if (saveTimeout) clearTimeout(saveTimeout);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

export function addSetToData(data: AppData, set: Omit<SetLog, 'id' | 'e1rm' | 'isPR'>): { data: AppData; entry: SetLog } {
  const e1rm = getEstimated1RM(set.weight, set.reps);
  let isPR = false;

  if (set.isMain && set.liftType) {
    const prevBest = Math.max(0, ...data.sets
      .filter(s => s.liftType === set.liftType && s.isMain)
      .map(s => s.e1rm || 0));
    isPR = e1rm > prevBest && prevBest > 0;
  }

  const entry: SetLog = {
    ...set,
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    e1rm,
    isPR,
  };

  return {
    data: { ...data, sets: [...data.sets, entry] },
    entry,
  };
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(LEGACY_KEY);
}

export async function exportData(): Promise<string> {
  const data = await loadData();
  return JSON.stringify(data, null, 2);
}
