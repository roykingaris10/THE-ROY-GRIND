import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, DailyEntry, LiftEntry } from '@/types';
import { PROGRAM_START_DEFAULT } from './constants';
import { getEstimated1RM } from './helpers';

const STORAGE_KEY = 'grind-data-v1';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function getDefaultData(): AppData {
  return {
    entries: {},
    lifts: [],
    settings: {
      programStart: PROGRAM_START_DEFAULT,
      reminderEnabled: false,
      reminderTime: '21:00',
      onboardingComplete: false,
    },
  };
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      // Ensure all fields exist with defaults
      return {
        ...getDefaultData(),
        ...parsed,
        settings: {
          ...getDefaultData().settings,
          ...parsed.settings,
        },
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
        console.error('Failed to save data:', e);
      }
      resolve();
    }, 500);
  });
}

export async function saveDataImmediate(data: AppData): Promise<void> {
  if (saveTimeout) clearTimeout(saveTimeout);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export async function updateEntry(
  data: AppData,
  date: string,
  updates: Partial<DailyEntry>
): Promise<AppData> {
  const existing = data.entries[date] || { date };
  const newData: AppData = {
    ...data,
    entries: {
      ...data.entries,
      [date]: { ...existing, ...updates, date },
    },
  };
  await saveData(newData);
  return newData;
}

export async function addLift(
  data: AppData,
  lift: Omit<LiftEntry, 'id' | 'e1rm'>
): Promise<{ data: AppData; entry: LiftEntry }> {
  const entry: LiftEntry = {
    ...lift,
    id: Date.now().toString(),
    e1rm: getEstimated1RM(lift.weight, lift.reps),
  };
  const newData: AppData = {
    ...data,
    lifts: [...data.lifts, entry],
  };
  await saveData(newData);
  return { data: newData, entry };
}

export async function deleteLift(data: AppData, id: string): Promise<AppData> {
  const newData: AppData = {
    ...data,
    lifts: data.lifts.filter(l => l.id !== id),
  };
  await saveData(newData);
  return newData;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function exportData(): Promise<string> {
  const data = await loadData();
  return JSON.stringify(data, null, 2);
}
