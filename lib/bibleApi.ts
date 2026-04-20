import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '@/types';
import { DELOAD_WEEKS } from '@/lib/constants';
import type { LiturgicalDay } from '@/lib/orthocal';

export interface VerseData {
  reference: string;
  text: string;
  translation_name: string;
}

type VerseTheme = 'perseverance' | 'discipline' | 'body_as_temple' | 'athletic' |
  'humility' | 'fasting' | 'rest' | 'struggle' | 'victory' | 'patience';

const THEME_VERSES: Record<VerseTheme, string[]> = {
  athletic: [
    '2 Timothy 4:7', '1 Corinthians 9:24-27', 'Hebrews 12:1-2',
    'Philippians 3:13-14', '2 Timothy 2:5',
  ],
  perseverance: [
    'James 1:2-4', 'Romans 5:3-5', 'Hebrews 10:36', 'James 1:12', 'Galatians 6:9',
  ],
  discipline: [
    'Proverbs 25:28', '1 Corinthians 9:27', 'Hebrews 12:11', '2 Timothy 1:7',
  ],
  body_as_temple: [
    '1 Corinthians 6:19-20', 'Romans 12:1', '1 Corinthians 3:16-17',
  ],
  humility: [
    'James 4:6', 'Philippians 2:3', 'Proverbs 11:2', 'Matthew 23:12',
  ],
  fasting: [
    'Matthew 6:16-18', 'Isaiah 58:6-9', 'Joel 2:12-13',
  ],
  rest: [
    'Psalm 23:1-3', 'Matthew 11:28-30', 'Exodus 33:14', 'Mark 6:31',
  ],
  struggle: [
    'Ephesians 6:12', '2 Corinthians 4:8-9', 'Psalm 34:17-19',
  ],
  victory: [
    'Romans 8:37', '1 John 5:4', '1 Corinthians 15:57', '2 Corinthians 2:14',
  ],
  patience: [
    'Lamentations 3:25-26', 'Psalm 27:14', 'Romans 12:12', 'James 5:7-8',
  ],
};

const FALLBACK_VERSES: VerseData[] = [
  { reference: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', translation_name: 'KJV' },
  { reference: '2 Timothy 4:7', text: 'I have fought a good fight, I have finished my course, I have kept the faith.', translation_name: 'KJV' },
  { reference: '1 Corinthians 9:27', text: 'But I keep under my body, and bring it into subjection: lest that by any means, when I have preached to others, I myself should be a castaway.', translation_name: 'KJV' },
  { reference: 'Hebrews 12:1', text: 'Let us run with patience the race that is set before us.', translation_name: 'KJV' },
  { reference: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.', translation_name: 'KJV' },
  { reference: 'Psalm 23:1-3', text: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.', translation_name: 'KJV' },
  { reference: 'Romans 5:3-4', text: 'We glory in tribulations also: knowing that tribulation worketh patience; And patience, experience; and experience, hope.', translation_name: 'KJV' },
  { reference: 'James 1:2-4', text: 'Count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience.', translation_name: 'KJV' },
  { reference: 'Isaiah 40:31', text: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.', translation_name: 'KJV' },
  { reference: 'Romans 8:37', text: 'In all these things we are more than conquerors through him that loved us.', translation_name: 'KJV' },
];

export function pickDailyTheme(
  week: number,
  liturgical: LiturgicalDay | null,
  averageReadiness?: number,
): VerseTheme {
  if (liturgical && liturgical.fast_level > 0) return 'fasting';
  if (DELOAD_WEEKS.includes(week)) return 'rest';
  if (week >= 27) return 'victory';
  if (averageReadiness !== undefined && averageReadiness < 60) return 'perseverance';
  if (week <= 4) return 'discipline';
  if (week >= 13 && week <= 16) return 'patience';

  const general: VerseTheme[] = ['athletic', 'struggle', 'body_as_temple', 'humility'];
  const dayIndex = new Date().getDate() % general.length;
  return general[dayIndex];
}

export function getVerseReference(theme: VerseTheme, date: Date): string {
  const verses = THEME_VERSES[theme];
  const idx = (date.getDate() + date.getMonth()) % verses.length;
  return verses[idx];
}

export async function fetchVerse(reference: string): Promise<VerseData> {
  const cacheKey = `verse-${reference}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const encoded = encodeURIComponent(reference);
    const r = await fetch(`https://bible-api.com/${encoded}?translation=kjv`);
    if (!r.ok) throw new Error('API failed');

    const data = await r.json();
    const verse: VerseData = {
      reference: data.reference || reference,
      text: data.text?.trim() || '',
      translation_name: data.translation_name || 'KJV',
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(verse));
    return verse;
  } catch {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    const fallbackIdx = new Date().getDate() % FALLBACK_VERSES.length;
    return FALLBACK_VERSES[fallbackIdx];
  }
}

export { FALLBACK_VERSES, THEME_VERSES };
export type { VerseTheme };
