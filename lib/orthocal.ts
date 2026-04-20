import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LiturgicalDay {
  titles: string[];
  feasts: string[];
  saints: string[];
  fast_level: number;
  fast_level_desc: string;
  fast_exception_desc: string;
  readings: { book: string; display: string }[];
  tone?: number;
}

const CACHE_PREFIX = 'orthocal';

export async function fetchLiturgicalDay(date: Date): Promise<LiturgicalDay | null> {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const key = `${CACHE_PREFIX}-${y}-${m}-${d}`;

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const response = await fetch(`https://orthocal.info/api/oca/${y}/${m}/${d}/`);
    if (!response.ok) return null;

    const data = await response.json();
    const liturgical: LiturgicalDay = {
      titles: data.titles || [],
      feasts: data.feasts || [],
      saints: data.saints || [],
      fast_level: data.fast_level ?? 0,
      fast_level_desc: data.fast_level_desc || '',
      fast_exception_desc: data.fast_exception_desc || '',
      readings: (data.readings || []).map((r: { book: string; display: string }) => ({
        book: r.book || '',
        display: r.display || '',
      })),
      tone: data.tone,
    };

    await AsyncStorage.setItem(key, JSON.stringify(liturgical));
    return liturgical;
  } catch {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return JSON.parse(cached);
    return null;
  }
}

export function isFastingDay(day: LiturgicalDay): boolean {
  return day.fast_level > 0;
}

export function isMajorFeast(day: LiturgicalDay): boolean {
  return day.feasts.length > 0;
}
