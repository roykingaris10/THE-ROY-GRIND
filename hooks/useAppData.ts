import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppData, DailyEntry, LiftEntry } from '@/types';
import { loadData, saveData, saveDataImmediate, addLift as addLiftStorage, deleteLift as deleteLiftStorage, clearAllData } from '@/lib/storage';
import { getEstimated1RM } from '@/lib/helpers';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<AppData | null>(null);

  useEffect(() => {
    loadData().then(d => {
      setData(d);
      dataRef.current = d;
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const d = await loadData();
    setData(d);
    dataRef.current = d;
  }, []);

  const updateEntry = useCallback(async (date: string, updates: Partial<DailyEntry>) => {
    if (!dataRef.current) return;
    const current = dataRef.current;
    const existing = current.entries[date] || { date };
    const newData: AppData = {
      ...current,
      entries: {
        ...current.entries,
        [date]: { ...existing, ...updates, date },
      },
    };
    setData(newData);
    dataRef.current = newData;
    await saveData(newData);
  }, []);

  const addLift = useCallback(async (lift: Omit<LiftEntry, 'id' | 'e1rm'>): Promise<LiftEntry> => {
    if (!dataRef.current) throw new Error('Data not loaded');
    const result = await addLiftStorage(dataRef.current, lift);
    setData(result.data);
    dataRef.current = result.data;
    return result.entry;
  }, []);

  const removeLift = useCallback(async (id: string) => {
    if (!dataRef.current) return;
    const newData = await deleteLiftStorage(dataRef.current, id);
    setData(newData);
    dataRef.current = newData;
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppData['settings']>) => {
    if (!dataRef.current) return;
    const newData: AppData = {
      ...dataRef.current,
      settings: {
        ...dataRef.current.settings,
        ...updates,
      },
    };
    setData(newData);
    dataRef.current = newData;
    await saveDataImmediate(newData);
  }, []);

  const resetAllData = useCallback(async () => {
    await clearAllData();
    await refresh();
  }, [refresh]);

  return {
    data,
    loading,
    refresh,
    updateEntry,
    addLift,
    removeLift,
    updateSettings,
    resetAllData,
  };
}
