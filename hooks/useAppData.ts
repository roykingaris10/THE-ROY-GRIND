import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppData, DailyEntry, SetLog, WorkoutSession, UserProfile } from '@/types';
import { loadData, saveData, saveImmediate, addSetToData, clearAllData } from '@/lib/storage';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<AppData | null>(null);

  useEffect(() => {
    loadData().then(d => {
      setData(d);
      ref.current = d;
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const d = await loadData();
    setData(d);
    ref.current = d;
  }, []);

  const apply = useCallback((newData: AppData) => {
    setData(newData);
    ref.current = newData;
  }, []);

  const updateEntry = useCallback(async (date: string, updates: Partial<DailyEntry>) => {
    if (!ref.current) return;
    const existing = ref.current.entries[date] || { date };
    const newData: AppData = {
      ...ref.current,
      entries: { ...ref.current.entries, [date]: { ...existing, ...updates, date } },
    };
    apply(newData);
    await saveData(newData);
  }, [apply]);

  const addSet = useCallback(async (set: Omit<SetLog, 'id' | 'e1rm' | 'isPR'>): Promise<SetLog> => {
    if (!ref.current) throw new Error('Data not loaded');
    const result = addSetToData(ref.current, set);
    apply(result.data);
    await saveData(result.data);
    return result.entry;
  }, [apply]);

  const removeSet = useCallback(async (id: string) => {
    if (!ref.current) return;
    const newData = { ...ref.current, sets: ref.current.sets.filter(s => s.id !== id) };
    apply(newData);
    await saveData(newData);
  }, [apply]);

  const upsertSession = useCallback(async (session: WorkoutSession) => {
    if (!ref.current) return;
    const existing = ref.current.sessions.findIndex(s => s.id === session.id);
    const sessions = [...ref.current.sessions];
    if (existing >= 0) sessions[existing] = session;
    else sessions.push(session);
    const newData = { ...ref.current, sessions };
    apply(newData);
    await saveData(newData);
  }, [apply]);

  const updateSettings = useCallback(async (updates: Partial<AppData['settings']>) => {
    if (!ref.current) return;
    const newData: AppData = {
      ...ref.current,
      settings: { ...ref.current.settings, ...updates },
    };
    apply(newData);
    await saveImmediate(newData);
  }, [apply]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!ref.current) return;
    const newData: AppData = {
      ...ref.current,
      profile: { ...ref.current.profile, ...updates },
    };
    apply(newData);
    await saveImmediate(newData);
  }, [apply]);

  const resetAllData = useCallback(async () => {
    await clearAllData();
    await refresh();
  }, [refresh]);

  return {
    data, loading, refresh,
    updateEntry, addSet, removeSet, upsertSession,
    updateSettings, updateProfile, resetAllData,
  };
}
