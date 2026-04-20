import { useState, useEffect } from 'react';
import { pickDailyTheme, getVerseReference, fetchVerse, type VerseData, type VerseTheme } from '@/lib/bibleApi';
import type { LiturgicalDay } from '@/lib/orthocal';

export function useDailyVerse(week: number, liturgicalDay: LiturgicalDay | null, averageReadiness?: number) {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [theme, setTheme] = useState<VerseTheme>('athletic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const today = new Date();
    const pickedTheme = pickDailyTheme(week, liturgicalDay, averageReadiness);
    setTheme(pickedTheme);
    const ref = getVerseReference(pickedTheme, today);
    fetchVerse(ref).then(v => {
      if (mounted) {
        setVerse(v);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [week, liturgicalDay, averageReadiness]);

  return { verse, theme, loading };
}
